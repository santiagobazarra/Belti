<?php
namespace App\Services;

use App\Models\Jornada;

class JornadaCalculator
{
    public static function recalcular(Jornada $jornada): void
    {
        $entrada = $jornada->hora_entrada;
        $salida = $jornada->hora_salida;
        if (!$entrada || !$salida) {
            return; // no se puede calcular aún
        }

        $totalSegundos = $salida->timestamp - $entrada->timestamp;
        $pausaSegundos = $jornada->pausas->reduce(function($carry,$pausa){
            if ($pausa->hora_inicio && $pausa->hora_fin) {
                return $carry + ($pausa->hora_fin->timestamp - $pausa->hora_inicio->timestamp);
            }
            return $carry;
        },0);

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
