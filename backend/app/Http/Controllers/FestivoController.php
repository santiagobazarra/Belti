<?php
namespace App\Http\Controllers;

use App\Models\Festivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FestivoController extends Controller
{
    public function index(Request $request)
    {
        // Validación ligera de filtros
        $request->validate([
            'desde' => 'sometimes|date',
            'hasta' => 'sometimes|date|after_or_equal:desde',
            'tipo'  => 'sometimes|string'
        ]);

        $q = Festivo::query();
        if ($request->filled('desde')) {
            $q->whereDate('fecha', '>=', $request->get('desde'));
        }
        if ($request->filled('hasta')) {
            $q->whereDate('fecha', '<=', $request->get('hasta'));
        }
        if ($request->filled('tipo')) {
            $q->where('tipo', $request->get('tipo'));
        }
        return $q->orderBy('fecha')->paginate(50);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();
        $data = $request->validate([
            'fecha' => 'required|date|unique:calendario_festivos,fecha',
            'descripcion' => 'required|string|max:255',
            'tipo' => 'required|string|max:100'
        ]);
        $festivo = Festivo::create($data);
        return response()->json($festivo, 201);
    }

    public function show(Festivo $festivo)
    {
        return $festivo;
    }

    public function update(Request $request, Festivo $festivo)
    {
        $this->authorizeAdmin();
        $data = $request->validate([
            'fecha' => 'date|unique:calendario_festivos,fecha,'.$festivo->id_festivo.',id_festivo',
            'descripcion' => 'sometimes|string|max:255',
            'tipo' => 'sometimes|string|max:100'
        ]);
        $festivo->update($data);
        return $festivo;
    }

    public function destroy(Festivo $festivo)
    {
        $this->authorizeAdmin();
        $festivo->delete();
        return response()->json([
            'deleted' => true,
            'resource' => 'festivo',
            'id' => $festivo->id_festivo,
            'message' => 'Festivo eliminado',
            'timestamp' => now()->toISOString()
        ]);
    }

    private function authorizeAdmin(): void
    {
        $u = Auth::user();
        if(!$u || !$u->role || $u->role->slug !== 'administrador') abort(403);
    }
}
