<?php

namespace Tests\Feature;

use Tests\TestCase;

class WompiWebhookTest extends TestCase
{
    public function test_webhook_rejects_requests_when_secret_is_missing(): void
    {
        config()->set('services.wompi.client_secret', null);

        $this->call('POST', '/api/webhooks/wompi', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], '{}')->assertStatus(503);
    }

    public function test_webhook_rejects_invalid_hmac(): void
    {
        config()->set('services.wompi.client_secret', 'secret-for-test');

        $this->call('POST', '/api/webhooks/wompi', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_wompi_hash' => str_repeat('0', 64),
        ], '{"ResultadoTransaccion":"ExitosaAprobada"}')->assertStatus(401);
    }

    public function test_webhook_rejects_incomplete_approved_payment(): void
    {
        config()->set('services.wompi.client_secret', 'secret-for-test');
        $body = '{"ResultadoTransaccion":"ExitosaAprobada"}';
        $hash = hash_hmac('sha256', $body, 'secret-for-test');

        $this->call('POST', '/api/webhooks/wompi', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_wompi_hash' => $hash,
        ], $body)->assertStatus(422);
    }
}
