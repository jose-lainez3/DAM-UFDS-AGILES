
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('clientes', 'usuario_id')) {
            Schema::table('clientes', function (Blueprint $table) {
                $table->foreignId('usuario_id')
                    ->nullable()
                    ->unique()
                    ->constrained('usuarios')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        // Se conserva la columna para evitar borrar
        // relaciones que ya existían anteriormente.
    }
};
