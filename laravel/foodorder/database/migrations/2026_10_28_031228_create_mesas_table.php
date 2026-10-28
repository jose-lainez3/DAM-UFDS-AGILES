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
    Schema::create('mesas', function (Blueprint $table) {
        $table->id();
        $table->integer('numero_mesa')->unique();
        $table->integer('capacidad');
        $table->string('estado')->default('disponible'); // disponible, ocupada, reservada
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mesas');
    }
};
