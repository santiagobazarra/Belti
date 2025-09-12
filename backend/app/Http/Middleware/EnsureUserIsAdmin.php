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
        if (!$user || !$user->role || $user->role->nombre !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        return $next($request);
    }
}
