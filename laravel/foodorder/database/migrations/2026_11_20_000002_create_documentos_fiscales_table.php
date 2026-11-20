<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('documentos_fiscales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->unique()->constrained('pedidos')->restrictOnDelete();
            $table->string('proveedor', 32)->default('lumen');
            $table->string('tipo_dte', 2)->default('01');
            $table->string('estado', 24)->default('preparando');
            $table->string('ambiente', 12);
            $table->string('medio_pago', 2);
            $table->string('idempotencia', 128)->unique();
            $table->text('solicitud_cifrada');
            $table->string('codigo_generacion', 36)->nullable()->unique();
            $table->string('numero_control', 64)->nullable();
            $table->string('sello_recepcion', 128)->nullable();
            $table->string('estado_proveedor', 48)->nullable();
            $table->text('error_resumen')->nullable();
            $table->timestamp('emitido_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos_fiscales');
    }
};
