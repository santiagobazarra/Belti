<?php
namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;

class Authenticate extends Middleware
{
    protected function redirectTo($request): ?string
    {
        // No redirecciones para API; provocar excepción estándar
        return null;
    }

    protected function unauthenticated($request, array $guards)
    {
        if (str_starts_with($request->path(), 'api/')) {
            throw new AuthenticationException('Autenticación requerida', $guards);
        }
        parent::unauthenticated($request, $guards);
    }
}
