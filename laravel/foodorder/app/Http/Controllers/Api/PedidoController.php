<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PedidoController extends Controller
{
    private const RELACIONES = ['cliente', 'mesa', 'usuario', 'detalles.producto'];

    private function esCliente($usuario): bool
    {
        return $usuario?->rol?->nombre === 'Cliente';
    }

    private function clienteAutenticado($usuario)
    {
        $cliente = $usuario->cliente;
        if (!$cliente) {
            throw ValidationException::withMessages([
                'cliente_id' => 'Tu cuenta no tiene un cliente asociado. Contacta con el administrador.',
            ]);
        }
        return $cliente;
    }

    private function verificarAcceso(Request $request, Pedido $pedido): void
    {
        $usuario = $request->user();
        abort_unless($usuario, 401, 'Debes iniciar sesión.');

        if ($this->esCliente($usuario)) {
            abort_unless((int) $pedido->usuario_id === (int) $usuario->id, 403, 'No puedes acceder a este pedido.');
        }
    }

    private function liberarMesaSiCorresponde(?int $mesaId): void
    {
        if (!$mesaId) return;

        $hayActivos = Pedido::where('mesa_id', $mesaId)
            ->whereNotIn('estado', Pedido::ESTADOS_FINALES)
            ->exists();

        if (!$hayActivos) {
            Mesa::whereKey($mesaId)->update(['estado' => 'disponible']);
        }
    }

    public function index(Request $request)
{
    $usuario = $request->user();

    $query = Pedido::with(self::RELACIONES)
        ->orderByDesc('id');

    if (
        $usuario &&
        $usuario->rol &&
        strcasecmp($usuario->rol->nombre, 'Cliente') === 0
    ) {
        $cliente = \App\Models\Cliente::where(
            'usuario_id',
            $usuario->id
        )->first();

        if (!$cliente) {
            return response()->json([], 200);
        }

        $query->where('cliente_id', $cliente->id);
    }

    if ($request->filled('estado')) {
        $estados = array_map(
            'trim',
            explode(',', $request->query('estado'))
        );

        $query->whereIn('estado', $estados);
    }

    return response()->json($query->get(), 200);
}

    public function store(Request $request)
    {
        $usuario = $request->user();
        abort_unless($usuario, 401, 'Debes iniciar sesión.');

        $esCliente = $this->esCliente($usuario);
        $validated = $request->validate([
            'cliente_id' => [$esCliente ? 'nullable' : 'required', 'integer', 'exists:clientes,id'],
            'mesa_id' => 'nullable|integer|exists:mesas,id',
            'precio_total' => 'required_without:detalles|nullable|numeric|min:0',
            'estado' => ['nullable', Rule::in(Pedido::ESTADOS)],
            'detalles' => 'nullable|array|min:1',
            'detalles.*.producto_id' => 'required|integer|exists:productos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
        ], [
            'cliente_id.required' => 'Debes seleccionar un cliente antes de confirmar el pedido.',
            'cliente_id.exists' => 'El cliente seleccionado no existe.',
        ]);

        $clienteId = $esCliente
            ? $this->clienteAutenticado($usuario)->id
            : (int) $validated['cliente_id'];

        // Los clientes no pueden escoger el estado ni el usuario propietario.
        $estado = $esCliente ? 'pendiente' : ($validated['estado'] ?? 'pendiente');

        $pedido = DB::transaction(function () use ($validated, $usuario, $clienteId, $estado) {
            $mesa = null;
            if (!empty($validated['mesa_id'])) {
                $mesa = Mesa::whereKey($validated['mesa_id'])->lockForUpdate()->firstOrFail();
                if ($mesa->estado !== 'disponible') {
                    throw ValidationException::withMessages([
                        'mesa_id' => "La mesa {$mesa->numero_mesa} no está disponible.",
                    ]);
                }
            }

            $pedido = Pedido::create([
                'cliente_id' => $clienteId,
                'mesa_id' => $validated['mesa_id'] ?? null,
                'usuario_id' => $usuario->id,
                'fecha_pedido' => now(),
                'precio_total' => $validated['precio_total'] ?? 0,
                'estado' => $estado,
            ]);

            if (!empty($validated['detalles'])) {
                $subtotal = 0;
                foreach ($validated['detalles'] as $linea) {
                    $producto = Producto::findOrFail($linea['producto_id']);
                    if (!$producto->disponible) {
                        throw ValidationException::withMessages([
                            'detalles' => "El producto \"{$producto->nombre}\" no está disponible.",
                        ]);
                    }

                    $lineaSubtotal = round((float) $producto->precio * (int) $linea['cantidad'], 2);
                    $pedido->detalles()->create([
                        'producto_id' => $producto->id,
                        'cantidad' => $linea['cantidad'],
                        'precio_unitario' => $producto->precio,
                        'subtotal' => $lineaSubtotal,
                    ]);
                    $subtotal += $lineaSubtotal;
                }

                $tasa = (float) config('foodorder.tasa_impuesto', 0.13);
                $pedido->update(['precio_total' => round($subtotal * (1 + $tasa), 2)]);
            }

            if ($mesa && !in_array($pedido->estado, Pedido::ESTADOS_FINALES, true)) {
                $mesa->update(['estado' => 'ocupada']);
            }

            return $pedido;
        });

        return response()->json([
            'message' => 'Pedido registrado con éxito',
            'data' => $pedido->load(self::RELACIONES),
        ], 201);
    }

    public function show(Request $request, Pedido $pedido)
    {
        $this->verificarAcceso($request, $pedido);
        return response()->json($pedido->load(self::RELACIONES), 200);
    }

    public function update(Request $request, Pedido $pedido)
    {
        $this->verificarAcceso($request, $pedido);
        $usuario = $request->user();
        $esCliente = $this->esCliente($usuario);

        if ($esCliente) {
            $validated = $request->validate([
                'estado' => ['required', Rule::in(['cancelado'])],
            ]);
            if ($pedido->estado !== 'pendiente') {
                throw ValidationException::withMessages([
                    'estado' => 'Solo puedes cancelar pedidos pendientes.',
                ]);
            }
        } else {
            $validated = $request->validate([
                'estado' => ['sometimes', Rule::in(Pedido::ESTADOS)],
                'precio_total' => 'sometimes|numeric|min:0',
                'cliente_id' => 'sometimes|required|integer|exists:clientes,id',
                'mesa_id' => 'sometimes|nullable|integer|exists:mesas,id',
            ]);
        }

        DB::transaction(function () use ($pedido, $validated) {
            $pedido = Pedido::whereKey($pedido->id)->lockForUpdate()->firstOrFail();
            $anterior = $pedido->mesa_id;
            $nueva = array_key_exists('mesa_id', $validated) ? $validated['mesa_id'] : $anterior;
            $estado = $validated['estado'] ?? $pedido->estado;
            $activo = !in_array($estado, Pedido::ESTADOS_FINALES, true);
            $eraFinal = in_array($pedido->estado, Pedido::ESTADOS_FINALES, true);

            // Bloquear mesas en orden estable para reducir interbloqueos.
            $ids = array_values(array_unique(array_filter([$anterior, $nueva])));
            sort($ids);
            $mesas = Mesa::whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            if ($activo && $nueva && ($nueva != $anterior || $eraFinal)) {
                $mesaNueva = $mesas->get($nueva);
                if (!$mesaNueva || $mesaNueva->estado !== 'disponible') {
                    throw ValidationException::withMessages([
                        'mesa_id' => 'La mesa seleccionada no está disponible.',
                    ]);
                }
            }

            $pedido->update($validated);

            if ($anterior && ($anterior != $pedido->mesa_id || !$activo)) {
                $this->liberarMesaSiCorresponde((int) $anterior);
            }

            if ($activo && $pedido->mesa_id) {
                Mesa::whereKey($pedido->mesa_id)->update(['estado' => 'ocupada']);
            }
        });

        return response()->json([
            'message' => 'Pedido actualizado con éxito',
            'data' => $pedido->fresh()->load(self::RELACIONES),
        ], 200);
    }

    public function destroy(Request $request, Pedido $pedido)
    {
        $this->verificarAcceso($request, $pedido);
        abort_if($this->esCliente($request->user()), 403, 'No puedes eliminar pedidos.');

        DB::transaction(function () use ($pedido) {
            $pedido = Pedido::whereKey($pedido->id)->lockForUpdate()->firstOrFail();
            $mesaId = $pedido->mesa_id;
            if ($mesaId) {
                Mesa::whereKey($mesaId)->lockForUpdate()->first();
            }
            $pedido->delete();
            $this->liberarMesaSiCorresponde($mesaId ? (int) $mesaId : null);
        });

        return response()->json(['message' => 'Pedido eliminado con éxito'], 200);
    }
}
