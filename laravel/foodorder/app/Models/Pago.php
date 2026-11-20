<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    protected $table = 'pagos';

    protected $fillable = [
        'pedido_id', 'proveedor', 'referencia', 'monto', 'estado',
        'enlace_id', 'url_pago', 'es_productivo', 'transaccion_id', 'pagado_en',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'es_productivo' => 'boolean',
        'pagado_en' => 'datetime',
    ];

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }
}
