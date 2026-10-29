<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Inventario;
use App\Models\Mesa;
use App\Models\Producto;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Datos iniciales para poder usar FoodOrder desde el primer arranque.
 * Es idempotente: se puede ejecutar varias veces sin duplicar registros.
 *
 *   php artisan migrate --seed
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- Roles (los ids 1-4 coinciden con los que espera el front) ----------
        $roles = [];
        foreach ([
            'Administrador' => 'Acceso total al sistema',
            'Mesero' => 'Toma pedidos y atiende las mesas',
            'Cocinero' => 'Prepara los pedidos en cocina',
            'Cajero' => 'Cobra y cierra los pedidos',
        ] as $nombre => $descripcion) {
            $roles[$nombre] = Rol::firstOrCreate(['nombre' => $nombre], ['descripcion' => $descripcion]);
        }

        // ---------- Usuarios de prueba ----------
        $usuarios = [
            ['username' => 'admin', 'correo' => 'admin@foodorder.test', 'clave' => 'admin123', 'rol' => 'Administrador'],
            ['username' => 'mesero', 'correo' => 'mesero@foodorder.test', 'clave' => 'mesero123', 'rol' => 'Mesero'],
            ['username' => 'cocinero', 'correo' => 'cocinero@foodorder.test', 'clave' => 'cocina123', 'rol' => 'Cocinero'],
            ['username' => 'cajero', 'correo' => 'cajero@foodorder.test', 'clave' => 'cajero123', 'rol' => 'Cajero'],
        ];

        foreach ($usuarios as $u) {
            Usuario::firstOrCreate(
                ['username' => $u['username']],
                [
                    'rol_id' => $roles[$u['rol']]->id,
                    'correo' => $u['correo'],
                    'clave' => Hash::make($u['clave']),
                    'estado' => 'activo',
                ]
            );
        }

        // ---------- Mesas ----------
        foreach (range(1, 10) as $n) {
            Mesa::firstOrCreate(
                ['numero_mesa' => $n],
                ['capacidad' => $n <= 6 ? 4 : 6, 'estado' => 'disponible']
            );
        }

        // ---------- Clientes ----------
        foreach ([
            ['nombre' => 'Cliente', 'apellido' => 'general', 'correo' => null],
            ['nombre' => 'Carlos', 'apellido' => 'Martínez', 'correo' => 'carlos@example.com'],
            ['nombre' => 'María', 'apellido' => 'Hernández', 'correo' => 'maria@example.com'],
            ['nombre' => 'José', 'apellido' => 'Ramírez', 'correo' => 'jose@example.com'],
        ] as $c) {
            Cliente::firstOrCreate(
                ['nombre' => $c['nombre'], 'apellido' => $c['apellido']],
                ['correo' => $c['correo']]
            );
        }

        // ---------- Menú: categorías, productos e inventario ----------
        $menu = [
            'Entradas' => [
                ['Ensalada fresca', 'Vegetales frescos de temporada.', 5.50, 40],
                ['Papas fritas', 'Papas doradas y crujientes.', 3.00, 80],
            ],
            'Platos' => [
                ['Hamburguesa clásica', 'Carne, vegetales y queso.', 8.50, 50],
                ['Pizza especial', 'Queso, salsa y vegetales.', 12.00, 30],
                ['Pollo a la plancha', 'Pollo acompañado de vegetales.', 9.75, 35],
            ],
            'Bebidas' => [
                ['Limonada', 'Bebida natural refrescante.', 2.00, 100],
                ['Jugo de naranja', 'Jugo de naranja natural.', 2.50, 100],
            ],
            'Postres' => [
                ['Pastel de chocolate', 'Pastel con cobertura de chocolate.', 4.00, 20],
            ],
        ];

        foreach ($menu as $nombreCategoria => $productos) {
            $categoria = Categoria::firstOrCreate(['nombre' => $nombreCategoria]);

            foreach ($productos as [$nombre, $descripcion, $precio, $stock]) {
                $producto = Producto::firstOrCreate(
                    ['nombre' => $nombre],
                    [
                        'categoria_id' => $categoria->id,
                        'descripcion' => $descripcion,
                        'precio' => $precio,
                        'disponible' => true,
                    ]
                );

                Inventario::firstOrCreate(
                    ['producto_id' => $producto->id],
                    ['cantidad_stock' => $stock, 'unidad_medida' => 'unidades']
                );
            }
        }
    }
}
