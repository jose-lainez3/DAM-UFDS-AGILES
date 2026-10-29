<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MesaController extends Controller
{
    public function index()
    {
        return response()->json(Mesa::orderBy('numero_mesa')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_mesa' => 'required|integer|unique:mesas,numero_mesa',
            'capacidad' => 'required|integer|min:1',
            'estado' => ['nullable', Rule::in(Mesa::ESTADOS)]
        ]);

        $validated['estado'] = $validated['estado'] ?? 'disponible';

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
            'estado' => ['sometimes', Rule::in(Mesa::ESTADOS)]
        ]);

        $mesa->update($validated);
        return response()->json(['message' => 'Mesa actualizada con éxito', 'data' => $mesa], 200);
    }

    public function destroy(Mesa $mesa)
    {
        $activos = $mesa->pedidos()->whereNotIn('estado', Pedido::ESTADOS_FINALES)->exists();

        if ($activos) {
            return response()->json([
                'message' => 'La mesa tiene pedidos activos y no se puede eliminar.'
            ], 409);
        }

        $mesa->delete();
        return response()->json(['message' => 'Mesa eliminada con éxito'], 200);
    }
}
