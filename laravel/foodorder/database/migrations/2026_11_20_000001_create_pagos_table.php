<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->unique()->constrained('pedidos')->restrictOnDelete();
            $table->string('proveedor', 32)->default('wompi');
            $table->string('referencia', 120)->unique();
            $table->decimal('monto', 10, 2);
            $table->string('estado', 24)->default('pendiente');
            $table->unsignedBigInteger('enlace_id')->nullable()->unique();
            $table->text('url_pago')->nullable();
            $table->boolean('es_productivo')->nullable();
            $table->string('transaccion_id', 120)->nullable()->unique();
            $table->timestamp('pagado_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
