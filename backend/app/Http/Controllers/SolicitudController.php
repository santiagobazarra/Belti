<?php
namespace App\Http\Controllers;

use App\Models\Solicitud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Enums\SolicitudEstado;

class SolicitudController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $this->authorize('viewAny', Solicitud::class);
        $user = Auth::user();
        $q = Solicitud::with(['usuario','aprobador']);
        if($user->role?->slug !== 'administrador') {
            $q->where('id_usuario',$user->id_usuario);
        }
        $q->filtro($request->all())->orderByDesc('fecha_inicio');
        return $q->paginate(15);
    }

    public function store(Request $request)
    {
    $this->authorize('create', Solicitud::class);
        $user = Auth::user();
        $data = $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'tipo' => 'required|in:vacaciones,permiso,baja_medica,otro',
            'motivo' => 'nullable|string'
        ]);
        $data['id_usuario'] = $user->id_usuario;
        $sol = Solicitud::create($data);
        return response()->json($sol->load('usuario'),201);
    }

    public function show($id)
    {
        $sol = Solicitud::with(['usuario','aprobador'])->findOrFail($id);
    $this->authorize('view', $sol);
        return $sol;
    }

    public function update(Request $request, $id)
    {
        $sol = Solicitud::findOrFail($id);
        $this->authorize('update', $sol);
        $user = Auth::user();
        if($user->role?->slug === 'administrador') {
            $data = $request->validate([
                'estado' => 'in:'.implode(',', SolicitudEstado::values()),
                'comentario_resolucion' => 'nullable|string',
                'motivo' => 'sometimes|string|nullable'
            ]);
            if(isset($data['estado']) && $data['estado'] !== $sol->estado) {
                $data['fecha_resolucion'] = now();
                $data['id_aprobador'] = $user->id_usuario;
            }
        } else {
            if($request->hasAny(['estado','comentario_resolucion'])) {
                return response()->json([
                    'success'=>false,
                    'error'=>[
                        'code'=>'FORBIDDEN',
                        'message'=>'No autorizado a modificar estos campos'
                    ]
                ],403);
            }
            $data = $request->validate([
                'motivo' => 'required|string'
            ]);
        }
        $sol->update($data);
        return $sol->fresh(['aprobador']);
    }

    public function destroy($id)
    {
        $sol = Solicitud::findOrFail($id);
    $this->authorize('delete', $sol);
        $sol->delete();
        return response()->json([
            'deleted' => true,
            'resource' => 'solicitud',
            'id' => $id,
            'message' => 'Solicitud eliminada',
            'timestamp' => now()->toISOString()
        ]);
    }
}
