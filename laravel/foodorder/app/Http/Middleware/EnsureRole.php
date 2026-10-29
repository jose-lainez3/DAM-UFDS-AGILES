<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe una ruta a ciertos roles. Uso: ->middleware('role:Administrador,Cocinero')
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();
        $rol = $usuario?->rol?->nombre;

        $permitidos = array_map('mb_strtolower', $roles);

        if (!$rol || !in_array(mb_strtolower($rol), $permitidos, true)) {
            return response()->json([
                'message' => 'No tienes permisos para realizar esta acción.'
            ], 403);
        }

        return $next($request);
    }
}
