<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    public function index()
    {
        // Trae el pedido con su cliente, mesa, usuario (mesero) y los detalles de los productos
        return response()->json(Pedido::with(['cliente', 'mesa', 'usuario', 'detalles.producto'])->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'nullable|exists:clientes,id',
            'mesa_id' => 'nullable|exists:mesas,id',
            'usuario_id' => 'required|exists:usuarios,id',
            'precio_total' => 'required|numeric|min:0',
            'estado' => 'string'
        ]);

        $pedido = Pedido::create($validated);
        return response()->json(['message' => 'Pedido registrado con éxito', 'data' => $pedido], 201);
    }

    public function show(Pedido $pedido)
    {
        return response()->json($pedido->load(['cliente', 'mesa', 'usuario', 'detalles.producto']), 200);
    }

    public function update(Request $request, Pedido $pedido)
    {
        $validated = $request->validate([
            'estado' => 'sometimes|string',
            'precio_total' => 'sometimes|numeric|min:0'
        ]);

        $pedido->update($validated);
        return response()->json(['message' => 'Pedido actualizado con éxito', 'data' => $pedido], 200);
    }

    public function destroy(Pedido $pedido)
    {
        $pedido->delete();
        return response()->json(['message' => 'Pedido eliminado con éxito'], 200);
    }
}