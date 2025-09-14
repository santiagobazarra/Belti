<?php
namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if(!$user || !$user->role || $user->role->slug !== 'administrador') {
            return response()->json(['message'=>'Forbidden'],403);
        }
        $query = AuditLog::query()->latest('id');
        if($request->filled('model_type')) $query->where('model_type',$request->model_type);
        if($request->filled('id_usuario')) $query->where('id_usuario',$request->id_usuario);
        if($request->filled('action')) $query->where('action',$request->action);
        $logs = $query->paginate($request->get('per_page',25));
        return $logs;
    }
}
