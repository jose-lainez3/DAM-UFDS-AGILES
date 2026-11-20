<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentoFiscal extends Model
{
    protected $table = 'documentos_fiscales';

    protected $fillable = [
        'pedido_id', 'proveedor', 'tipo_dte', 'estado', 'ambiente',
        'medio_pago', 'idempotencia', 'solicitud_cifrada',
        'codigo_generacion', 'numero_control', 'sello_recepcion',
        'estado_proveedor', 'error_resumen', 'emitido_en',
    ];

    protected $hidden = ['solicitud_cifrada', 'idempotencia'];

    protected $casts = [
        'solicitud_cifrada' => 'encrypted:array',
        'emitido_en' => 'datetime',
    ];

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }
}
