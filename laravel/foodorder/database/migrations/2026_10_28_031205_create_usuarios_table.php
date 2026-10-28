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
    Schema::create('usuarios', function (Blueprint $table) {
        $table->id();
        $table->foreignId('rol_id')->constrained('roles')->onDelete('cascade');
        $table->string('username')->unique();
        $table->string('correo')->unique();
        $table->string('clave');
        $table->string('estado')->default('activo'); // activo, inactivo
        $table->timestamp('fecha_creacion')->useCurrent();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
