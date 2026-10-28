<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $table = 'pedidos';

    protected $fillable = [
        'cliente_id',
        'mesa_id',
        'usuario_id',
        'fecha_pedido',
        'precio_total',
        'estado'
    ];

    // Relación: Un pedido pertenece a un cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    // Relación: Un pedido pertenece a una mesa
    public function mesa()
    {
        return $this->belongsTo(Mesa::class, 'mesa_id');
    }

    // Relación: Un pedido fue atendido por un usuario (mesero)
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // Relación: Un pedido tiene muchos detalles (productos comprados)
    public function detalles()
    {
        return $this->hasMany(DetallePedido::class, 'pedido_id');
    }
}