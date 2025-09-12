<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware(['ensure.admin'])->group(function () {
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('departamentos', DepartmentController::class);
        Route::apiResource('usuarios', UserController::class);
        Route::post('usuarios/{usuario}/assign-departamento', [UserController::class,'assignDepartamento']);
    });
});
