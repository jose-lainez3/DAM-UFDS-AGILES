<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'usuarios';

    protected $fillable = [
        'rol_id',
        'username',
        'correo',
        'clave',
        'estado'
    ];

    // Nunca exponer el hash de la contraseña en las respuestas JSON
    protected $hidden = ['clave'];

    // La columna de contraseña de esta tabla se llama "clave"
    public function getAuthPassword()
    {
        return $this->clave;
    }

    public function estaActivo(): bool
    {
        return strtolower((string) $this->estado) === 'activo';
    }

    // Relación: Un usuario pertenece a un rol
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    // Relación: Un usuario (mesero/admin) atiende muchos pedidos
    public function pedidos()
    {
        return $this->hasMany(Pedido::class, 'usuario_id');
    }
}
