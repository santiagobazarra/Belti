<?php
namespace App\Http\Controllers;

use App\Models\Jornada;
use App\Models\Pausa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\JornadaCalculator;
use Carbon\Carbon;

class JornadaController extends Controller
{
    public function iniciarJornada(Request $request)
    {
        $user = $request->user();
        $existe = Jornada::where('id_usuario',$user->id_usuario)
            ->whereDate('fecha', now()->toDateString())
            ->whereNull('hora_salida')
            ->first();
        if ($existe) {
            return response()->json(['message' => 'Ya hay una jornada abierta'], 422);
        }
        $jornada = Jornada::create([
            'id_usuario' => $user->id_usuario,
            'fecha' => now()->toDateString(),
            'hora_entrada' => now(),
            'estado' => 'abierta'
        ]);
        return response()->json($jornada,201);
    }

    public function finalizarJornada(Request $request, Jornada $jornada)
    {
        $this->authorizeJornada($jornada, $request->user());
        if ($jornada->hora_salida) {
            return response()->json(['message' => 'Jornada ya finalizada'], 422);
        }
        $jornada->hora_salida = now();
        $jornada->estado = 'cerrada';
        $jornada->load('pausas','usuario.tipoJornada');
        JornadaCalculator::recalcular($jornada);
        return response()->json($jornada->fresh('pausas'));
    }

    public function iniciarPausa(Request $request, Jornada $jornada)
    {
        $this->authorizeJornada($jornada, $request->user());
        $pausaAbierta = $jornada->pausas()->whereNull('hora_fin')->first();
        if ($pausaAbierta) {
            return response()->json(['message' => 'Ya existe una pausa abierta'], 422);
        }
        $pausa = $jornada->pausas()->create([
            'hora_inicio' => now(),
            'tipo' => $request->input('tipo','descanso')
        ]);
        return response()->json($pausa,201);
    }

    public function finalizarPausa(Request $request, Jornada $jornada, Pausa $pausa)
    {
        $this->authorizeJornada($jornada, $request->user());
        if ($pausa->id_jornada !== $jornada->id_jornada) {
            return response()->json(['message' => 'La pausa no pertenece a la jornada'], 422);
        }
        if ($pausa->hora_fin) {
            return response()->json(['message' => 'Pausa ya finalizada'], 422);
        }
        $pausa->hora_fin = now();
        $duracionSeg = $pausa->hora_fin->timestamp - $pausa->hora_inicio->timestamp;
        $pausa->duracion = round($duracionSeg/3600,2);
        $pausa->save();

        $jornada->load('pausas','usuario.tipoJornada');
        JornadaCalculator::recalcular($jornada);
        return response()->json($pausa);
    }

    public function listarJornadas(Request $request)
    {
        $user = $request->user();
        $query = Jornada::with('pausas')->where('id_usuario',$user->id_usuario)->orderByDesc('fecha');
        if ($request->filled('desde')) {
            $query->whereDate('fecha','>=',$request->input('desde'));
        }
        if ($request->filled('hasta')) {
            $query->whereDate('fecha','<=',$request->input('hasta'));
        }
        return response()->json($query->paginate(30));
    }

    public function resumen(Request $request)
    {
        $user = $request->user();
        $desde = $request->input('desde', now()->startOfWeek()->toDateString());
        $hasta = $request->input('hasta', now()->endOfWeek()->toDateString());
        $incluirPausas = filter_var($request->input('incluir_pausas','1'), FILTER_VALIDATE_BOOLEAN);

        $jornadas = Jornada::with('pausas')
            ->where('id_usuario',$user->id_usuario)
            ->whereBetween('fecha', [$desde,$hasta])
            ->get();

        $total = 0; $extra = 0; $pausas = 0;
        foreach ($jornadas as $j) {
            $j->loadMissing('usuario.tipoJornada');
            $totalHoras = $j->total_horas ?? 0;
            $total += $totalHoras;
            $extra += $j->horas_extra ?? 0;
            $pausas += $j->pausas->reduce(function($carry,$p){
                if ($p->hora_inicio && $p->hora_fin) {
                    return $carry + (($p->hora_fin->timestamp - $p->hora_inicio->timestamp)/3600);
                }
                return $carry;
            },0);
        }
        if (!$incluirPausas) {
            $total -= $pausas; // mostrar sin pausas
        }
        return response()->json([
            'desde'=>$desde,
            'hasta'=>$hasta,
            'total_horas'=>round($total,2),
            'horas_extra'=>round($extra,2),
            'horas_pausas'=>round($pausas,2),
            'jornadas'=>$jornadas
        ]);
    }

    private function authorizeJornada(Jornada $jornada, $user): void
    {
        if ($user->id_usuario !== $jornada->id_usuario && (!$user->role || $user->role->slug !== 'administrador')) {
            abort(403,'Acceso denegado');
        }
    }
}
