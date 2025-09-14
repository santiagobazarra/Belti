<?php
namespace App\Services;

use App\Models\Jornada;

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

        $totalSegundos = $salida->timestamp - $entrada->timestamp;
        $pausaSegundos = $pausas->filter(fn($p)=>!$p->es_computable && $p->hora_inicio && $p->hora_fin)
            ->reduce(fn($carry,$p)=> $carry + ($p->hora_fin->timestamp - $p->hora_inicio->timestamp),0);

        $netoSegundos = max(0, $totalSegundos - $pausaSegundos);
        $totalHoras = round($netoSegundos / 3600, 2);

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
