<?php
namespace App\Services;

use App\Models\Jornada;
use App\Models\User;

class ReporteService
{
    public function resumen(array $params, User $authUser): array
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Jornada::query()
            ->with(['usuario.departamento','pausas'])
            ->whereBetween('fecha', [$desde, $hasta])
            ->whereNotNull('hora_salida');

        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q)=>$q->where('id_departamento',$params['id_departamento']));
        }
        if(!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario',$authUser->id_usuario);
        }

        $jornadas = $query->get();
        if ($jornadas->isEmpty()) {
            return [
                'totales' => [
                    'horas_netas' => 0,
                    'horas_extra' => 0,
                    'pausas_no_computables_horas' => 0,
                    'pausas_computables_horas' => 0,
                    'dias_trabajados' => 0,
                ],
                'detalle' => []
            ];
        }

        $detalle = [];
        $totNeto = 0; $totExtra=0; $totPausaNo=0; $totPausaSi=0; $dias = [];
        foreach($jornadas as $j){
            $pausaNo = 0; $pausaSi = 0;
            foreach($j->pausas as $p){
                if($p->hora_inicio && $p->hora_fin){
                    $h = round(($p->hora_fin->timestamp - $p->hora_inicio->timestamp)/3600,2);
                    if($p->es_computable) $pausaSi += $h; else $pausaNo += $h;
                }
            }
            $detalle[] = [
                'fecha' => $j->fecha->toDateString(),
                'usuario' => $j->usuario?->nombre.' '.$j->usuario?->apellidos,
                'departamento' => $j->usuario?->departamento?->nombre,
                'horas_netas' => (float)$j->total_horas,
                'horas_extra' => (float)($j->horas_extra ?? 0),
                'pausas_no_computables_horas' => $pausaNo,
                'pausas_computables_horas' => $pausaSi,
            ];
            $totNeto += (float)$j->total_horas;
            $totExtra += (float)($j->horas_extra ?? 0);
            $totPausaNo += $pausaNo;
            $totPausaSi += $pausaSi;
            $dias[$j->fecha->toDateString()] = true;
        }

        $diasTrab = count($dias);
        $horasStd = (float) (app('cache')->remember('cfg_horas_jornada_estandar', 3600, function(){
            return \App\Models\ConfigEmpresa::where('clave','horas_jornada_estandar')->value('valor') ?? 8;
        }));
        $horasDeficit = ($horasStd * $diasTrab) - $totNeto;
        return [
            'totales' => [
                'horas_netas' => round($totNeto,2),
                'horas_extra' => round($totExtra,2),
                'pausas_no_computables_horas' => round($totPausaNo,2),
                'pausas_computables_horas' => round($totPausaSi,2),
                'dias_trabajados' => $diasTrab,
                'horas_jornada_estandar' => $horasStd,
                'horas_deficit' => round($horasDeficit,2),
            ],
            'detalle' => $detalle,
        ];
    }
}
