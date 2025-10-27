<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Services\AuditReportService;

echo "=== TEST DE AUDITORÍA DE REPORTES ===\n\n";

// 1. Verificar que la clase AuditReportService existe
echo "1. Verificando que AuditReportService existe...\n";
if (class_exists('App\Services\AuditReportService')) {
    echo "   ✓ Clase encontrada\n";
} else {
    echo "   ✗ Clase NO encontrada\n";
    exit(1);
}

// 2. Verificar que el método logReportGeneration existe
echo "\n2. Verificando que el método logReportGeneration existe...\n";
if (method_exists('App\Services\AuditReportService', 'logReportGeneration')) {
    echo "   ✓ Método encontrado\n";
} else {
    echo "   ✗ Método NO encontrado\n";
    exit(1);
}

// 3. Contar registros antes
echo "\n3. Contando registros de auditoría antes del test...\n";
$countBefore = DB::table('audit_logs')->count();
echo "   Total registros: $countBefore\n";

// 4. Intentar registrar un reporte de prueba
echo "\n4. Intentando registrar un reporte de prueba...\n";
try {
    // Simular un usuario autenticado
    $user = DB::table('usuarios')->first();
    if (!$user) {
        echo "   ✗ No hay usuarios en la base de datos\n";
        exit(1);
    }
    
    echo "   Usuario de prueba: {$user->nombre} (ID: {$user->id_usuario})\n";
    
    // Simular autenticación
    Auth::loginUsingId($user->id_usuario);
    
    // Llamar al método
    AuditReportService::logReportGeneration('test', 'json', ['test' => 'data']);
    echo "   ✓ Método ejecutado sin errores\n";
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    echo "   Stack: " . $e->getTraceAsString() . "\n";
    exit(1);
}

// 5. Contar registros después
echo "\n5. Contando registros de auditoría después del test...\n";
$countAfter = DB::table('audit_logs')->count();
echo "   Total registros: $countAfter\n";
echo "   Nuevos registros: " . ($countAfter - $countBefore) . "\n";

// 6. Verificar el registro creado
echo "\n6. Verificando el registro creado...\n";
$lastLog = DB::table('audit_logs')
    ->where('model_type', 'Reporte')
    ->where('action', 'report_generated')
    ->latest('created_at')
    ->first();

if ($lastLog) {
    echo "   ✓ Registro encontrado:\n";
    echo "     ID: {$lastLog->id}\n";
    echo "     Model Type: {$lastLog->model_type}\n";
    echo "     Action: {$lastLog->action}\n";
    echo "     Created At: {$lastLog->created_at}\n";
} else {
    echo "   ✗ Registro NO encontrado\n";
}

// 7. Verificar si el endpoint de auditoría devuelve el registro
echo "\n7. Verificando si el endpoint de auditoría devuelve el registro...\n";
$auditLogs = DB::table('audit_logs')
    ->where('model_type', 'LIKE', '%Reporte%')
    ->orWhere('model_type', '=', 'Reporte')
    ->latest('created_at')
    ->limit(5)
    ->get(['id', 'model_type', 'action', 'created_at']);

echo "   Registros encontrados con 'Reporte': " . count($auditLogs) . "\n";
foreach ($auditLogs as $log) {
    echo "     - ID: {$log->id} | Modelo: {$log->model_type} | Acción: {$log->action}\n";
}

echo "\n=== FIN DEL TEST ===\n";
