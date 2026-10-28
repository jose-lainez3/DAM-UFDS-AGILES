<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventario;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    public function index()
    {
        return response()->json(Inventario::with('producto')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,id|unique:inventarios,producto_id',
            'cantidad_stock' => 'required|integer|min:0',
            'unidad_medida' => 'required|string|max:50'
        ]);

        $inventario = Inventario::create($validated);
        return response()->json(['message' => 'Inventario registrado con éxito', 'data' => $inventario], 201);
    }

    public function show(Inventario $inventario)
    {
        return response()->json($inventario->load('producto'), 200);
    }

    public function update(Request $request, Inventario $inventario)
    {
        $validated = $request->validate([
            'cantidad_stock' => 'sometimes|integer|min:0',
            'unidad_medida' => 'sometimes|string|max:50'
        ]);

        $inventario->update($validated);
        return response()->json(['message' => 'Inventario actualizado con éxito', 'data' => $inventario], 200);
    }

    public function destroy(Inventario $inventario)
    {
        $inventario->delete();
        return response()->json(['message' => 'Inventario eliminado con éxito'], 200);
    }
}