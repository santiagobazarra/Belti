<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Exceptions\FichajeException;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\Authenticate;
use App\Http\Middleware\HandleCors;

/** @var \Illuminate\Foundation\Application $app */
$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'ensure.admin' => EnsureUserIsAdmin::class,
            'auth' => Authenticate::class,
        ]);
        
        // CORS temporalmente deshabilitado para debug
        // $middleware->api(prepend: [
        //     \App\Http\Middleware\HandleCors::class,
        // ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApi = function($request){
            return str_starts_with($request->path(), 'api/');
        };

        $exceptions->render(function(ValidationException $e, $request) use ($isApi) {
            if ($isApi($request) || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'VALIDATION_ERROR',
                        'message' => 'Datos inválidos',
                        'details' => $e->errors(),
                    ]
                ], 422);
            }
            return null;
        });

        $exceptions->render(function(AuthenticationException $e, $request) use ($isApi) {
            if ($isApi($request) || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'UNAUTHENTICATED',
                        'message' => 'Autenticación requerida',
                    ]
                ], 401);
            }
            return null;
        });

        $exceptions->render(function(FichajeException $e, $request) use ($isApi) {
            if ($isApi($request) || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'FICHAJE_ERROR',
                        'message' => $e->getMessage(),
                    ]
                ], $e->status ?? 422);
            }
            return null;
        });

        $exceptions->render(function(NotFoundHttpException $e, $request) use ($isApi) {
            if ($isApi($request) || $request->expectsJson()) {
                $response = response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'NOT_FOUND',
                        'message' => 'Recurso no encontrado',
                    ]
                ], 404);
                
                // Agregar headers CORS a la respuesta 404
                $origin = $request->headers->get('Origin');
                $allowedOrigins = env('CORS_ALLOWED_ORIGINS', '*');
                $allowedOrigin = ($allowedOrigins === '*') ? '*' : ($origin ?: '*');
                $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin);
                $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
                
                return $response;
            }
            return null;
        });

        $exceptions->render(function(HttpExceptionInterface $e, $request) use ($isApi) {
            if ($isApi($request) || $request->expectsJson()) {
                $status = $e->getStatusCode();
                $codeMap = [403=>'FORBIDDEN',405=>'METHOD_NOT_ALLOWED'];
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => $codeMap[$status] ?? 'HTTP_ERROR',
                        'message' => $e->getMessage() ?: match($status){
                            401=>'No autenticado',403=>'Acceso denegado',404=>'No encontrado',405=>'Método no permitido',default=>'Error HTTP'
                        },
                    ]
                ], $status);
            }
            return null;
        });

        // Fallback genérico
        $exceptions->render(function(Throwable $e, $request) use ($isApi) {
            if ($isApi($request) || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'SERVER_ERROR',
                        'message' => config('app.debug') ? $e->getMessage() : 'Error interno',
                    ]
                ], 500);
            }
            return null; // dejar a Laravel para web
        });
    })->create();

// Registrar macros de respuesta uniformes
try { $app->register(App\Providers\ResponseMacroServiceProvider::class); } catch (\Throwable $e) {}

return $app;
