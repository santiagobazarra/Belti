<?php
namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        return response()->json(Department::withCount('usuarios')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:150|unique:departamentos,nombre',
            'descripcion' => 'nullable|string'
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
        $data = $request->validate([
            'nombre' => 'sometimes|required|string|max:150|unique:departamentos,nombre,' . $departamento->id_departamento . ',id_departamento',
            'descripcion' => 'nullable|string'
        ]);
        $departamento->update($data);
        return response()->json($departamento);
    }

    public function destroy(Department $departamento)
    {
        if ($departamento->usuarios()->exists()) {
            return response()->json(['message' => 'No se puede eliminar: hay usuarios asignados'], 422);
        }
        $departamento->delete();
        return response()->json(['message' => 'Departamento eliminado']);
    }
}
