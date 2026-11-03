<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Busca la ficha de cliente de una cuenta sin confundir usuarios.id con clientes.id.
     * Requiere que clientes.usuario_id exista y esté correctamente poblado.
     */
    private function clienteDe(Usuario $usuario): ?Cliente
    {
        if (!Schema::hasColumn('clientes', 'usuario_id')) {
            return null;
        }

        return Cliente::where('usuario_id', $usuario->id)->first();
    }

    private function respuestaUsuario(Usuario $usuario): array
    {
        $usuario->load('rol');
        $datos = $usuario->toArray();
        $datos['cliente'] = $this->clienteDe($usuario);
        return $datos;
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string',
            'clave' => 'required|string',
        ]);

        $usuario = Usuario::with('rol')
            ->where(function ($query) use ($data) {
                $query->where('username', $data['username'])
                    ->orWhere('correo', $data['username']);
            })
            ->first();

        if (!$usuario || !Hash::check($data['clave'], $usuario->clave)) {
            return response()->json(['message' => 'Usuario o contraseña incorrectos.'], 401);
        }

        if (!$usuario->estaActivo()) {
            return response()->json([
                'message' => 'Tu cuenta está inactiva. Contacta con un administrador.'
            ], 403);
        }

        $token = $usuario->createToken('foodorder')->plainTextToken;

        return response()->json([
            'message' => 'Sesión iniciada',
            'token' => $token,
            'usuario' => $this->respuestaUsuario($usuario),
        ], 200);
    }

    /**
     * Crea la cuenta y su ficha de cliente en una sola transacción.
     * Requiere una columna clientes.usuario_id y columnas nombre/apellido/correo/telefono
     * compatibles con el formulario de clientes de FoodOrder.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255|unique:usuarios,username',
            'correo' => 'required|email|max:255|unique:usuarios,correo',
            'clave' => 'required|string|min:6',
            'nombre' => 'nullable|string|max:255',
            'apellido' => 'nullable|string|max:255',
        ]);

        if (!Schema::hasColumn('clientes', 'usuario_id')) {
            throw ValidationException::withMessages([
                'cliente' => 'Falta configurar la relación clientes.usuario_id. No se creó la cuenta.'
            ]);
        }

        $usuario = DB::transaction(function () use ($data) {
            $rol = Rol::firstOrCreate(
                ['nombre' => 'Cliente'],
                ['descripcion' => 'Usuario cliente que realiza pedidos']
            );

            $usuario = Usuario::create([
                'rol_id' => $rol->id,
                'username' => $data['username'],
                'correo' => $data['correo'],
                'clave' => Hash::make($data['clave']),
                'estado' => 'activo',
            ]);

            Cliente::create([
                'usuario_id' => $usuario->id,
                'nombre' => $data['nombre'] ?? $data['username'],
                'apellido' => $data['apellido'] ?? '',
                'correo' => $data['correo'],
                'telefono' => null,
            ]);

            return $usuario;
        });

        return response()->json([
            'message' => 'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
            'data' => $this->respuestaUsuario($usuario),
        ], 201);
    }

    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }
        return response()->json(['message' => 'Sesión cerrada'], 200);
    }

    public function me(Request $request)
    {
        $usuario = $request->user();
        return response()->json($this->respuestaUsuario($usuario), 200);
    }
}
