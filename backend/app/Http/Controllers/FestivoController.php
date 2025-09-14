<?php
namespace App\Http\Controllers;

use App\Models\Festivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FestivoController extends Controller
{
    public function index(Request $request)
    {
        $q = Festivo::query();
        if($request->filled(['desde','hasta'])) {
            $q->entre($request->get('desde'),$request->get('hasta'));
        }
        return $q->orderBy('fecha')->paginate(50);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();
        $data = $request->validate([
            'fecha' => 'required|date|unique:calendario_festivos,fecha',
            'descripcion' => 'required|string',
            'tipo' => 'required|string'
        ]);
        return Festivo::create($data);
    }

    public function show($id)
    {
        return Festivo::findOrFail($id);
    }

    public function update(Request $request,$id)
    {
        $this->authorizeAdmin();
        $festivo = Festivo::findOrFail($id);
        $data = $request->validate([
            'fecha' => 'date|unique:calendario_festivos,fecha,'.$festivo->id_festivo.',id_festivo',
            'descripcion' => 'sometimes|string',
            'tipo' => 'sometimes|string'
        ]);
        $festivo->update($data);
        return $festivo;
    }

    public function destroy($id)
    {
        $this->authorizeAdmin();
        $festivo = Festivo::findOrFail($id);
        $festivo->delete();
        return response()->json(['deleted'=>true]);
    }

    private function authorizeAdmin(): void
    {
        $u = Auth::user();
        if(!$u || !$u->role || $u->role->slug !== 'administrador') abort(403);
    }
}
