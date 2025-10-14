<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['role','departamento']);
        
        // Filtrar por departamento si se proporciona
        if ($request->has('id_departamento') && $request->id_departamento !== '') {
            $query->where('id_departamento', $request->id_departamento);
        }
        
        // Filtrar por rol si se proporciona
        if ($request->has('id_rol') && $request->id_rol !== '') {
            $query->where('id_rol', $request->id_rol);
        }
        
        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6',
            'id_rol' => 'nullable|exists:roles,id_rol',
            'id_departamento' => 'nullable|exists:departamentos,id_departamento'
        ]);
        $data['password'] = Hash::make($data['password']);
        $data['fecha_alta'] = now();
        $user = User::create($data);
        return response()->json($user->load(['role','departamento']), 201);
    }

    public function show(User $usuario)
    {
        return response()->json($usuario->load(['role','departamento']));
    }

    public function update(Request $request, User $usuario)
    {
        $data = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'apellidos' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:usuarios,email,' . $usuario->id_usuario . ',id_usuario',
            'password' => 'sometimes|string|min:6',
            'id_rol' => 'sometimes|nullable|exists:roles,id_rol',
            'id_departamento' => 'sometimes|nullable|exists:departamentos,id_departamento',
            'activo' => 'sometimes|boolean'
        ]);
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $usuario->update($data);
        return response()->json($usuario->load(['role','departamento']));
    }

    public function destroy(User $usuario)
    {
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    public function asignarDepartamento(Request $request, User $usuario)
    {
        $data = $request->validate([
            'id_departamento' => 'required|exists:departamentos,id_departamento'
        ]);
        $usuario->id_departamento = $data['id_departamento'];
        $usuario->save();
        return response()->json($usuario->load('departamento'));
    }
}
