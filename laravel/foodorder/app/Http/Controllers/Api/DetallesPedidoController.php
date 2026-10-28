<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetallePedido;
use Illuminate\Http\Request;

class DetallePedidoController extends Controller
{
    public function index()
    {
        return response()->json(DetallePedido::with(['pedido', 'producto'])->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pedido_id' => 'required|exists:pedidos,id',
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
            'precio_unitario' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0'
        ]);

        $detalle = DetallePedido::create($validated);
        return response()->json(['message' => 'Detalle de pedido agregado con éxito', 'data' => $detalle], 201);
    }

    public function show(DetallePedido $detallePedido)
    {
        return response()->json($detallePedido->load(['pedido', 'producto']), 200);
    }

    public function update(Request $request, DetallePedido $detallePedido)
    {
        $validated = $request->validate([
            'cantidad' => 'sometimes|integer|min:1',
            'precio_unitario' => 'sometimes|numeric|min:0',
            'subtotal' => 'sometimes|numeric|min:0'
        ]);

        $detallePedido->update($validated);
        return response()->json(['message' => 'Detalle actualizado con éxito', 'data' => $detallePedido], 200);
    }

    public function destroy(DetallePedido $detallePedido)
    {
        $detallePedido->delete();
        return response()->json(['message' => 'Detalle eliminado con éxito'], 200);
    }
}