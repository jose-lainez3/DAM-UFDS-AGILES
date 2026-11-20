<?php

namespace App\Services;

use App\Models\DocumentoFiscal;
use App\Models\Pedido;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class LumenDteService
{
    public function configurado(): bool
    {
        $c = config('services.lumen_dte');
        return (bool) ($c['enabled'] ?? false)
            && filled($c['api_key'] ?? null)
            && filled($c['company_nrc'] ?? null)
            && filled($c['establishment'] ?? null)
            && filled($c['point_of_sale'] ?? null)
            && (!(bool) ($c['production'] ?? false) || (bool) ($c['production_confirmed'] ?? false));
    }

    public function ambiente(): string
    {
        return config('services.lumen_dte.production', false) ? 'PRODUCTION' : 'SANDBOX';
    }

    private function baseUrl(): string
    {
        // Evitar SSRF: la URL del emisor fiscal es fija, nunca llega del usuario.
        return $this->ambiente() === 'PRODUCTION'
            ? 'https://api.lumendte.com/v1'
            : 'https://api-sandbox.lumendte.com/v1';
    }

    private function client()
    {
        return Http::acceptJson()
            ->withToken((string) config('services.lumen_dte.api_key'))
            ->withHeaders([
                'x-company-tax-number' => (string) config('services.lumen_dte.company_nrc'),
                'x-establishment-code' => (string) config('services.lumen_dte.establishment'),
                'x-point-of-sale-code' => (string) config('services.lumen_dte.point_of_sale'),
            ])
            ->connectTimeout(5)
            ->timeout(30);
    }

    public function construirSolicitud(Pedido $pedido, string $medioPago): array
    {
        $pedido->loadMissing('detalles.producto');
        $detalles = $pedido->detalles;
        if ($detalles->isEmpty() || $detalles->count() > 100) {
            throw ValidationException::withMessages(['factura' => 'Se requieren entre 1 y 100 líneas facturables.']);
        }
        $total = round((float) $pedido->precio_total, 2);
        if ($total <= 0 || $total > 25000) {
            throw ValidationException::withMessages(['factura' => 'Este flujo solo permite factura de consumidor final por hasta $25,000.']);
        }

        // FoodOrder guarda precios SIN IVA y añade el impuesto al total del pedido.
        // Lumen exige precios unitarios CON IVA. Se verifica la conciliación antes de emitir.
        $tasa = (float) config('foodorder.tasa_impuesto', 0.13);
        if ($tasa < 0 || $tasa > 1) {
            throw ValidationException::withMessages(['factura' => 'Tasa de IVA no válida.']);
        }
        $items = [];
        $suma = 0.0;

        foreach ($detalles as $detalle) {
            $cantidad = (int) $detalle->cantidad;
            $unitario = (float) $detalle->precio_unitario;
            $subtotal = round($cantidad * $unitario, 2);
            if ($cantidad < 1 || $unitario <= 0
                || abs($subtotal - (float) $detalle->subtotal) > 0.005) {
                throw ValidationException::withMessages(['factura' => 'Existe un detalle sin precio o sin conciliación.']);
            }
            $conIva = round($unitario * (1 + $tasa), 6);
            $suma += $conIva * $cantidad;
            $items[] = [
                'description' => mb_substr((string) ($detalle->producto?->nombre ?: 'Producto FoodOrder'), 0, 200),
                'quantity' => $cantidad,
                'unitPrice' => $conIva,
                'taxType' => 'TAXABLE',
                'itemType' => 'GOODS',
                'unitOfMeasure' => '59',
            ];
        }

        if (abs(round($suma, 2) - $total) > 0.005) {
            throw ValidationException::withMessages([
                'factura' => 'El IVA por línea no coincide con el total del pedido; requiere revisión fiscal antes de emitir.',
            ]);
        }

        $pago = ['paymentCode' => $medioPago, 'amount' => $total];
        if ($medioPago === '99') {
            $pago['methodDetail'] = 'Medio de pago verificado por el restaurante';
        }
        if ($pedido->pago?->estado === 'pagado'
            && is_string($pedido->pago->transaccion_id)
            && $medioPago !== '01') {
            $pago['reference'] = $pedido->pago->transaccion_id;
        }

        return ['items' => $items, 'payments' => [$pago]];
    }

    public function emitir(DocumentoFiscal $documento): array
    {
        if (!$this->configurado()) {
            throw new RuntimeException('DTE deshabilitado o incompleto.');
        }
        $response = $this->client()
            ->withHeaders(['Idempotency-Key' => $documento->idempotencia])
            ->post($this->baseUrl() . '/invoices', $documento->solicitud_cifrada);

        $datos = $response->json();
        if (!is_array($datos)) {
            throw new RuntimeException('Respuesta no válida del proveedor fiscal.');
        }
        // También se inspecciona el cuerpo de error; UNCONFIRMED nunca se reemite a ciegas.
        if (!$response->successful()) {
            return [
                'status' => (string) ($datos['status'] ?? 'ERROR'),
                'error' => (string) ($datos['errorCode'] ?? 'HTTP_' . $response->status()),
                'generationCode' => $datos['generationCode'] ?? null,
                'controlNumber' => $datos['controlNumber'] ?? null,
            ];
        }
        return $datos;
    }

    public function archivoTemporal(DocumentoFiscal $documento, string $formato): string
    {
        if (!$this->configurado() || !in_array($formato, ['pdf', 'json'], true)) {
            throw new RuntimeException('Formato no permitido o emisor no configurado.');
        }
        $codigo = $documento->codigo_generacion;
        if (!$codigo || !preg_match('/^[A-F0-9-]{36}$/iD', $codigo)) {
            throw new RuntimeException('Este documento no tiene código de generación válido.');
        }

        $response = $this->client()->get($this->baseUrl() . '/documents/' . $codigo . '/' . $formato);
        $response->throw();
        $url = $response->json('url');
        if (!is_string($url) || !filter_var($url, FILTER_VALIDATE_URL)
            || parse_url($url, PHP_URL_SCHEME) !== 'https') {
            throw new RuntimeException('El proveedor no devolvió una URL temporal válida.');
        }
        return $url;
    }
}
