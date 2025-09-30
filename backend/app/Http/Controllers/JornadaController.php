<?php
namespace App\Http\Controllers;

use App\Models\Jornada;
use App\Models\Pausa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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

        Log::info('Resumen request', ['user_id' => $user->id_usuario, 'desde' => $desde, 'hasta' => $hasta]);

        // Debug: Ver todas las jornadas del usuario sin filtro de fecha
        $todasJornadas = Jornada::where('id_usuario',$user->id_usuario)->get();
        Log::info('Todas las jornadas del usuario', [
            'count' => $todasJornadas->count(),
            'jornadas' => $todasJornadas->map(function($j) {
                return [
                    'id' => $j->id_jornada,
                    'fecha' => $j->fecha,
                    'estado' => $j->estado
                ];
            })->toArray()
        ]);

        $jornadas = Jornada::with('pausas')
            ->where('id_usuario',$user->id_usuario)
            ->whereDate('fecha', '>=', $desde)
            ->whereDate('fecha', '<=', $hasta)
            ->get();

        Log::info('Jornadas encontradas', [
            'count' => $jornadas->count(), 
            'jornadas' => $jornadas->map(function($j) {
                return [
                    'id' => $j->id_jornada,
                    'fecha' => $j->fecha,
                    'hora_entrada' => $j->hora_entrada,
                    'hora_salida' => $j->hora_salida,
                    'estado' => $j->estado,
                    'total_horas_db' => $j->total_horas
                ];
            })->toArray()
        ]);

        $total = 0; $extra = 0; $pausas = 0;
        foreach ($jornadas as $j) {
            $j->loadMissing('usuario.tipoJornada');
            
            Log::info('Procesando jornada', [
                'id' => $j->id_jornada,
                'fecha' => $j->fecha,
                'hora_entrada' => $j->hora_entrada,
                'hora_salida' => $j->hora_salida,
                'total_horas_db' => $j->total_horas
            ]);
            
            // Para jornadas finalizadas, usar el total_horas calculado
            if ($j->hora_salida) {
                $totalHoras = $j->total_horas ?? 0;
                Log::info('Jornada finalizada', ['total_horas' => $totalHoras]);
            } else {
                // Para jornadas en curso, calcular tiempo transcurrido hasta ahora
                if ($j->hora_entrada) {
                    $tiempoTranscurrido = now()->timestamp - $j->hora_entrada->timestamp;
                    
                    Log::info('Jornada en curso', [
                        'hora_entrada' => $j->hora_entrada,
                        'now' => now(),
                        'tiempo_transcurrido_segundos' => $tiempoTranscurrido,
                        'tiempo_transcurrido_horas' => round($tiempoTranscurrido / 3600, 2)
                    ]);
                    
                    // Restar pausas no computables finalizadas
                    $pausasFinalizadas = $j->pausas->filter(function($p) {
                        return !$p->es_computable && $p->hora_inicio && $p->hora_fin;
                    });
                    
                    $tiempoPausas = $pausasFinalizadas->reduce(function($carry, $p) {
                        return $carry + ($p->hora_fin->timestamp - $p->hora_inicio->timestamp);
                    }, 0);
                    
                    Log::info('Pausas calculadas', [
                        'pausas_count' => $pausasFinalizadas->count(),
                        'tiempo_pausas_segundos' => $tiempoPausas
                    ]);
                    
                    $tiempoNeto = max(0, $tiempoTranscurrido - $tiempoPausas);
                    $totalHoras = round($tiempoNeto / 3600, 2);
                    
                    Log::info('Tiempo neto calculado', [
                        'tiempo_neto_segundos' => $tiempoNeto,
                        'total_horas' => $totalHoras
                    ]);
                } else {
                    $totalHoras = 0;
                    Log::info('Sin hora de entrada');
                }
            }
            
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
        
        Log::info('Resumen final', [
            'total_horas' => $total,
            'total_minutos' => round($total * 60),
            'horas_extra' => $extra,
            'dias_trabajados' => $jornadas->count()
        ]);
        
        return response()->json([
            'desde'=>$desde,
            'hasta'=>$hasta,
            'total_horas'=>round($total,2),
            'total_minutos'=>round($total * 60), // Agregar total en minutos
            'horas_trabajadas_minutos'=>round($total * 60), // Para compatibilidad
            'horas_extra'=>round($extra,2),
            'horas_extra_minutos'=>round($extra * 60), // Agregar extra en minutos
            'horas_pausas'=>round($pausas,2),
            'horas_pausas_minutos'=>round($pausas * 60), // Agregar pausas en minutos
            'dias_trabajados'=>$jornadas->count(),
            'jornadas'=>$jornadas
        ]);
    }

    public function resumenDiario(Request $request)
    {
        $user = $request->user();
        $fecha = $request->input('fecha', now()->toDateString());
        
        $jornada = Jornada::with('pausas')
            ->where('id_usuario', $user->id_usuario)
            ->whereDate('fecha', $fecha)
            ->first();
            
        if (!$jornada) {
            return response()->json([
                'fecha' => $fecha,
                'jornada_iniciada' => false,
                'horas_trabajadas' => 0,
                'horas_trabajadas_minutos' => 0,
                'en_curso' => false
            ]);
        }
        
        $jornada->loadMissing('usuario.tipoJornada');
        
        if ($jornada->hora_salida) {
            // Jornada finalizada
            $horasTrabajadas = $jornada->total_horas ?? 0;
            $enCurso = false;
        } else {
            // Jornada en curso
            if ($jornada->hora_entrada) {
                $tiempoTranscurrido = now()->timestamp - $jornada->hora_entrada->timestamp;
                
                // Restar pausas no computables finalizadas
                $pausasFinalizadas = $jornada->pausas->filter(function($p) {
                    return !$p->es_computable && $p->hora_inicio && $p->hora_fin;
                });
                
                $tiempoPausas = $pausasFinalizadas->reduce(function($carry, $p) {
                    return $carry + ($p->hora_fin->timestamp - $p->hora_inicio->timestamp);
                }, 0);
                
                $tiempoNeto = max(0, $tiempoTranscurrido - $tiempoPausas);
                $horasTrabajadas = round($tiempoNeto / 3600, 2);
            } else {
                $horasTrabajadas = 0;
            }
            $enCurso = true;
        }
        
        return response()->json([
            'fecha' => $fecha,
            'jornada_iniciada' => true,
            'horas_trabajadas' => $horasTrabajadas,
            'horas_trabajadas_minutos' => round($horasTrabajadas * 60),
            'en_curso' => $enCurso,
            'jornada' => $jornada
        ]);
    }

    private function authorizeJornada(Jornada $jornada, $user): void
    {
        if ($user->id_usuario !== $jornada->id_usuario && (!$user->role || $user->role->slug !== 'administrador')) {
            abort(403,'Acceso denegado');
        }
    }
}
