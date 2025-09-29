<?php
namespace App\Services;

use App\Models\Incidencia;
use App\Models\Jornada;
use App\Exceptions\IncidenciaException;
use Illuminate\Support\Facades\DB;

class IncidenciaService
{
    /**
     * Aplica los efectos de una incidencia aprobada (estado aprobada) sobre las jornadas.
     * Assumes hora_inicio y hora_fin son datetimes completos.
     */
    public function aplicar(Incidencia $incidencia): void
    {
        if(!$incidencia->hora_inicio || !$incidencia->hora_fin) {
            throw new IncidenciaException('Incidencia sin rango horario','INCIDENCIA_SIN_RANGO');
        }
        if($incidencia->hora_inicio >= $incidencia->hora_fin) {
            throw new IncidenciaException('Rango horario inválido','RANGO_INVALIDO');
        }

        DB::transaction(function () use ($incidencia) {
            $fecha = $incidencia->fecha->toDateString();
            $inicio = $incidencia->hora_inicio->format('H:i:s');
            $fin = $incidencia->hora_fin->format('H:i:s');

            // Buscar jornada existente del usuario ese día
            $jornada = Jornada::where('id_usuario', $incidencia->id_usuario)
                ->whereDate('fecha', $fecha)
                ->first();

            if(!$jornada) {
                Jornada::create([
                    'id_usuario' => $incidencia->id_usuario,
                    'fecha' => $fecha,
                    'hora_entrada' => $fecha.' '.$inicio,
                    'hora_salida' => $fecha.' '.$fin,
                    'total_horas' => $this->calcularHorasDecimal($inicio,$fin)
                ]);
                return;
            }

            $cambios = false;
            $entradaActual = $jornada->hora_entrada?->format('H:i:s');
            $salidaActual = $jornada->hora_salida?->format('H:i:s');
            if(!$entradaActual || $inicio < $entradaActual) { $jornada->hora_entrada = $fecha.' '.$inicio; $cambios = true; }
            if(!$salidaActual || $fin > $salidaActual) { $jornada->hora_salida = $fecha.' '.$fin; $cambios = true; }
            if($cambios && $jornada->hora_entrada && $jornada->hora_salida) {
                $jornada->total_horas = $this->calcularHorasDecimal($jornada->hora_entrada->format('H:i:s'), $jornada->hora_salida->format('H:i:s'));
                $jornada->save();
            }
        });
    }

    private function calcularHorasDecimal(string $inicio, string $fin): float
    {
        $s = strtotime($inicio); $e = strtotime($fin); $seg = max(0,$e-$s); return round($seg/3600,2);
    }
}
