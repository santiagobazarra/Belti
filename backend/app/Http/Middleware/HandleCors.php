<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Manejar preflight requests primero
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 200);
        } else {
            try {
                $response = $next($request);
            } catch (\Throwable $e) {
                // Si hay un error, crear una respuesta de error pero con CORS
                $response = response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'SERVER_ERROR',
                        'message' => config('app.debug') ? $e->getMessage() : 'Error interno',
                    ]
                ], 500);
            }
        }
        
        // Obtener origen de la petición
        $origin = $request->headers->get('Origin', '');
        
        // Obtener orígenes permitidos
        $allowedOrigins = env('CORS_ALLOWED_ORIGINS', '*');
        
        // Determinar origen permitido
        if ($allowedOrigins === '*' || empty($allowedOrigins)) {
            $allowedOrigin = '*';
        } else {
            $origins = array_map('trim', explode(',', $allowedOrigins));
            if ($origin && in_array($origin, $origins)) {
                $allowedOrigin = $origin;
            } else {
                $allowedOrigin = '*'; // Permitir todo por defecto si no coincide
            }
        }
        
        // Agregar headers CORS siempre
        if ($response) {
            $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
        }
        
        return $response;
    }
}

