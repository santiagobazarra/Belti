<?php
namespace App\Http\Controllers;

use App\Exceptions\FichajeException;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FichajeService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FichajeController extends Controller
{
    public function __construct(private FichajeService $service) {}

    public function toggleJornada(Request $request)
    {
        Log::info('toggleJornada request data:', $request->all());
        $user = Auth::user();
        Log::info('User:', ['id' => $user->id_usuario, 'email' => $user->email]);
        
        $data = $this->service->toggleJornada($user, [
            'ip' => $request->ip(),
            'device_time' => $request->input('device_time') ? now()->parse($request->input('device_time')) : now(),
        ]);
        return response()->json($data);
    }

    public function togglePausa(Request $request)
    {
        Log::info('togglePausa request data:', $request->all());
        $user = Auth::user();
        Log::info('User for pausa:', ['id' => $user->id_usuario, 'email' => $user->email]);
        
        $data = $this->service->togglePausa($user, [
            'ip' => $request->ip(),
            'device_time' => $request->input('device_time') ? now()->parse($request->input('device_time')) : now(),
            'id_tipo_pausa' => $request->input('id_tipo_pausa'),
            'es_computable' => $request->boolean('es_computable', false),
        ]);
        return response()->json($data);
    }

    public function estado(Request $request)
    {
        $user = Auth::user();
        $estado = $this->service->obtenerEstadoActual($user);
        return response()->json($estado);
    }
}
