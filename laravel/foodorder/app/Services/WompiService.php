<?php

namespace App\Services;

use App\Models\Pago;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WompiService
{
    private const TOKEN_URL = 'https://id.wompi.sv/connect/token';
    private const API_URL = 'https://api.wompi.sv/EnlacePago';

    public function configurado(): bool
    {
        return filled(config('services.wompi.client_id'))
            && filled(config('services.wompi.client_secret'))
            && parse_url((string) config('app.url'), PHP_URL_SCHEME) === 'https';
    }

    private function token(): string
    {
        $id = (string) config('services.wompi.client_id');
        $secret = (string) config('services.wompi.client_secret');
        if ($id === '' || $secret === '') {
            throw new RuntimeException('Wompi no está configurado.');
        }

        $claveCache = 'wompi.oauth.' . hash('sha256', $id . ':' . $secret);

        return Cache::remember($claveCache, 3000, function () use ($id, $secret) {
            $respuesta = Http::asForm()->acceptJson()->connectTimeout(5)->timeout(15)
                ->post(self::TOKEN_URL, [
                    'grant_type' => 'client_credentials',
                    'client_id' => $id,
                    'client_secret' => $secret,
                    'audience' => 'wompi_api',
                ])->throw();

            $token = $respuesta->json('access_token');
            if (!is_string($token) || $token === '') {
                throw new RuntimeException('Wompi no devolvió un token válido.');
            }
            return $token;
        });
    }

    public function crearEnlace(Pago $pago): array
    {
        $configuracion = [
            'esMontoEditable' => false,
            'esCantidadEditable' => false,
            'cantidadPorDefecto' => 1,
            'urlWebhook' => rtrim((string) config('app.url'), '/') . '/api/webhooks/wompi',
            'notificarTransaccionCliente' => false,
        ];

        $retorno = config('services.wompi.return_url');
        if (is_string($retorno) && filter_var($retorno, FILTER_VALIDATE_URL)
            && parse_url($retorno, PHP_URL_SCHEME) === 'https') {
            $configuracion['urlRedirect'] = $retorno;
        }

        $respuesta = Http::acceptJson()->withToken($this->token())
            ->connectTimeout(5)->timeout(20)
            ->post(self::API_URL, [
                'identificadorEnlaceComercio' => $pago->referencia,
                'monto' => (float) $pago->monto,
                'nombreProducto' => 'FoodOrder - Pedido #' . $pago->pedido_id,
                'configuracion' => $configuracion,
                'limitesDeUso' => ['cantidadMaximaPagosExitosos' => 1],
            ])->throw()->json();

        if (!is_array($respuesta)
            || !isset($respuesta['idEnlace'], $respuesta['urlEnlace'])
            || !is_numeric($respuesta['idEnlace'])
            || !is_string($respuesta['urlEnlace'])
            || !filter_var($respuesta['urlEnlace'], FILTER_VALIDATE_URL)
            || parse_url($respuesta['urlEnlace'], PHP_URL_SCHEME) !== 'https'
            || !is_bool($respuesta['estaProductivo'] ?? null)) {
            throw new RuntimeException('Wompi devolvió una respuesta inesperada.');
        }

        $esperado = (bool) config('services.wompi.production', false);
        if ($respuesta['estaProductivo'] !== $esperado) {
            throw new RuntimeException('El entorno del negocio Wompi no coincide con WOMPI_PRODUCTION.');
        }

        return [
            'id' => (int) $respuesta['idEnlace'],
            'url' => $respuesta['urlEnlace'],
            'produccion' => $respuesta['estaProductivo'],
        ];
    }
}
