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
            ? explode(',', env('CORS_ALLOWED_ORIGINS')) 
            : ['*'];
        
        $origin = $request->headers->get('Origin');
        
        // Si el origen está en la lista o se permite todo
        $allowed = in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins);
        
        $response = $next($request);
        
        if ($allowed && $origin) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } elseif (in_array('*', $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Max-Age', '86400');
        
        // Manejar preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 200, $response->headers->all());
        }
        
        return $response;
    }
}

