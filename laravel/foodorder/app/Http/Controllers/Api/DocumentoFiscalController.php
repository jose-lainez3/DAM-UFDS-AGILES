<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentoFiscal;
use App\Models\Pedido;
use App\Services\LumenDteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class DocumentoFiscalController extends Controller
{
    private function autorizarLectura(Request $request, Pedido $pedido): void
    {
        abort_unless($request->user(), 401);
        if (strcasecmp((string) $request->user()->rol?->nombre, 'Cliente') === 0) {
            abort_unless((int) $pedido->usuario_id === (int) $request->user()->id, 403);
        }
    }

    private function serializar(?DocumentoFiscal $documento): array
    {
        if (!$documento) return ['documento' => null];
        return ['documento' => [
            'id' => $documento->id,
            'tipo_dte' => $documento->tipo_dte,
            'estado' => $documento->estado,
            'ambiente' => $documento->ambiente,
            'medio_pago' => $documento->medio_pago,
            'codigo_generacion' => $documento->codigo_generacion,
            'numero_control' => $documento->numero_control,
            'sello_recepcion' => $documento->sello_recepcion,
            'error_resumen' => $documento->error_resumen,
            'emitido_en' => $documento->emitido_en,
        ]];
    }

    public function show(Request $request, Pedido $pedido)
    {
        $this->autorizarLectura($request, $pedido);
        return response()->json($this->serializar($pedido->documentoFiscal));
    }

    public function store(Request $request, Pedido $pedido, LumenDteService $lumen)
    {
        // Solo administradores pueden autorizar la transmisión fiscal.
        abort_unless(
            strcasecmp((string) $request->user()?->rol?->nombre, 'Administrador') === 0,
            403, 'Se requiere un administrador.'
        );
        $validado = $request->validate([
            'medio_pago' => ['required', 'string', Rule::in(['01', '02', '03', '05', '08', '99'])],
        ]);

        if (!$lumen->configurado()) {
            return response()->json(['message' => 'Facturación electrónica no configurada.'], 503);
        }

        $documento = DB::transaction(function () use ($pedido, $lumen, $validado) {
            $pedido = Pedido::whereKey($pedido->id)->lockForUpdate()->firstOrFail();
            $pedido->load('pago', 'detalles.producto');
            abort_if($pedido->estado === 'cancelado', 409, 'Pedido cancelado.');
            abort_unless($pedido->estado === 'pagado' || $pedido->pago?->estado === 'pagado',
                409, 'El pedido debe estar confirmado como cobrado antes de emitir DTE.');
            abort_if($pedido->pago?->estado === 'prueba', 409, 'Los pagos de prueba no habilitan facturas fiscales.');
            if ($pedido->pago && $pedido->pago->estado !== 'pagado') {
                abort(409, 'El cobro electrónico aún no está confirmado en producción.');
            }

            $existente = DocumentoFiscal::where('pedido_id', $pedido->id)->lockForUpdate()->first();
            if ($existente && $existente->ambiente !== $lumen->ambiente()) {
                abort(409, 'No se puede conciliar un documento con un ambiente fiscal distinto.');
            }
            if ($existente) {
                abort_if(in_array($existente->estado, ['emitido', 'borrador', 'prueba', 'rechazado', 'preparando'], true),
                    409, 'Ya existe un DTE emitido o en proceso. Consulte el estado antes de repetir.');
                abort_unless($existente->medio_pago === $validado['medio_pago'], 409,
                    'No se puede cambiar el medio de pago durante una conciliación.');
                return $existente;
            }

            $datos = $lumen->construirSolicitud($pedido, $validado['medio_pago']);

            return DocumentoFiscal::create([
                'pedido_id' => $pedido->id,
                'proveedor' => 'lumen',
                'tipo_dte' => '01',
                'estado' => 'preparando',
                'ambiente' => $lumen->ambiente(),
                'medio_pago' => $validado['medio_pago'],
                'idempotencia' => 'foodorder-fe01-' . $pedido->id . '-' . Str::uuid(),
                'solicitud_cifrada' => $datos,
            ]);
        });

        // La llamada externa va FUERA de la transacción de base de datos.
        try {
            $datos = $lumen->emitir($documento);
        } catch (Throwable $e) {
            report($e);
            $documento->update([
                'estado' => 'revision',
                'error_resumen' => 'Error de comunicación: verificar en el proveedor antes de reintentar.',
            ]);
            return response()->json([
                'message' => 'Emisión pendiente de conciliación. No reintentes automáticamente.',
                ...$this->serializar($documento->fresh()),
            ], 502);
        }

        $estatus = strtoupper((string) ($datos['status'] ?? ''));
        $esProductivo = $documento->ambiente === 'PRODUCTION';
        $sello = is_string($datos['receivedStamp'] ?? null) ? $datos['receivedStamp'] : null;

        $entornoResponde = strtoupper((string) ($datos['environment'] ?? ''));
        $entornoValido = $entornoResponde === $documento->ambiente;
        $nuevoEstado = match (true) {
            !$entornoValido => 'revision',
            $estatus === 'PROCESSED' && $esProductivo && filled($sello) => 'emitido',
            $estatus === 'PROCESSED' && !$esProductivo => 'prueba',
            $estatus === 'DRAFT' && !$esProductivo => 'borrador',
            $estatus === 'REJECTED' => 'rechazado',
            default => 'revision',
        };

        $documento->update([
            'estado' => $nuevoEstado,
            'estado_proveedor' => $estatus,
            'codigo_generacion' => is_string($datos['generationCode'] ?? null) ? $datos['generationCode'] : $documento->codigo_generacion,
            'numero_control' => is_string($datos['controlNumber'] ?? null) ? $datos['controlNumber'] : $documento->numero_control,
            'sello_recepcion' => $sello,
            'emitido_en' => $nuevoEstado === 'emitido' ? now() : null,
            'error_resumen' => in_array($nuevoEstado, ['rechazado', 'revision'], true)
                ? mb_substr((string) ($datos['error'] ?? 'Respuesta sin aceptación fiscal confirmada.'), 0, 200) : null,
        ]);
        return response()->json($this->serializar($documento->fresh()), $nuevoEstado === 'emitido' ? 201 : 200);
    }

    public function archivo(Request $request, Pedido $pedido, LumenDteService $lumen)
    {
        $this->autorizarLectura($request, $pedido);
        $validado = $request->validate(['formato' => ['required', Rule::in(['pdf', 'json'])]]);
        $documento = $pedido->documentoFiscal;
        abort_unless($documento && in_array($documento->estado, ['emitido', 'borrador', 'prueba'], true),
            404, 'No existe un DTE descargable.');
        try {
            return response()->json([
                'url' => $lumen->archivoTemporal($documento, $validado['formato']),
                'es_fiscal' => $documento->estado === 'emitido',
            ]);
        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'No se pudo obtener el documento.'], 502);
        }
    }
}
