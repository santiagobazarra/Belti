<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Jornada;
use Carbon\Carbon;
use App\Services\JornadaCalculator;

class CloseOpenJornadas extends Command
{
    protected $signature = 'jornadas:cerrar-abiertas {--dry-run : Solo mostrar sin modificar}';
    protected $description = 'Cierra jornadas de días anteriores que quedaron abiertas asignando hora_salida 23:59 y recalculando totales';

    public function handle(JornadaCalculator $calc)
    {
        $abiertas = Jornada::whereNull('hora_salida')
            ->whereDate('fecha','<', Carbon::today()->toDateString())
            ->get();
        if($abiertas->isEmpty()){
            $this->info('No hay jornadas abiertas anteriores.');
            return 0;
        }
        $this->info('Encontradas '.$abiertas->count().' jornadas abiertas.');
        $dry = $this->option('dry-run');
        foreach($abiertas as $j){
            $oldEntrada = $j->hora_entrada?->toDateTimeString();
            if(!$dry){
                $j->hora_salida = Carbon::parse($j->fecha)->setTime(23,59,0);
                $calc::recalcular($j); // static call
            }
            $this->line(($dry?'[DRY] ':'').'Cerrada jornada #'.$j->id_jornada.' (entrada '.$oldEntrada.')');
        }
        if($dry){
            $this->comment('Dry-run completado, no se modificó nada.');
        }
        return 0;
    }
}
