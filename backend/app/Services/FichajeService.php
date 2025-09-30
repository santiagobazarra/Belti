<?php
namespace App\Services;

use App\Exceptions\FichajeException;
use App\Models\Jornada;
use App\Models\Pausa;
use App\Models\User;
use App\Models\TipoPausa;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use App\Services\JornadaCalculator;
use App\Services\ConfigEmpresaService;

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

        return DB::transaction(function () use ($user, $context, $permitirMultiples) {
            $hoy = now()->toDateString();
            // Bloqueo fila(s) candidatas para garantizar exclusión
            $jornadaAbierta = Jornada::where('id_usuario', $user->id_usuario)
                ->whereDate('fecha', $hoy)
                ->whereNull('hora_salida')
                ->lockForUpdate()
                ->first();

            if (!$jornadaAbierta) {
                if (!$permitirMultiples) {
                    // Comprobación bajo bloqueo de que no existe jornada ese día
                    $existe = Jornada::where('id_usuario', $user->id_usuario)
                        ->whereDate('fecha', $hoy)
                        ->lockForUpdate()
                        ->exists();
                    if ($existe) {
                        throw new FichajeException('Ya existe una jornada registrada hoy');
                    }
                }
                $nueva = Jornada::create([
                    'id_usuario' => $user->id_usuario,
                    'fecha' => $hoy,
                    'hora_entrada' => now(),
                    'estado' => 'abierta',
                    'ip_entrada' => $context['ip'] ?? request()->ip(),
                    'hora_entrada_dispositivo' => $context['device_time'] ?? now(),
                ]);
                return ['status' => 'iniciada', 'jornada' => $nueva->fresh()];
            }

            // Cerrar jornada existente
            $pausaAbierta = $jornadaAbierta->pausas()->whereNull('hora_fin')->lockForUpdate()->first();
            if ($pausaAbierta) {
                throw new FichajeException('Hay una pausa abierta, ciérrala antes de finalizar la jornada');
            }
            $jornadaAbierta->hora_salida = now();
            $jornadaAbierta->estado = 'cerrada';
            $jornadaAbierta->ya_fichado = true;
            $jornadaAbierta->ip_salida = $context['ip'] ?? request()->ip();
            $jornadaAbierta->hora_salida_dispositivo = $context['device_time'] ?? now();
            $jornadaAbierta->save();

            $jornadaAbierta->load('pausas', 'usuario.tipoJornada');
            JornadaCalculator::recalcular($jornadaAbierta);
            return ['status' => 'finalizada', 'jornada' => $jornadaAbierta->fresh('pausas')];
        }, 3);
    }

    public function togglePausa(User $user, array $context = []): array
    {
        $this->preventDoubleClick($user,'pausa');
        return DB::transaction(function () use ($user, $context) {
            $hoy = now()->toDateString();
            $jornada = Jornada::where('id_usuario', $user->id_usuario)
                ->whereDate('fecha', $hoy)
                ->whereNull('hora_salida')
                ->lockForUpdate()
                ->first();
            if (!$jornada) {
                throw new FichajeException('No hay una jornada abierta para iniciar/terminar pausa');
            }

            $pausa = $jornada->pausas()->whereNull('hora_fin')->lockForUpdate()->first();

            if (!$pausa) {
                // Iniciar pausa - requiere tipo de pausa
                $idTipoPausa = $context['id_tipo_pausa'] ?? null;
                if (!$idTipoPausa) {
                    throw new FichajeException('Debes seleccionar un tipo de pausa');
                }

                $tipoPausa = TipoPausa::activos()->find($idTipoPausa);
                if (!$tipoPausa) {
                    throw new FichajeException('Tipo de pausa no válido o inactivo');
                }

                // Verificar límites de uso diario
                if ($tipoPausa->max_usos_dia) {
                    $usosHoy = $jornada->pausas()
                        ->where('id_tipo_pausa', $tipoPausa->id)
                        ->whereNotNull('hora_fin')
                        ->count();

                    if ($usosHoy >= $tipoPausa->max_usos_dia) {
                        throw new FichajeException("Ya has usado el máximo de pausas de tipo '{$tipoPausa->nombre}' hoy ({$tipoPausa->max_usos_dia})");
                    }
                }

                $pausa = $jornada->pausas()->create([
                    'id_tipo_pausa' => $tipoPausa->id,
                    'hora_inicio' => now(),
                    'tipo' => $tipoPausa->nombre,
                    'ip_inicio' => $context['ip'] ?? request()->ip(),
                    'hora_inicio_dispositivo' => $context['device_time'] ?? now(),
                    'es_computable' => $tipoPausa->es_computable,
                ]);

                return [
                    'status' => 'iniciada',
                    'pausa' => $pausa->load('tipoPausa'),
                    'tipo_pausa' => $tipoPausa
                ];
            }

            // Finalizar pausa existente
            $pausa->hora_fin = now();
            $pausa->ip_fin = $context['ip'] ?? request()->ip();
            $pausa->hora_fin_dispositivo = $context['device_time'] ?? now();
            $duracionMinutos = round(($pausa->hora_fin->timestamp - $pausa->hora_inicio->timestamp) / 60);
            $pausa->duracion = round($duracionMinutos / 60, 2);

            // Aplicar reglas del tipo de pausa
            if ($pausa->tipoPausa) {
                $usosHoyDelTipo = $jornada->pausas()
                    ->where('id_tipo_pausa', $pausa->id_tipo_pausa)
                    ->whereNotNull('hora_fin')
                    ->where('id_pausa', '!=', $pausa->id_pausa)
                    ->count();

                $reglas = $pausa->tipoPausa->calcularComputabilidad($duracionMinutos, $usosHoyDelTipo);
                $pausa->es_computable = $reglas['es_computable'];
                $pausa->minutos_no_computables = $reglas['minutos_no_computables'];
            } else {
                // Aplicar reglas de configuración legacy
                $config = app(ConfigEmpresaService::class);
                $minutosMinPausa = (int) ($config->get('minutos_min_pausa') ?? 0);
                $maxNoComputables = (int) ($config->get('max_pausas_no_computables') ?? 0);

                if ($minutosMinPausa > 0 && $duracionMinutos < $minutosMinPausa) {
                    $pausa->es_computable = true;
                }

                if (!$pausa->es_computable && $maxNoComputables > 0) {
                    $noCompUsadas = $jornada->pausas()->where('es_computable', false)->whereNotNull('hora_fin')->count();
                    if ($noCompUsadas >= $maxNoComputables) {
                        $pausa->es_computable = true;
                    }
                }
            }

            $pausa->save();
            $jornada->load('pausas.tipoPausa', 'usuario.tipoJornada');
            JornadaCalculator::recalcular($jornada);

            return [
                'status' => 'finalizada',
                'pausa' => $pausa->fresh('tipoPausa'),
                'duracion_minutos' => $duracionMinutos,
                'minutos_computables' => $pausa->minutos_computables,
                'acumulado_horas' => $jornada->pausas->sum('duracion')
            ];
        }, 3);
    }

    public function obtenerEstadoActual(User $user): array
    {
        $hoy = now()->toDateString();
        
        // Buscar jornada de hoy
        $jornada = Jornada::where('id_usuario', $user->id_usuario)
            ->whereDate('fecha', $hoy)
            ->with('pausas')
            ->first();

        if (!$jornada) {
            return [
                'puede_iniciar_jornada' => true,
                'jornada_activa' => false,
                'en_pausa' => false,
                'ya_fichado' => false,
                'jornada' => null,
                'pausa_activa' => null
            ];
        }

    $jornadaActiva = is_null($jornada->hora_salida);
    // Solo considerar pausa activa si no tiene hora_fin
    $pausaActiva = $jornada->pausas->whereNull('hora_fin')->first();

        // Calcular duración en tiempo real para jornadas activas
        if ($jornadaActiva && $jornada->hora_entrada) {
            $inicio = $jornada->hora_entrada;
            $fin = now();
            
            // Calcular tiempo total en minutos
            $tiempoTotalMinutos = $inicio->diffInMinutes($fin);
            
            // Calcular tiempo de pausas finalizadas
            $tiempoPausasMinutos = $jornada->pausas()
                ->whereNotNull('hora_fin')
                ->get()
                ->sum(function($pausa) {
                    return $pausa->hora_inicio->diffInMinutes($pausa->hora_fin);
                });
            
            // Tiempo neto trabajado
            $tiempoNetoMinutos = $tiempoTotalMinutos - $tiempoPausasMinutos;
            
            // Agregar campos calculados al objeto jornada
            $jornada->duracion_minutos = $tiempoNetoMinutos;
            $jornada->hora_inicio = $jornada->hora_entrada; // Para compatibilidad con frontend
            $jornada->hora_fin = null; // Jornada activa
        }

        return [
            'puede_iniciar_jornada' => !$jornadaActiva && is_null($jornada->hora_salida),
            'jornada_activa' => $jornadaActiva,
            'en_pausa' => !is_null($pausaActiva),
            'ya_fichado' => (bool) $jornada->ya_fichado,
            'jornada' => $jornada,
            'pausa_activa' => $pausaActiva
        ];
    }
}
