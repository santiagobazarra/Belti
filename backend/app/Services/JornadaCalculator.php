<?php
namespace App\Services;

use App\Models\Jornada;
use App\Services\ConfigEmpresaService;

class JornadaCalculator
{
    /**
     * Recalcula totales de una jornada.
     * Resta solo pausas NO computables (es_computable = false).
     */
    public static function recalcular(Jornada $jornada): void
    {
        $entrada = $jornada->hora_entrada;
        $salida = $jornada->hora_salida;
        if (!$entrada || !$salida) {
            return; // no se puede calcular aún
        }
        $pausas = $jornada->relationLoaded('pausas') ? $jornada->pausas : $jornada->pausas()->get();

        $config = app(ConfigEmpresaService::class);
        $horasMaxDiarias = (float) ($config->get('horas_max_diarias') ?? 0);
        $minutosMinPausa = (int) ($config->get('minutos_min_pausa') ?? 0);

        $totalSegundos = $salida->timestamp - $entrada->timestamp;
        $pausaSegundos = $pausas->filter(function($p) use ($minutosMinPausa) {
                if ($p->es_computable || !$p->hora_inicio || !$p->hora_fin) return false;
                $dur = $p->hora_fin->timestamp - $p->hora_inicio->timestamp;
                return $dur >= ($minutosMinPausa * 60);
            })
            ->reduce(fn($carry,$p)=> $carry + ($p->hora_fin->timestamp - $p->hora_inicio->timestamp),0);

        $netoSegundos = max(0, $totalSegundos - $pausaSegundos);
        $totalHoras = round($netoSegundos / 3600, 2);

        if ($horasMaxDiarias > 0 && $totalHoras > $horasMaxDiarias) {
            $totalHoras = (float) $horasMaxDiarias; // clamp al máximo
        }

        $horasContrato = $jornada->usuario?->tipoJornada?->horas_totales ?? null;
        $horasExtra = null;
        if ($horasContrato !== null) {
            $horasExtra = max(0, $totalHoras - $horasContrato);
        }

        $jornada->total_horas = $totalHoras;
        $jornada->horas_extra = $horasExtra;
        $jornada->save();
    }
}
