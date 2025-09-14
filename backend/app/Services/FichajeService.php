<?php
namespace App\Services;

use App\Exceptions\FichajeException;
use App\Models\Jornada;
use App\Models\Pausa;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use App\Services\JornadaCalculator;

class FichajeService
{
    private function preventDoubleClick(User $user, string $key): void
    {
        $seconds = Config::get('fichaje.anti_double_click_seconds', 5);
        $cacheKey = "fichaje:last:".$key.":user:".$user->id_usuario;
        if (Cache::has($cacheKey)) {
            throw new FichajeException('Acción muy rápida, espera unos segundos');
        }
        Cache::put($cacheKey, now()->timestamp, $seconds);
    }

    public function toggleJornada(User $user, array $context = []): array
    {
        $this->preventDoubleClick($user,'jornada');
        $permitirMultiples = Config::get('fichaje.permitir_multiples_jornadas_dia', false);

        $jornadaAbierta = Jornada::where('id_usuario',$user->id_usuario)
            ->whereDate('fecha', now()->toDateString())
            ->whereNull('hora_salida')
            ->first();

        if (!$jornadaAbierta) {
            // Validar si ya existe una jornada cerrada y no se permiten múltiples
            if (!$permitirMultiples) {
                $existeCerrada = Jornada::where('id_usuario',$user->id_usuario)
                    ->whereDate('fecha', now()->toDateString())
                    ->exists();
                if ($existeCerrada) {
                    throw new FichajeException('Ya existe una jornada registrada hoy');
                }
            }
            $nueva = Jornada::create([
                'id_usuario' => $user->id_usuario,
                'fecha' => now()->toDateString(),
                'hora_entrada' => now(),
                'estado' => 'abierta',
                'ip_entrada' => $context['ip'] ?? request()->ip(),
                'hora_entrada_dispositivo' => $context['device_time'] ?? now(),
            ]);
            return ['status'=>'started','jornada'=>$nueva->fresh()];
        }

        // Cerrar
        if ($jornadaAbierta->pausas()->whereNull('hora_fin')->exists()) {
            throw new FichajeException('Hay una pausa abierta, ciérrala antes de finalizar la jornada');
        }
        $jornadaAbierta->hora_salida = now();
        $jornadaAbierta->estado = 'cerrada';
        $jornadaAbierta->ip_salida = $context['ip'] ?? request()->ip();
        $jornadaAbierta->hora_salida_dispositivo = $context['device_time'] ?? now();
        $jornadaAbierta->save();
        $jornadaAbierta->load('pausas','usuario.tipoJornada');
        JornadaCalculator::recalcular($jornadaAbierta);
        return ['status'=>'ended','jornada'=>$jornadaAbierta->fresh('pausas')];
    }

    public function togglePausa(User $user, array $context = []): array
    {
        $this->preventDoubleClick($user,'pausa');
        $jornada = Jornada::where('id_usuario',$user->id_usuario)
            ->whereDate('fecha', now()->toDateString())
            ->whereNull('hora_salida')
            ->first();
        if (!$jornada) {
            throw new FichajeException('No hay una jornada abierta para iniciar/terminar pausa');
        }
        $pausa = $jornada->pausas()->whereNull('hora_fin')->first();
        if (!$pausa) {
            $pausa = $jornada->pausas()->create([
                'hora_inicio' => now(),
                'tipo' => $context['tipo'] ?? 'descanso',
                'ip_inicio' => $context['ip'] ?? request()->ip(),
                'hora_inicio_dispositivo' => $context['device_time'] ?? now(),
                'es_computable' => $context['es_computable'] ?? false,
            ]);
            return ['status'=>'break_started','pausa'=>$pausa];
        }
        $pausa->hora_fin = now();
        $pausa->ip_fin = $context['ip'] ?? request()->ip();
        $pausa->hora_fin_dispositivo = $context['device_time'] ?? now();
        $duracionSeg = $pausa->hora_fin->timestamp - $pausa->hora_inicio->timestamp;
        $pausa->duracion = round($duracionSeg/3600,2);
        $pausa->save();
        $jornada->load('pausas','usuario.tipoJornada');
        JornadaCalculator::recalcular($jornada);
        return ['status'=>'break_ended','pausa'=>$pausa,'acumulado_horas'=>$jornada->pausas->sum('duracion')];
    }
}
