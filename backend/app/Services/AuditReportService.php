<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditReportService
{
    /**
     * Registrar generación de reporte en auditoría
     */
    public static function logReportGeneration(string $reportType, string $format, array $filters = [])
    {
        try {
            // Generar un ID único para el reporte basado en timestamp y usuario
            $reportId = Auth::id() . '_' . time() . '_' . substr(md5($reportType . $format), 0, 8);
            
            AuditLog::create([
                'id_usuario' => Auth::id(),
                'model_type' => 'Reporte',
                'model_id' => $reportId,
                'action' => 'report_generated',
                'changes' => [
                    'action' => 'report_generated',
                    'description' => "Generó reporte {$reportType} en formato {$format}",
                    'data' => [
                        'report_type' => $reportType,
                        'format' => $format,
                        'filters' => $filters,
                        'generated_at' => now()->toISOString(),
                        'report_id' => $reportId,
                    ],
                ],
                'new_values' => [
                    'action' => 'report_generated',
                    'description' => "Generó reporte {$reportType} en formato {$format}",
                    'data' => [
                        'report_type' => $reportType,
                        'format' => $format,
                        'filters' => $filters,
                        'generated_at' => now()->toISOString(),
                        'report_id' => $reportId,
                    ],
                ],
                'old_values' => [],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Throwable $e) {
            error_log('Audit report generation error: ' . $e->getMessage());
        }
    }

    /**
     * Registrar descarga de reporte
     */
    public static function logReportDownload(string $reportType, string $format, array $filters = [])
    {
        try {
            // Generar un ID único para el reporte basado en timestamp y usuario
            $reportId = Auth::id() . '_' . time() . '_' . substr(md5($reportType . $format), 0, 8);
            
            AuditLog::create([
                'id_usuario' => Auth::id(),
                'model_type' => 'Reporte',
                'model_id' => $reportId,
                'action' => 'report_downloaded',
                'changes' => [
                    'action' => 'report_downloaded',
                    'description' => "Descargó reporte {$reportType} en formato {$format}",
                    'data' => [
                        'report_type' => $reportType,
                        'format' => $format,
                        'filters' => $filters,
                        'downloaded_at' => now()->toISOString(),
                        'report_id' => $reportId,
                    ],
                ],
                'new_values' => [
                    'action' => 'report_downloaded',
                    'description' => "Descargó reporte {$reportType} en formato {$format}",
                    'data' => [
                        'report_type' => $reportType,
                        'format' => $format,
                        'filters' => $filters,
                        'downloaded_at' => now()->toISOString(),
                        'report_id' => $reportId,
                    ],
                ],
                'old_values' => [],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Throwable $e) {
            error_log('Audit report download error: ' . $e->getMessage());
        }
    }
}

