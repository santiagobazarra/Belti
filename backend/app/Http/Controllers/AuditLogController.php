<?php
namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if(!$user || !$user->role || $user->role->slug !== 'administrador') {
            return response()->json(['message'=>'Forbidden'],403);
        }
        
        $query = AuditLog::with(['usuario' => function($q) {
                $q->select('id_usuario', 'nombre', 'apellidos', 'email', 'id_rol', 'id_departamento', 'activo');
                $q->with([
                    'role:id_rol,nombre,slug',
                    'departamento:id_departamento,nombre'
                ]);
            }])
            ->latest('created_at');
            
        if($request->filled('model')) {
            // Filtrar por model_type usando LIKE para soportar nombres cortos y con namespace
            // Buscar tanto "Reporte" como "App\Models\Reporte"
            $query->where(function($q) use ($request) {
                $q->where('model_type', 'LIKE', '%' . $request->model)
                  ->orWhere('model_type', '=', $request->model);
            });
        }
        if($request->filled('usuario_id')) $query->where('id_usuario',$request->usuario_id);
        if($request->filled('accion')) $query->where('action',$request->accion);
        if($request->filled('desde')) $query->whereDate('created_at','>=',$request->desde);
        if($request->filled('hasta')) $query->whereDate('created_at','<=',$request->hasta);
        
        $logs = $query->paginate($request->get('per_page',20));
        return $logs;
    }

    /**
     * Obtener detalles completos de un log de auditoría específico
     */
    public function show($id)
    {
        $user = Auth::user();
        if(!$user || !$user->role || $user->role->slug !== 'administrador') {
            return response()->json(['message'=>'Forbidden'],403);
        }

        $log = AuditLog::with(['usuario' => function($q) {
                $q->select('id_usuario', 'nombre', 'apellidos', 'email', 'id_rol', 'id_departamento', 'activo', 'created_at');
                $q->with([
                    'role:id_rol,nombre,slug',
                    'departamento:id_departamento,nombre'
                ]);
            }])
            ->findOrFail($id);

        // Formatear respuesta según especificaciones del prompt
        return response()->json([
            'id_auditoria' => $log->id,
            'usuario' => $log->usuario ? [
                'id' => $log->usuario->id_usuario,
                'nombre' => $log->usuario->nombre . ' ' . ($log->usuario->apellidos ?? ''),
                'email' => $log->usuario->email,
                'rol' => $log->usuario->role ? $log->usuario->role->nombre : 'Sin rol',
                'role_name' => $log->usuario->role ? $log->usuario->role->nombre : 'Sin rol',
                'departamento' => $log->usuario->departamento ? $log->usuario->departamento->nombre : 'Sin departamento',
                'department_name' => $log->usuario->departamento ? $log->usuario->departamento->nombre : 'Sin departamento',
                'activo' => (bool) $log->usuario->activo,
                'created_at' => $log->usuario->created_at ?? null,
                'role' => $log->usuario->role,
                'department' => $log->usuario->departamento
            ] : null,
            'accion' => $log->action,
            'descripcion' => $this->generarDescripcion($log),
            'fecha_hora' => $log->created_at->toIso8601String(),
            'entidad' => $log->model_type,
            'id_entidad' => $log->model_id,
            'cambios' => $this->formatearCambios($log),
            'valores_anteriores' => $log->old_values,
            'valores_nuevos' => $log->new_values,
            'contexto' => [
                'modulo' => $this->determinarModulo($log->model_type),
                'ip' => $log->ip_address ?? 'No registrada',
                'navegador' => $log->user_agent ?? 'Desconocido',
                'dispositivo' => $this->extraerDispositivo($log->user_agent),
                'hora_servidor' => $log->created_at->toIso8601String(),
                'hora_dispositivo' => $log->created_at->toIso8601String() // Si se guarda por separado, usar ese campo
            ],
            'resultado' => 'success', // Siempre success porque si falla no se registra
            'mensaje_sistema' => $this->generarMensajeSistema($log),
            'revisado_por' => null, // Para futuras implementaciones
            'comentario_revisor' => null // Para futuras implementaciones
        ]);
    }

    /**
     * Generar descripción narrativa del evento
     */
    private function generarDescripcion($log)
    {
        $accion = [
            'created' => 'creó',
            'updated' => 'modificó',
            'deleted' => 'eliminó',
            'report_generated' => 'generó',
            'report_downloaded' => 'descargó',
            'approved' => 'aprobó',
            'rejected' => 'rechazó'
        ][$log->action] ?? 'realizó una acción sobre';

        $usuario = $log->usuario 
            ? $log->usuario->nombre . ' ' . $log->usuario->apellidos 
            : 'Sistema automático';

        $entidad = [
            'Incidencia' => 'la incidencia',
            'Solicitud' => 'la solicitud',
            'Jornada' => 'el registro de jornada',
            'Pausa' => 'el registro de pausa',
            'User' => 'el usuario',
            'Festivo' => 'el festivo',
            'Department' => 'el departamento',
            'Role' => 'el rol',
            'Reporte' => 'un reporte'
        ][$log->model_type] ?? 'el registro';

        return "{$usuario} {$accion} {$entidad} #{$log->model_id}";
    }

    /**
     * Formatear cambios para mostrar old/new
     */
    private function formatearCambios($log)
    {
        if ($log->action !== 'updated' || !$log->old_values || !$log->new_values) {
            return null;
        }

        $cambios = [];
        $allKeys = array_unique(array_merge(
            array_keys($log->old_values),
            array_keys($log->new_values)
        ));

        foreach ($allKeys as $key) {
            $oldVal = $log->old_values[$key] ?? null;
            $newVal = $log->new_values[$key] ?? null;

            if (json_encode($oldVal) !== json_encode($newVal)) {
                $cambios[$key] = [
                    'old' => $oldVal,
                    'new' => $newVal
                ];
            }
        }

        return $cambios;
    }

    /**
     * Determinar módulo funcional
     */
    private function determinarModulo($modelType)
    {
        $modulos = [
            'Jornada' => 'Fichaje',
            'Pausa' => 'Pausas',
            'Incidencia' => 'Incidencias',
            'Solicitud' => 'Solicitudes',
            'User' => 'Administración',
            'Department' => 'Administración',
            'Role' => 'Administración',
            'Festivo' => 'Configuración',
            'Reporte' => 'Reportes'
        ];

        return $modulos[$modelType] ?? 'Sistema';
    }

    /**
     * Extraer información del dispositivo desde user agent
     */
    private function extraerDispositivo($userAgent)
    {
        if (!$userAgent) return 'Desconocido';

        // Detectar SO
        if (preg_match('/Windows NT 10/i', $userAgent)) return 'Windows 10';
        if (preg_match('/Windows NT 11/i', $userAgent)) return 'Windows 11';
        if (preg_match('/Mac OS X/i', $userAgent)) return 'macOS';
        if (preg_match('/Linux/i', $userAgent)) return 'Linux';
        if (preg_match('/Android/i', $userAgent)) return 'Android';
        if (preg_match('/iOS/i', $userAgent)) return 'iOS';

        return 'Otro';
    }

    /**
     * Generar mensaje del sistema
     */
    private function generarMensajeSistema($log)
    {
        $mensajes = [
            'created' => 'Registro creado correctamente',
            'updated' => 'Registro actualizado correctamente',
            'deleted' => 'Registro eliminado correctamente'
        ];

        return $mensajes[$log->action] ?? 'Operación completada correctamente';
    }
}
