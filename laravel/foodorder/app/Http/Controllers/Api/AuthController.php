<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Inicia sesión con username (o correo) y clave. Devuelve un token Sanctum.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string',
            'clave' => 'required|string',
        ]);

        $usuario = Usuario::with('rol')
            ->where('username', $data['username'])
            ->orWhere('correo', $data['username'])
            ->first();

        if (!$usuario || !Hash::check($data['clave'], $usuario->clave)) {
            return response()->json([
                'message' => 'Usuario o contraseña incorrectos.'
            ], 401);
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
            'usuario' => $usuario,
        ], 200);
    }

    /**
     * Registro público: crea una cuenta de Mesero en estado "inactivo".
     * Un administrador debe activarla desde Gestión de Personal.
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255|unique:usuarios,username',
            'correo' => 'required|email|max:255|unique:usuarios,correo',
            'clave' => 'required|string|min:6|confirmed',
        ]);

        $rol = Rol::firstOrCreate(
            ['nombre' => 'Mesero'],
            ['descripcion' => 'Toma pedidos y atiende las mesas']
        );

        $usuario = Usuario::create([
            'rol_id' => $rol->id,
            'username' => $data['username'],
            'correo' => $data['correo'],
            'clave' => Hash::make($data['clave']),
            'estado' => 'inactivo',
        ]);

        return response()->json([
            'message' => 'Cuenta creada. Un administrador debe activarla antes de que puedas iniciar sesión.',
            'data' => $usuario->load('rol'),
        ], 201);
    }

    /**
     * Cierra sesión revocando el token actual.
     */
    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();

        // En autenticación por cookie/sesión el token es "transient" y no se puede borrar
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json(['message' => 'Sesión cerrada'], 200);
    }

    /**
     * Devuelve el usuario autenticado.
     */
    public function me(Request $request)
    {
        return response()->json($request->user()->load('rol'), 200);
    }
}
