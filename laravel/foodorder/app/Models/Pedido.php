<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    // Flujo: pendiente -> preparacion -> entregado -> pagado  (o cancelado)
    public const ESTADOS = ['pendiente', 'preparacion', 'entregado', 'pagado', 'cancelado'];

    // Estados en los que el pedido ya no ocupa la mesa
    public const ESTADOS_FINALES = ['pagado', 'cancelado'];

    protected $table = 'pedidos';

    protected $fillable = [
        'cliente_id',
        'mesa_id',
        'usuario_id',
        'fecha_pedido',
        'precio_total',
        'estado'
    ];

    protected $casts = [
        'precio_total' => 'float',
        // Con el cast, Laravel lo serializa en ISO-8601 (con zona horaria)
        'fecha_pedido' => 'datetime',
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

    /**
     * Marca la mesa como disponible si ya no quedan pedidos activos en ella.
     */
    public function liberarMesaSiCorresponde(): void
    {
        if (!$this->mesa_id) {
            return;
        }

        $hayActivos = static::where('mesa_id', $this->mesa_id)
            ->where('id', '!=', $this->id)
            ->whereNotIn('estado', self::ESTADOS_FINALES)
            ->exists();

        if (!$hayActivos) {
            Mesa::where('id', $this->mesa_id)->update(['estado' => 'disponible']);
        }
    }
}
