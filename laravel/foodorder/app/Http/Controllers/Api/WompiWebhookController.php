<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WompiWebhookController extends Controller
{
    private function centavos(mixed $valor): ?int
    {
        if (!is_string($valor) && !is_int($valor) && !is_float($valor)) {
            return null;
        }

        $texto = (string) $valor;
        if (!preg_match('/^\d+(?:\.\d{1,2})?$/D', $texto)) {
            return null;
        }

        $partes = explode('.', $texto, 2);
        return ((int) $partes[0] * 100) + (int) str_pad($partes[1] ?? '', 2, '0');
    }

    public function handle(Request $request)
    {
        $secret = (string) config('services.wompi.client_secret', '');
        if ($secret === '') {
            return response()->json(['message' => 'Webhook no configurado.'], 503);
        }

        $firma = $request->header('wompi_hash', '');
        $esperada = hash_hmac('sha256', $request->getContent(), $secret);

        if (!is_string($firma) || !hash_equals($esperada, strtolower($firma))) {
            return response()->json(['message' => 'Firma inválida.'], 401);
        }

        $datos = json_decode($request->getContent(), true);
        if (!is_array($datos)) {
            return response()->json(['message' => 'JSON inválido.'], 422);
        }

        // Wompi utiliza este evento para las transacciones autorizadas.
        if (($datos['ResultadoTransaccion'] ?? null) !== 'ExitosaAprobada') {
            return response()->json(['recibido' => true]);
        }

        $referencia = data_get($datos, 'EnlacePago.IdentificadorEnlaceComercio');
        $enlaceId = data_get($datos, 'EnlacePago.Id');
        $idTransaccion = $datos['IdTransaccion'] ?? null;
        $monto = $this->centavos($datos['Monto'] ?? null);
        $esProductiva = $datos['EsProductiva'] ?? null;

        if (!is_string($referencia) || $referencia === ''
            || !is_numeric($enlaceId)
            || !is_string($idTransaccion) || $idTransaccion === ''
            || $monto === null || !is_bool($esProductiva)) {
            return response()->json(['message' => 'Notificación incompleta.'], 422);
        }

        return DB::transaction(function () use ($referencia, $enlaceId, $idTransaccion, $monto, $esProductiva) {
            $pago = Pago::where('referencia', $referencia)->lockForUpdate()->first();
            if (!$pago) {
                return response()->json(['message' => 'Referencia desconocida.'], 404);
            }

            if ((int) $pago->enlace_id !== (int) $enlaceId
                || $pago->es_productivo !== $esProductiva
                || $monto !== $this->centavos($pago->monto)) {
                return response()->json(['message' => 'Importe o enlace incorrecto.'], 422);
            }

            if ($pago->transaccion_id !== null) {
                return $pago->transaccion_id === $idTransaccion
                    ? response()->json(['recibido' => true])
                    : response()->json(['message' => 'Pago ya registrado.'], 409);
            }

            $pago->pedido()->lockForUpdate()->firstOrFail();
            $pago->update([
                'estado' => $pago->pedido->estado === 'cancelado'
                    ? 'revision'
                    : ($esProductiva ? 'pagado' : 'prueba'),
                'transaccion_id' => $idTransaccion,
                'pagado_en' => now(),
            ]);

            // Sandbox: prueba NO es un cobro real ni permite emitir DTE fiscal.
            // El pago no modifica estado del pedido: cocina sigue su flujo.
            return response()->json(['recibido' => true]);
        });
    }
}
