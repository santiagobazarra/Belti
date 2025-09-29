<?php
namespace App\Http\Controllers;

use App\Models\Incidencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Enums\IncidenciaEstado;
use App\Exceptions\IncidenciaException;
use App\Services\IncidenciaService;

class IncidenciaController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $this->authorize('viewAny', Incidencia::class);
        $user = Auth::user();
        $query = Incidencia::with(['usuario','revisor']);
        if($user->role?->slug !== 'administrador') {
            $query->where('id_usuario',$user->id_usuario);
        }
      $query->filtroBasico($request->all())
          ->orderByDesc('fecha')
          ->orderByDesc('hora_inicio')
          ->orderByDesc('created_at');
        return $query->paginate(15);
    }

    public function store(Request $request)
    {
    $this->authorize('create', Incidencia::class);
        $user = Auth::user();
        $data = $request->validate([
            'fecha' => 'required|date',
            'tipo' => 'required|in:falta,retraso,ausencia_parcial,anomalia_horas,otra',
            'descripcion' => 'nullable|string',
            'hora_inicio' => 'nullable|date_format:H:i',
            'hora_fin' => 'nullable|date_format:H:i'
        ]);
        // Tipos que requieren rango
        if(in_array($data['tipo'], ['anomalia_horas','ausencia_parcial']) && (!isset($data['hora_inicio']) || !isset($data['hora_fin']))) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'hora_inicio y hora_fin obligatorios para el tipo '.$data['tipo'],
                    'details' => ['hora_inicio' => ['Obligatorio'],'hora_fin' => ['Obligatorio']]
                ]
            ],422);
        }
        $data['id_usuario'] = $user->id_usuario;
        if(isset($data['hora_inicio']) && isset($data['hora_fin'])) {
            $fechaBase = $data['fecha'];
            $data['hora_inicio'] = $fechaBase.' '.$data['hora_inicio'].':00';
            $data['hora_fin'] = $fechaBase.' '.$data['hora_fin'].':00';
        }
        $inc = Incidencia::create($data);
        return response()->json($inc->load('usuario'),201);
    }

    public function show($id)
    {
        $inc = Incidencia::with(['usuario','revisor'])->findOrFail($id);
    $this->authorize('view', $inc);
        return $inc;
    }

    public function update(Request $request, $id)
    {
        $inc = Incidencia::findOrFail($id);
        $this->authorize('update', $inc);
        $user = Auth::user();
        // Determinar validación según rol
        if($user->role?->slug === 'administrador') {
            $data = $request->validate([
                'estado' => 'in:'.implode(',', IncidenciaEstado::values()),
                'comentario_revision' => 'nullable|string',
                'hora_inicio' => 'nullable|date_format:H:i',
                'hora_fin' => 'nullable|date_format:H:i'
            ]);
            if(isset($data['estado']) && $data['estado'] !== $inc->estado) {
                $data['fecha_revision'] = now();
                $data['id_revisor'] = $user->id_usuario;
            }
        } else {
            // Empleado: si intenta enviar campos restringidos -> 403
            if($request->hasAny(['estado','hora_inicio','hora_fin','comentario_revision'])) {
                return response()->json([
                    'success'=>false,
                    'error'=>[
                        'code'=>'FORBIDDEN',
                        'message'=>'No autorizado a modificar estos campos'
                    ]
                ],403);
            }
            // empleado sólo puede tocar descripción
            $data = $request->validate([
                'descripcion' => 'required|string'
            ]);
        }
        if(isset($data['hora_inicio']) xor isset($data['hora_fin'])) {
            return response()->json([
                'success'=>false,
                'error'=>[
                    'code'=>'VALIDATION_ERROR',
                    'message'=>'Debe proporcionar ambos hora_inicio y hora_fin',
                    'details'=>['hora_inicio'=>['Requerido con hora_fin'], 'hora_fin'=>['Requerido con hora_inicio']]
                ]
            ],422);
        }
        if(isset($data['hora_inicio']) && isset($data['hora_fin']) && $data['hora_inicio'] >= $data['hora_fin']) {
            return response()->json([
                'success'=>false,
                'error'=>[
                    'code'=>'VALIDATION_ERROR',
                    'message'=>'hora_inicio debe ser menor que hora_fin'
                ]
            ],422);
        }
        if(isset($data['hora_inicio']) && isset($data['hora_fin'])) {
            $fechaBase = $inc->fecha->toDateString();
            $data['hora_inicio'] = $fechaBase.' '.$data['hora_inicio'].':00';
            $data['hora_fin'] = $fechaBase.' '.$data['hora_fin'].':00';
        }
        $inc->update($data);
        return $inc->fresh(['revisor']);
    }

    public function aprobar($id, IncidenciaService $service)
    {
        $inc = Incidencia::findOrFail($id);
        $this->authorize('update', $inc); // o ability específica approve
        if($inc->estado !== IncidenciaEstado::PENDIENTE->value) {
            return response()->json([
                'success'=>false,
                'error'=>[
                    'code'=>'INCIDENCIA_NO_PENDIENTE',
                    'message'=>'Solo incidencias en estado pendiente pueden aprobarse'
                ]
            ],409);
        }
        if(!$inc->hora_inicio || !$inc->hora_fin) {
            return response()->json([
                'success'=>false,
                'error'=>[
                    'code'=>'INCIDENCIA_SIN_RANGO',
                    'message'=>'La incidencia no tiene rango horario'
                ]
            ],422);
        }
    $inc->estado = IncidenciaEstado::APROBADA->value;
        $inc->fecha_revision = now();
        $inc->id_revisor = Auth::id();
        $inc->save();
        try {
            $service->aplicar($inc->fresh());
        } catch(IncidenciaException $e) {
            return response()->json([
                'success'=>false,
                'error'=>[
                    'code'=>$e->codeKey,
                    'message'=>$e->getMessage()
                ]
            ],422);
        }
        return $inc->fresh(['revisor']);
    }

    public function destroy($id)
    {
        $inc = Incidencia::findOrFail($id);
    $this->authorize('delete', $inc);
        $inc->delete();
        return response()->json([
            'deleted' => true,
            'resource' => 'incidencia',
            'id' => $id,
            'message' => 'Incidencia eliminada',
            'timestamp' => now()->toISOString()
        ]);
    }
}
