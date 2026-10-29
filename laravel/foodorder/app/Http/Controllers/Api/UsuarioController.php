<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::with('rol')->orderByDesc('id')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rol_id' => 'required|exists:roles,id',
            'username' => 'required|string|unique:usuarios,username|max:255',
            'correo' => 'required|email|unique:usuarios,correo|max:255',
            'clave' => 'required|string|min:6',
            'estado' => ['nullable', Rule::in(['activo', 'inactivo'])]
        ]);

        // Encriptar la contraseña por seguridad
        $validated['clave'] = Hash::make($validated['clave']);
        $validated['estado'] = $validated['estado'] ?? 'activo';

        $usuario = Usuario::create($validated);
        return response()->json(['message' => 'Usuario creado con éxito', 'data' => $usuario->load('rol')], 201);
    }

    public function show(Usuario $usuario)
    {
        return response()->json($usuario->load(['rol', 'pedidos']), 200);
    }

    public function update(Request $request, Usuario $usuario)
    {
        $validated = $request->validate([
            'rol_id' => 'sometimes|exists:roles,id',
            'username' => 'sometimes|string|max:255|unique:usuarios,username,' . $usuario->id,
            'correo' => 'sometimes|email|unique:usuarios,correo,' . $usuario->id,
            'clave' => 'sometimes|string|min:6',
            'estado' => ['sometimes', Rule::in(['activo', 'inactivo'])]
        ]);

        // Un administrador no puede quitarse a sí mismo el acceso
        if ($request->user()->id === $usuario->id && ($validated['estado'] ?? 'activo') === 'inactivo') {
            return response()->json([
                'message' => 'No puedes desactivar tu propia cuenta.'
            ], 422);
        }

        if (isset($validated['clave'])) {
            $validated['clave'] = Hash::make($validated['clave']);
        }

        $usuario->update($validated);
        return response()->json(['message' => 'Usuario actualizado con éxito', 'data' => $usuario->load('rol')], 200);
    }

    public function destroy(Request $request, Usuario $usuario)
    {
        if ($request->user()->id === $usuario->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 422);
        }

        // La FK de pedidos es "cascade": borrar al usuario borraría su historial de ventas
        if ($usuario->pedidos()->exists()) {
            return response()->json([
                'message' => 'Este usuario tiene pedidos registrados y no se puede eliminar. Márcalo como inactivo.'
            ], 409);
        }

        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado con éxito'], 200);
    }
}
