<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\MesaController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\DetallePedidoController;
use App\Http\Controllers\Api\InventarioController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\WompiWebhookController;

/*
|--------------------------------------------------------------------------
| API de FoodOrder  (prefijo /api)
|--------------------------------------------------------------------------
*/

// Wompi autentica el webhook mediante HMAC SHA-256, no con Sanctum.
Route::post('webhooks/wompi', [WompiWebhookController::class, 'handle'])->name('webhooks.wompi');

// ---------- Autenticación (pública) ----------
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// ---------- Rutas Públicas (Menú) ----------
// Se permite ver las categorías y productos sin necesidad de token
Route::apiResource('categorias', CategoriaController::class)->only(['index', 'show']);
Route::apiResource('productos', ProductoController::class)->only(['index', 'show']);


// ---------- Rutas protegidas con token (Sanctum) ----------
Route::middleware('auth:sanctum')->group(function () {

    // Ajustes del local que necesita el front (p. ej. el impuesto)
    Route::get('configuracion', fn () => response()->json([
        'tasa_impuesto' => config('foodorder.tasa_impuesto'),
    ]));

    // Roles: cualquiera autenticado puede listarlos; solo el administrador los modifica
    Route::apiResource('roles', RolController::class)
        ->parameters(['roles' => 'rol'])
        ->only(['index', 'show']);

    // Solo administradores
    Route::middleware('role:Administrador')->group(function () {
        Route::apiResource('roles', RolController::class)
            ->parameters(['roles' => 'rol'])
            ->except(['index', 'show']);

        Route::apiResource('usuarios', UsuarioController::class);
    });

    // Rutas protegidas de Categorías y Productos (crear, actualizar, eliminar)
    Route::apiResource('categorias', CategoriaController::class)->except(['index', 'show']);
    Route::apiResource('productos', ProductoController::class)->except(['index', 'show']);

    // Resto de operaciones que sí requieren estar logueado
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('mesas', MesaController::class);
    Route::post('pedidos/{pedido}/pagos/wompi', [PagoController::class, 'crearEnlace']);
    Route::apiResource('pedidos', PedidoController::class);
    Route::apiResource('detalle-pedidos', DetallePedidoController::class);
    Route::apiResource('inventarios', InventarioController::class);
});