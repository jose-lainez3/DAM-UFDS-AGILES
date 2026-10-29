<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('pedidos', function (Blueprint $table) {
        $table->id();
        $table->foreignId('cliente_id')->nullable()->constrained('clientes')->onDelete('set null');
        $table->foreignId('mesa_id')->nullable()->constrained('mesas')->onDelete('set null');
        $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade'); // El mesero que atendió
        $table->timestamp('fecha_pedido')->useCurrent();
        $table->decimal('precio_total', 10, 2)->default(0.00);
        $table->string('estado')->default('pendiente'); // pendiente, preparacion, entregado, pagado, cancelado
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
