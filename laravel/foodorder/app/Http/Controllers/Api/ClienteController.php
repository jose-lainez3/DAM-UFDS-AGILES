<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index()
    {
        return response()->json(Cliente::with('pedidos')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'correo' => 'nullable|email|unique:clientes,correo',
            'telefono' => 'nullable|string|max:50'
        ]);

        $cliente = Cliente::create($validated);
        return response()->json(['message' => 'Cliente registrado con éxito', 'data' => $cliente], 201);
    }

    public function show(Cliente $cliente)
    {
        return response()->json($cliente->load('pedidos'), 200);
    }

    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'apellido' => 'sometimes|string|max:255',
            'correo' => 'nullable|email|unique:clientes,correo,' . $cliente->id,
            'telefono' => 'nullable|string|max:50'
        ]);

        $cliente->update($validated);
        return response()->json(['message' => 'Cliente actualizado con éxito', 'data' => $cliente], 200);
    }

    public function destroy(Cliente $cliente)
    {
        $cliente->delete();
        return response()->json(['message' => 'Cliente eliminado con éxito'], 200);
    }
}