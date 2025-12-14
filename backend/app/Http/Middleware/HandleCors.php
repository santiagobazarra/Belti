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
        // Permitir todos los orígenes temporalmente para debug
        $allowedOrigins = env('CORS_ALLOWED_ORIGINS', '*');
        
        if ($allowedOrigins === '*') {
            $allowedOrigin = '*';
        } else {
            $origins = array_map('trim', explode(',', $allowedOrigins));
            $origin = $request->headers->get('Origin');
            $allowedOrigin = ($origin && in_array($origin, $origins)) ? $origin : null;
        }
        
        // Manejar preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 200);
        } else {
            $response = $next($request);
        }
        
        // Agregar headers CORS siempre
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

