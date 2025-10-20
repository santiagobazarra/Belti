<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait AuditActions
{
    /**
     * Registrar una acción específica en el log de auditoría
     */
    protected function auditAction(string $action, string $description, array $data = [])
    {
        try {
            AuditLog::create([
                'id_usuario' => Auth::id(),
                'model_type' => static::class,
                'model_id' => $this->getKey(),
                'action' => $action,
                'changes' => [
                    'action' => $action,
                    'description' => $description,
                    'data' => $data,
                ],
                'new_values' => [
                    'action' => $action,
                    'description' => $description,
                    'data' => $data,
                ],
                'old_values' => [],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Throwable $e) {
            error_log('Audit action error: ' . $e->getMessage());
        }
    }

    /**
     * Registrar aprobación de solicitud/incidencia
     */
    protected function auditApproval(string $type, string $reason = null)
    {
        $this->auditAction('approved', "Aprobó {$type}", [
            'type' => $type,
            'reason' => $reason,
            'approved_at' => now()->toISOString(),
        ]);
    }

    /**
     * Registrar rechazo de solicitud/incidencia
     */
    protected function auditRejection(string $type, string $reason = null)
    {
        $this->auditAction('rejected', "Rechazó {$type}", [
            'type' => $type,
            'reason' => $reason,
            'rejected_at' => now()->toISOString(),
        ]);
    }

    /**
     * Registrar generación de reporte
     */
    protected function auditReportGeneration(string $reportType, string $format, array $filters = [])
    {
        $this->auditAction('report_generated', "Generó reporte {$reportType} en formato {$format}", [
            'report_type' => $reportType,
            'format' => $format,
            'filters' => $filters,
            'generated_at' => now()->toISOString(),
        ]);
    }
}
