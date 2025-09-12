<?php
namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(Role::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:100|unique:roles,nombre',
            'descripcion' => 'nullable|string'
        ]);
        $role = Role::create($data);
        return response()->json($role, 201);
    }

    public function show(Role $role)
    {
        return response()->json($role);
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'nombre' => 'sometimes|required|string|max:100|unique:roles,nombre,' . $role->id_rol . ',id_rol',
            'descripcion' => 'nullable|string'
        ]);
        $role->update($data);
        return response()->json($role);
    }

    public function destroy(Role $role)
    {
        if ($role->usuarios()->exists()) {
            return response()->json(['message' => 'No se puede eliminar un rol con usuarios asignados'], 422);
        }
        $role->delete();
        return response()->json(['message' => 'Rol eliminado']);
    }
}
