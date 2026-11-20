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
            return response()->json([
                'message' => 'Wompi requiere credenciales y APP_URL HTTPS público en Laravel.',
            ], 503);
        }

        $pago = DB::transaction(function () use ($pedido, $wompi) {
            $pedido = Pedido::whereKey($pedido->id)->lockForUpdate()->firstOrFail();

            abort_if(in_array($pedido->estado, Pedido::ESTADOS_FINALES, true), 409, 'El pedido ya está cerrado.');
            abort_if($pedido->documentoFiscal()->exists(), 409, 'Ya existe una solicitud de facturación para el pedido.');
            abort_if((float) $pedido->precio_total < 0.01, 422, 'El pedido no tiene un importe válido.');

            $pago = Pago::where('pedido_id', $pedido->id)->lockForUpdate()->first();
            if ($pago) {
                if ($pago->estado === 'pendiente' && $pago->url_pago) {
                    return $pago; // Reutilizar enlace seguro.
                }
                abort(409, 'Existe un enlace en proceso, conciliación o pago registrado. No intentes cobrar otra vez.');
            }

            // Persistir la referencia ANTES de hablar con Wompi. Un timeout puede
            // dejar un enlace remoto vivo; nunca crearlo por segunda vez a ciegas.
            return Pago::create([
                'pedido_id' => $pedido->id,
                'proveedor' => 'wompi',
                'referencia' => 'FO-' . $pedido->id . '-' . Str::uuid(),
                'monto' => $pedido->precio_total,
                'estado' => 'creando',
            ]);
        });

        if ($pago->estado === 'pendiente' && $pago->url_pago) {
            return response()->json([
                'estado' => $pago->estado,
                'url_pago' => $pago->url_pago,
                'es_productivo' => $pago->es_productivo,
            ]);
        }

        try {
            $enlace = $wompi->crearEnlace($pago);
            $pago->update([
                'estado' => 'pendiente',
                'enlace_id' => $enlace['id'],
                'url_pago' => $enlace['url'],
                'es_productivo' => $enlace['produccion'],
            ]);
        } catch (Throwable $e) {
            report($e);
            $pago->update(['estado' => 'revision']);
            return response()->json([
                'message' => 'Wompi no confirmó la creación del enlace. Revisa la referencia en el panel del comercio; no intentes un segundo cobro.',
            ], Response::HTTP_BAD_GATEWAY);
        }

        return response()->json([
            'estado' => $pago->estado,
            'url_pago' => $pago->url_pago,
            'es_productivo' => $pago->es_productivo,
        ]);
    }
}
