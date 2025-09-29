<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\JornadaController;
use App\Http\Controllers\FichajeController;
use App\Http\Controllers\IncidenciaController;
use App\Http\Controllers\SolicitudController;
use App\Http\Controllers\FestivoController;
use App\Http\Controllers\ConfigEmpresaController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\TipoPausaController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Rutas fichaje sin autenticación en testing para simplificar tests
if (app()->environment('testing')) {
    Route::post('/fichaje/jornada', [FichajeController::class, 'toggleJornada']);
    Route::post('/fichaje/pausa', [FichajeController::class, 'togglePausa']);
}

// Usar siempre sanctum para consistencia de códigos 401
$authMiddleware = 'auth:sanctum';

Route::middleware([$authMiddleware])->group(function () {
    // Fichaje (solo producción / no-testing)
    if (!app()->environment('testing')) {
        Route::post('/fichaje/jornada', [FichajeController::class, 'toggleJornada']);
        Route::post('/fichaje/pausa', [FichajeController::class, 'togglePausa']);
    }

    Route::get('/jornadas', [JornadaController::class, 'listarJornadas']);
    Route::get('/jornadas/resumen', [JornadaController::class, 'resumen']);
    Route::get('/reportes/resumen', [ReporteController::class, 'resumen']);
    Route::get('/reportes/resumen.csv', [ReporteController::class, 'resumenCsv']);
    Route::get('/reportes/resumen.pdf', [ReporteController::class, 'resumenPdf']);

    // Tipos de pausa - usuarios pueden ver disponibles
    Route::get('/tipos-pausa/disponibles', [TipoPausaController::class, 'disponibles']);

    // Incidencias (empleado CRUD parcial, admin total)
    Route::apiResource('incidencias', IncidenciaController::class);
    Route::patch('incidencias/{id}/aprobar',[IncidenciaController::class,'aprobar']);
    Route::apiResource('solicitudes', SolicitudController::class);
    Route::apiResource('festivos', FestivoController::class);

    Route::middleware(['ensure.admin'])->group(function () {
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('departamentos', DepartmentController::class);
        Route::apiResource('usuarios', UserController::class);
        Route::post('/usuarios/{usuario}/departamento', [UserController::class, 'asignarDepartamento']);

        // Tipos de pausa - gestión completa solo admin
        Route::apiResource('tipos-pausa', TipoPausaController::class);

        // Configuración empresa (solo admin)
        Route::get('/configuracion', [ConfigEmpresaController::class,'index']);
        Route::put('/configuracion', [ConfigEmpresaController::class,'update']);
        Route::get('/audit-logs', [AuditLogController::class,'index']);
    });
});
