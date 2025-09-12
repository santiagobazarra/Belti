<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\JornadaController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->group(function () {
    // Jornadas propias
    Route::post('jornadas/iniciar', [JornadaController::class,'iniciarJornada']);
    Route::post('jornadas/{jornada}/finalizar', [JornadaController::class,'finalizarJornada']);
    Route::post('jornadas/{jornada}/pausas/iniciar', [JornadaController::class,'iniciarPausa']);
    Route::post('jornadas/{jornada}/pausas/{pausa}/finalizar', [JornadaController::class,'finalizarPausa']);
    Route::get('jornadas', [JornadaController::class,'listarJornadas']);
    Route::get('jornadas/resumen', [JornadaController::class,'resumen']);

    Route::middleware(['ensure.admin'])->group(function () {
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('departamentos', DepartmentController::class);
        Route::apiResource('usuarios', UserController::class);
        Route::post('usuarios/{usuario}/assign-departamento', [UserController::class,'assignDepartamento']);
    });
});
