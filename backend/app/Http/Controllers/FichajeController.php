<?php
namespace App\Http\Controllers;

use App\Exceptions\FichajeException;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FichajeService;
use Illuminate\Support\Facades\Auth;

class FichajeController extends Controller
{
    public function __construct(private FichajeService $service) {}

    public function toggleJornada(Request $request)
    {
        $user = Auth::user();
        try {
            $data = $this->service->toggleJornada($user, [
                'ip' => $request->ip(),
                'device_time' => $request->input('device_time') ? now()->parse($request->input('device_time')) : now(),
            ]);
            return response()->json($data);
        } catch (FichajeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->status ?? 422);
        }
    }

    public function togglePausa(Request $request)
    {
        $user = Auth::user();
        try {
            $data = $this->service->togglePausa($user, [
                'ip' => $request->ip(),
                'device_time' => $request->input('device_time') ? now()->parse($request->input('device_time')) : now(),
                'tipo' => $request->input('tipo'),
                'es_computable' => $request->boolean('es_computable', false),
            ]);
            return response()->json($data);
        } catch (FichajeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->status ?? 422);
        }
    }
}
