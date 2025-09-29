<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
    if (!$user || !$user->role || $user->role->slug !== 'administrador') {
            abort(403, 'Acceso denegado');
        }
        return $next($request);
    }
}
