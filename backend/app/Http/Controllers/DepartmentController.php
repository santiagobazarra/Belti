<?php
namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DepartmentController extends Controller
{
    public function index()
    {
        return response()->json(Department::withCount('usuarios')->get());
    }

    public function store(Request $request)
    {
    $this->authorizeAdmin();
        $data = $request->validate([
            'nombre' => 'required|string|max:150|unique:departamentos,nombre',
            'descripcion' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icono' => 'nullable|string|max:50'
        ]);
        $department = Department::create($data);
        return response()->json($department, 201);
    }

    public function show(Department $departamento)
    {
        return response()->json($departamento->load('usuarios'));
    }

    public function update(Request $request, Department $departamento)
    {
        $this->authorizeAdmin();
        $data = $request->validate([
            'nombre' => 'sometimes|required|string|max:150|unique:departamentos,nombre,' . $departamento->id_departamento . ',id_departamento',
            'descripcion' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'icono' => 'nullable|string|max:50'
        ]);
        $departamento->update($data);
        return response()->json($departamento);
    }

    public function destroy(Department $departamento)
    {
        $this->authorizeAdmin();
        if ($departamento->usuarios()->exists()) {
            return response()->json(['message' => 'No se puede eliminar: hay usuarios asignados'], 422);
        }
        $departamento->delete();
        return response()->json(['message' => 'Departamento eliminado']);
    }

    private function authorizeAdmin(): void
    {
        $u = Auth::user();
        if(!$u || !$u->role || $u->role->slug !== 'administrador') abort(403);
    }
}
