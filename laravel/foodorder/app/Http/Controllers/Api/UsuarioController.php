<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::with(['rol', 'pedidos'])->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rol_id' => 'required|exists:roles,id',
            'username' => 'required|string|unique:usuarios,username|max:255',
            'correo' => 'required|email|unique:usuarios,correo|max:255',
            'clave' => 'required|string|min:6',
            'estado' => 'string'
        ]);

        // Encriptar la contraseña por seguridad
        $validated['clave'] = Hash::make($validated['clave']);

        $usuario = Usuario::create($validated);
        return response()->json(['message' => 'Usuario creado con éxito', 'data' => $usuario], 201);
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
            'estado' => 'string'
        ]);

        if (isset($validated['clave'])) {
            $validated['clave'] = Hash::make($validated['clave']);
        }

        $usuario->update($validated);
        return response()->json(['message' => 'Usuario actualizado con éxito', 'data' => $usuario], 200);
    }

    public function destroy(Usuario $usuario)
    {
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado con éxito'], 200);
    }
}