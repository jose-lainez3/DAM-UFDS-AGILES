<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index()
    {
        // Trae los productos junto con su categoría asociada
        return response()->json(Producto::with('categoria')->get(), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'disponible' => 'boolean'
        ]);

        $producto = Producto::create($validated);
        return response()->json(['message' => 'Producto creado con éxito', 'data' => $producto], 201);
    }

    public function show(Producto $producto)
    {
        return response()->json($producto->load('categoria'), 200);
    }

    public function update(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'categoria_id' => 'sometimes|exists:categorias,id',
            'nombre' => 'sometimes|string|max:255',
            'descripcion' => 'nullable|string',
            'precio' => 'sometimes|numeric|min:0',
            'disponible' => 'boolean'
        ]);

        $producto->update($validated);
        return response()->json(['message' => 'Producto actualizado con éxito', 'data' => $producto], 200);
    }

    public function destroy(Producto $producto)
    {
        // La FK de detalle_pedidos es "cascade": borrarlo eliminaría líneas de pedidos antiguos
        if ($producto->detalles()->exists()) {
            return response()->json([
                'message' => 'Este producto ya forma parte de pedidos y no se puede eliminar. Márcalo como no disponible.'
            ], 409);
        }

        $producto->delete();
        return response()->json(['message' => 'Producto eliminado con éxito'], 200);
    }
}