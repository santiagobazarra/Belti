<?php
namespace App\Http\Controllers;

use App\Models\Incidencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Enums\IncidenciaEstado;

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
        $query->filtroBasico($request->all())->orderByDesc('fecha');
        return $query->paginate(15);
    }

    public function store(Request $request)
    {
    $this->authorize('create', Incidencia::class);
        $user = Auth::user();
        $data = $request->validate([
            'fecha' => 'required|date',
            'tipo' => 'required|in:falta,retraso,ausencia_parcial,anomalia_horas,otra',
            'descripcion' => 'nullable|string'
        ]);
        $data['id_usuario'] = $user->id_usuario;
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
                'comentario_revision' => 'nullable|string'
            ]);
            if(isset($data['estado']) && $data['estado'] !== $inc->estado) {
                $data['fecha_revision'] = now();
                $data['id_revisor'] = $user->id_usuario;
            }
        } else {
            // empleado sólo puede tocar descripción
            $data = $request->validate([
                'descripcion' => 'required|string'
            ]);
        }
        $inc->update($data);
        return $inc->fresh(['revisor']);
    }

    public function destroy($id)
    {
        $inc = Incidencia::findOrFail($id);
    $this->authorize('delete', $inc);
        $inc->delete();
        return response()->json(['deleted'=>true]);
    }
}
