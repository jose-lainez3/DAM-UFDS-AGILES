<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';

    protected $fillable = [
        'categoria_id',
        'nombre',
        'descripcion',
        'precio',
        'disponible'
    ];

    protected $casts = [
        'precio' => 'float',
        'disponible' => 'boolean',
    ];

    // Relación: Un producto pertenece a una categoría
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    // Relación: Un producto tiene (como máximo) un registro de inventario
    public function inventario()
    {
        return $this->hasOne(Inventario::class, 'producto_id');
    }

    // Relación: Un producto aparece en muchos detalles de pedido
    public function detalles()
    {
        return $this->hasMany(DetallePedido::class, 'producto_id');
    }
}
