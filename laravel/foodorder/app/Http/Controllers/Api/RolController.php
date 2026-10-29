<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\Request;

class RolController extends Controller
{
    public function index()
    {
        return response()->json(Rol::orderBy('id')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:roles,nombre',
            'descripcion' => 'nullable|string',
        ]);

        $rol = Rol::create($validated);

        return response()->json(['message' => 'Rol creado con éxito', 'data' => $rol], 201);
    }

    public function show(Rol $rol)
    {
        return response()->json($rol->load('usuarios'), 200);
    }

    public function update(Request $request, Rol $rol)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255|unique:roles,nombre,' . $rol->id,
            'descripcion' => 'nullable|string',
        ]);

        $rol->update($validated);

        return response()->json(['message' => 'Rol actualizado con éxito', 'data' => $rol], 200);
    }

    public function destroy(Rol $rol)
    {
        // La FK de usuarios es "cascade": borrar el rol borraría a su personal
        if ($rol->usuarios()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un rol que tiene usuarios asignados.'
            ], 409);
        }

        $rol->delete();

        return response()->json(['message' => 'Rol eliminado con éxito'], 200);
    }
}
