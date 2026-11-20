<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use App\Models\Pedido;
use App\Services\WompiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class PagoController extends Controller
{
    public function crearEnlace(Request $request, Pedido $pedido, WompiService $wompi)
    {
        $usuario = $request->user();
        abort_unless($usuario, 401);

        if (strcasecmp((string) $usuario->rol?->nombre, 'Cliente') === 0) {
            abort_unless((int) $pedido->usuario_id === (int) $usuario->id, 403);
        }

        if (!$wompi->configurado()) {
            return response()->json(['message' => 'Los pagos en línea todavía no están configurados.'], 503);
        }

        try {
            $pago = DB::transaction(function () use ($pedido, $wompi) {
                $pedido = Pedido::whereKey($pedido->id)->lockForUpdate()->firstOrFail();

                abort_if(in_array($pedido->estado, Pedido::ESTADOS_FINALES, true), 409, 'El pedido ya está cerrado.');
                abort_if((float) $pedido->precio_total < 0.01, 422, 'El pedido no tiene un importe válido.');

                $pago = Pago::where('pedido_id', $pedido->id)->lockForUpdate()->first();

                if ($pago) {
                    abort_if($pago->estado !== 'pendiente', 409, 'Este pago ya fue procesado o requiere revisión.');
                    if ($pago->url_pago) {
                        return $pago;
                    }
                } else {
                    $pago = Pago::create([
                        'pedido_id' => $pedido->id,
                        'proveedor' => 'wompi',
                        'referencia' => 'FO-' . $pedido->id . '-' . Str::uuid(),
                        'monto' => $pedido->precio_total,
                        'estado' => 'pendiente',
                    ]);
                }

                $enlace = $wompi->crearEnlace($pago);

                $pago->update([
                    'enlace_id' => $enlace['id'],
                    'url_pago' => $enlace['url'],
                    'es_productivo' => $enlace['produccion'],
                ]);

                return $pago;
            }, 2);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpExceptionInterface $e) {
            throw $e;
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'message' => 'No se pudo generar el enlace. Inténtalo nuevamente.',
            ], Response::HTTP_BAD_GATEWAY);
        }

        return response()->json([
            'estado' => $pago->estado,
            'url_pago' => $pago->url_pago,
            'es_productivo' => $pago->es_productivo,
        ]);
    }
}
