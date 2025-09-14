<?php
namespace App\Http\Controllers;

use App\Services\ConfigEmpresaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConfigEmpresaController extends Controller
{
    public function __construct(private ConfigEmpresaService $service){}

    public function index()
    {
        $this->authorizeAdmin();
        return $this->service->all();
    }

    public function update(Request $request)
    {
        $this->authorizeAdmin();
        $data = $request->validate([
            'horas_jornada_estandar' => 'nullable|numeric|min:0',
            'horas_max_diarias' => 'nullable|numeric|min:0',
            'minutos_min_pausa' => 'nullable|integer|min:0',
            'max_pausas_no_computables' => 'nullable|integer|min:0',
            'politica_horas_extra' => 'nullable|string',
        ]);
        $filtered = array_filter($data, fn($v) => !is_null($v));
        return $this->service->set($filtered);
    }

    private function authorizeAdmin(): void
    {
        $u = Auth::user();
        if(!$u || !$u->role || $u->role->slug !== 'administrador') abort(403);
    }
}
