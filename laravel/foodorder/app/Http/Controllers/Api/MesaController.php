<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use Illuminate\Http\Request;

class MesaController extends Controller
{
    public function index()
    {
        return response()->json(Mesa::with('pedidos')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_mesa' => 'required|integer|unique:mesas,numero_mesa',
            'capacidad' => 'required|integer|min:1',
            'estado' => 'string'
        ]);

        $mesa = Mesa::create($validated);
        return response()->json(['message' => 'Mesa creada con éxito', 'data' => $mesa], 201);
    }

    public function show(Mesa $mesa)
    {
        return response()->json($mesa->load('pedidos'), 200);
    }

    public function update(Request $request, Mesa $mesa)
    {
        $validated = $request->validate([
            'numero_mesa' => 'sometimes|integer|unique:mesas,numero_mesa,' . $mesa->id,
            'capacidad' => 'sometimes|integer|min:1',
            'estado' => 'string'
        ]);

        $mesa->update($validated);
        return response()->json(['message' => 'Mesa actualizada con éxito', 'data' => $mesa], 200);
    }

    public function destroy(Mesa $mesa)
    {
        $mesa->delete();
        return response()->json(['message' => 'Mesa eliminada con éxito'], 200);
    }
}
