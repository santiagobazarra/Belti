<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // Registro de usuario
    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $rolEmpleado = Role::where('nombre', 'empleado')->first();

        $user = User::create([
            'nombre' => $request->nombre,
            'apellidos' => $request->apellidos,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'activo' => true,
            'fecha_alta' => now(),
            'id_rol' => $rolEmpleado?->id_rol
        ]);

    // Crear token personal (nombre descriptivo: 'api') sin sesión web
        $token = $user->createToken('api')->plainTextToken;
        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('role')
        ], 201);
    }

    // Login de usuario
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

    // Invalidar tokens previos para sesión única
        $user->tokens()->delete();
        $token = $user->createToken('api')->plainTextToken;
        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('role')
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            // Revocar todos los tokens personales del usuario
            $user->tokens()->delete();
        }
        // No llamar Auth::logout() sobre guard Sanctum (RequestGuard sin logout)
        // Hacer logout idempotente: siempre 200
        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada'
        ]);
    }

    // Perfil del usuario autenticado
    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()->load('role')]);
    }
}
