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
        $allowedOrigins = env('CORS_ALLOWED_ORIGINS') 
            ? array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS'))) 
            : ['*'];
        
        $origin = $request->headers->get('Origin');
        
        // Manejar preflight requests primero
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 200);
        } else {
            $response = $next($request);
        }
        
        // Determinar el origen permitido
        if (in_array('*', $allowedOrigins)) {
            $allowedOrigin = '*';
        } elseif ($origin && in_array($origin, $allowedOrigins)) {
            $allowedOrigin = $origin;
        } else {
            $allowedOrigin = null;
        }
        
        // Agregar headers CORS
        if ($allowedOrigin) {
            $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '86400');
        
        return $response;
    }
}

