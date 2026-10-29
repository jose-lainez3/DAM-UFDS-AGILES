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

    /**
     * Lista los pedidos (más recientes primero).
     * Filtro opcional: /pedidos?estado=pendiente,preparacion
     */
    public function index(Request $request)
    {
        $query = Pedido::with(self::RELACIONES)->orderByDesc('id');

        if ($request->filled('estado')) {
            $query->whereIn('estado', array_map('trim', explode(',', $request->query('estado'))));
        }

        return response()->json($query->get(), 200);
    }

    /**
     * Crea un pedido. Si se envía "detalles" ([{producto_id, cantidad}, ...]) el
     * servidor toma los precios de la base de datos, calcula subtotales e impuesto
     * y guarda todo en una sola transacción. Además marca la mesa como ocupada.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'nullable|exists:clientes,id',
            'mesa_id' => 'nullable|exists:mesas,id',
            'usuario_id' => 'nullable|exists:usuarios,id',
            'precio_total' => 'required_without:detalles|nullable|numeric|min:0',
            'estado' => ['nullable', Rule::in(Pedido::ESTADOS)],
            'detalles' => 'nullable|array|min:1',
            'detalles.*.producto_id' => 'required|exists:productos,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
        ]);

        if (!empty($validated['mesa_id'])) {
            $mesa = Mesa::find($validated['mesa_id']);
            if ($mesa && $mesa->estado === 'ocupada') {
                throw ValidationException::withMessages([
                    'mesa_id' => "La mesa {$mesa->numero_mesa} ya está ocupada."
                ]);
            }
        }

        $pedido = DB::transaction(function () use ($validated, $request) {
            $pedido = Pedido::create([
                'cliente_id' => $validated['cliente_id'] ?? null,
                'mesa_id' => $validated['mesa_id'] ?? null,
                'usuario_id' => $validated['usuario_id'] ?? $request->user()->id,
                'fecha_pedido' => now(),
                'precio_total' => $validated['precio_total'] ?? 0,
                'estado' => $validated['estado'] ?? 'pendiente',
            ]);

            if (!empty($validated['detalles'])) {
                $subtotal = 0;

                foreach ($validated['detalles'] as $linea) {
                    $producto = Producto::findOrFail($linea['producto_id']);

                    if (!$producto->disponible) {
                        throw ValidationException::withMessages([
                            'detalles' => "El producto \"{$producto->nombre}\" no está disponible."
                        ]);
                    }

                    $lineaSubtotal = round($producto->precio * $linea['cantidad'], 2);

                    $pedido->detalles()->create([
                        'producto_id' => $producto->id,
                        'cantidad' => $linea['cantidad'],
                        'precio_unitario' => $producto->precio,
                        'subtotal' => $lineaSubtotal,
                    ]);

                    $subtotal += $lineaSubtotal;
                }

                $total = round($subtotal * (1 + config('foodorder.tasa_impuesto')), 2);
                $pedido->update(['precio_total' => $total]);
            }

            if ($pedido->mesa_id && !in_array($pedido->estado, Pedido::ESTADOS_FINALES, true)) {
                Mesa::where('id', $pedido->mesa_id)->update(['estado' => 'ocupada']);
            }

            return $pedido;
        });

        return response()->json([
            'message' => 'Pedido registrado con éxito',
            'data' => $pedido->load(self::RELACIONES)
        ], 201);
    }

    public function show(Pedido $pedido)
    {
        return response()->json($pedido->load(self::RELACIONES), 200);
    }

    /**
     * Actualiza el pedido (normalmente su estado). Al pasar a "pagado" o
     * "cancelado" la mesa queda libre si no tiene otros pedidos activos.
     */
    public function update(Request $request, Pedido $pedido)
    {
        $validated = $request->validate([
            'estado' => ['sometimes', Rule::in(Pedido::ESTADOS)],
            'precio_total' => 'sometimes|numeric|min:0',
            'cliente_id' => 'sometimes|nullable|exists:clientes,id',
            'mesa_id' => 'sometimes|nullable|exists:mesas,id',
        ]);

        $pedido->update($validated);

        if (isset($validated['estado']) && in_array($validated['estado'], Pedido::ESTADOS_FINALES, true)) {
            $pedido->liberarMesaSiCorresponde();
        }

        return response()->json([
            'message' => 'Pedido actualizado con éxito',
            'data' => $pedido->load(self::RELACIONES)
        ], 200);
    }

    public function destroy(Pedido $pedido)
    {
        $pedido->delete();
        $pedido->liberarMesaSiCorresponde();

        return response()->json(['message' => 'Pedido eliminado con éxito'], 200);
    }
}
