<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

    public const ESTADOS = ['disponible', 'ocupada', 'reservada'];

    protected $table = 'mesas';

    protected $fillable = ['numero_mesa', 'capacidad', 'estado'];

    protected $casts = [
        'numero_mesa' => 'integer',
        'capacidad' => 'integer',
    ];

    // Relación: Una mesa tiene muchos pedidos
    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'mesa_id');
    }
}
