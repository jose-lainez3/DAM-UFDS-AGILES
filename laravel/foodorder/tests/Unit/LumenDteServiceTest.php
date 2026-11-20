<?php

namespace Tests\Unit;

use App\Models\DetallePedido;
use App\Models\Pedido;
use App\Models\Producto;
use App\Services\LumenDteService;
use Illuminate\Database\Eloquent\Collection;
use Tests\TestCase;

class LumenDteServiceTest extends TestCase
{
    public function test_emission_is_disabled_without_issuer_credentials(): void
    {
        config()->set('services.lumen_dte', [
            'enabled' => false,
            'production' => false,
            'production_confirmed' => false,
            'api_key' => null,
            'company_nrc' => null,
            'establishment' => null,
            'point_of_sale' => null,
        ]);

        $this->assertFalse(app(LumenDteService::class)->configurado());
    }

    public function test_production_needs_explicit_confirmation(): void
    {
        config()->set('services.lumen_dte', [
            'enabled' => true,
            'production' => true,
            'production_confirmed' => false,
            'api_key' => 'test-token',
            'company_nrc' => '123456-7',
            'establishment' => 'M001',
            'point_of_sale' => 'P001',
        ]);

        $this->assertFalse(app(LumenDteService::class)->configurado());
        config()->set('services.lumen_dte.production_confirmed', true);
        $this->assertTrue(app(LumenDteService::class)->configurado());
    }

    public function test_it_prepares_prices_with_vat_included_and_reconciles_total(): void
    {
        config()->set('foodorder.tasa_impuesto', 0.13);

        $hamburguesa = new DetallePedido(['cantidad' => 1, 'precio_unitario' => 7, 'subtotal' => 7]);
        $hamburguesa->setRelation('producto', new Producto(['nombre' => 'Hamburguesa']));
        $papas = new DetallePedido(['cantidad' => 1, 'precio_unitario' => 2, 'subtotal' => 2]);
        $papas->setRelation('producto', new Producto(['nombre' => 'Papas']));

        $pedido = new Pedido(['precio_total' => 10.17]);
        $pedido->setRelation('detalles', new Collection([$hamburguesa, $papas]));
        $pedido->setRelation('pago', null);

        $payload = app(LumenDteService::class)->construirSolicitud($pedido, '01');

        $this->assertEquals(7.91, $payload['items'][0]['unitPrice']);
        $this->assertEquals(2.26, $payload['items'][1]['unitPrice']);
        $this->assertEquals(10.17, $payload['payments'][0]['amount']);
        $this->assertSame('01', $payload['payments'][0]['paymentCode']);
    }
}
