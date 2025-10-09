<?php
namespace App\Services;

use App\Models\Jornada;
use App\Models\User;
use App\Models\Solicitud;
use App\Models\Incidencia;

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

    public function reporteJornadas(array $params, User $authUser): array
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Jornada::query()
            ->with(['usuario.departamento', 'pausas'])
            ->whereBetween('fecha', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $jornadas = $query->get();

        // Generar datos para gráficas
        $datosPorDia = [];
        $horasExtraPorDia = [];
        $labels = [];

        foreach ($jornadas as $jornada) {
            $fecha = $jornada->fecha->format('Y-m-d');
            if (!in_array($fecha, $labels)) {
                $labels[] = $fecha;
            }
            
            $datosPorDia[$fecha] = (float) $jornada->total_horas ?? 0;
            $horasExtraPorDia[$fecha] = (float) $jornada->horas_extra ?? 0;
        }

        // Asegurar que labels sea un array indexado y ordenado
        sort($labels);
        $labels = array_values($labels);

        // Estadísticas
        $totalHoras = $jornadas->sum('total_horas');
        $totalHorasExtra = $jornadas->sum('horas_extra');
        $jornadasCompletas = $jornadas->where('estado', 'completa')->count();
        $diasTrabajados = $jornadas->count();

        return [
            'estadisticas' => [
                'total_horas' => round($totalHoras, 2),
                'horas_extra' => round($totalHorasExtra, 2),
                'jornadas_completas' => $jornadasCompletas,
                'dias_trabajados' => $diasTrabajados,
                'puntualidad' => $diasTrabajados > 0 ? round(($jornadasCompletas / $diasTrabajados) * 100, 1) : 0
            ],
            'graficas' => [
                [
                    'titulo' => 'Distribución de Horas por Día',
                    'tipo' => 'bar',
                    'datos' => [
                        'labels' => $labels,
                        'datasets' => [
                            [
                                'label' => 'Horas Trabajadas',
                                'data' => array_map(function($fecha) use ($datosPorDia) {
                                    return $datosPorDia[$fecha] ?? 0;
                                }, $labels),
                                'backgroundColor' => 'rgba(59, 130, 246, 0.8)',
                                'borderColor' => 'rgba(59, 130, 246, 1)',
                                'borderWidth' => 2,
                            ],
                            [
                                'label' => 'Horas Extra',
                                'data' => array_map(function($fecha) use ($horasExtraPorDia) {
                                    return $horasExtraPorDia[$fecha] ?? 0;
                                }, $labels),
                                'backgroundColor' => 'rgba(245, 158, 11, 0.8)',
                                'borderColor' => 'rgba(245, 158, 11, 1)',
                                'borderWidth' => 2,
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    public function reporteSolicitudes(array $params, User $authUser): array
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Solicitud::query()
            ->with(['usuario.departamento'])
            ->whereBetween('fecha_inicio', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!empty($params['estado'])) {
            $query->where('estado', $params['estado']);
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $solicitudes = $query->get();

        // Estadísticas
        $totalSolicitudes = $solicitudes->count();
        $aprobadas = $solicitudes->where('estado', 'aprobada')->count();
        $pendientes = $solicitudes->where('estado', 'pendiente')->count();
        $rechazadas = $solicitudes->where('estado', 'rechazada')->count();
        
        $tasaAprobacion = $totalSolicitudes > 0 ? round(($aprobadas / $totalSolicitudes) * 100, 1) : 0;
        
        // Calcular días promedio por solicitud
        $diasPromedio = $solicitudes->map(function($s) {
            $inicio = \Carbon\Carbon::parse($s->fecha_inicio);
            $fin = \Carbon\Carbon::parse($s->fecha_fin);
            return $inicio->diffInDays($fin) + 1;
        })->avg();

        // Gráfica por tipo
        $porTipo = $solicitudes->groupBy('tipo');
        $tipos = ['vacaciones', 'permiso', 'baja_medica', 'otro'];
        $datosPorTipo = [];
        
        foreach ($tipos as $tipo) {
            $datosPorTipo[] = $porTipo->get($tipo, collect())->count();
        }

        return [
            'estadisticas' => [
                'total_solicitudes' => $totalSolicitudes,
                'tasa_aprobacion' => $tasaAprobacion,
                'dias_promedio' => round($diasPromedio, 1),
                'pendientes' => $pendientes,
                'aprobadas' => $aprobadas,
                'rechazadas' => $rechazadas
            ],
            'graficas' => [
                [
                    'titulo' => 'Distribución de Solicitudes por Tipo',
                    'tipo' => 'doughnut',
                    'datos' => [
                        'labels' => ['Vacaciones', 'Permisos', 'Baja Médica', 'Otros'],
                        'datasets' => [
                            [
                                'label' => 'Solicitudes por Tipo',
                                'data' => $datosPorTipo,
                                'backgroundColor' => [
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(16, 185, 129, 0.8)',
                                    'rgba(245, 158, 11, 0.8)',
                                    'rgba(139, 92, 246, 0.8)'
                                ],
                                'borderColor' => [
                                    'rgba(59, 130, 246, 1)',
                                    'rgba(16, 185, 129, 1)',
                                    'rgba(245, 158, 11, 1)',
                                    'rgba(139, 92, 246, 1)'
                                ],
                                'borderWidth' => 2,
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    public function reporteIncidencias(array $params, User $authUser): array
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Incidencia::query()
            ->with(['usuario.departamento'])
            ->whereBetween('fecha', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!empty($params['tipo'])) {
            $query->where('tipo', $params['tipo']);
        }
        if (!empty($params['estado'])) {
            $query->where('estado', $params['estado']);
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $incidencias = $query->get();

        // Estadísticas
        $totalIncidencias = $incidencias->count();
        $aprobadas = $incidencias->where('estado', 'aprobada')->count();
        $pendientes = $incidencias->where('estado', 'pendiente')->count();
        $rechazadas = $incidencias->where('estado', 'rechazada')->count();
        
        $tasaResolucion = $totalIncidencias > 0 ? round((($aprobadas + $rechazadas) / $totalIncidencias) * 100, 1) : 0;

        // Gráfica por tipo
        $porTipo = $incidencias->groupBy('tipo');
        $tipos = ['falta', 'retraso', 'ausencia_parcial', 'anomalia_horas', 'otra'];
        $datosPorTipo = [];
        
        foreach ($tipos as $tipo) {
            $datosPorTipo[] = $porTipo->get($tipo, collect())->count();
        }

        // Datos por fecha para gráfica de línea
        $porFecha = $incidencias->groupBy(function($item) {
            return $item->fecha->format('Y-m-d');
        });

        $fechas = [];
        $datosFaltas = [];
        $datosRetrasos = [];
        $datosAusencias = [];

        foreach ($porFecha as $fecha => $incidenciasFecha) {
            $fechas[] = $fecha;
            $datosFaltas[] = $incidenciasFecha->where('tipo', 'falta')->count();
            $datosRetrasos[] = $incidenciasFecha->where('tipo', 'retraso')->count();
            $datosAusencias[] = $incidenciasFecha->where('tipo', 'ausencia_parcial')->count();
        }

        return [
            'estadisticas' => [
                'total_incidencias' => $totalIncidencias,
                'tasa_resolucion' => $tasaResolucion,
                'pendientes' => $pendientes,
                'aprobadas' => $aprobadas,
                'rechazadas' => $rechazadas
            ],
            'graficas' => [
                [
                    'titulo' => 'Evolución de Incidencias por Fecha',
                    'tipo' => 'line',
                    'datos' => [
                        'labels' => $fechas,
                        'datasets' => [
                            [
                                'label' => 'Faltas',
                                'data' => $datosFaltas,
                                'backgroundColor' => 'rgba(239, 68, 68, 0.1)',
                                'borderColor' => 'rgba(239, 68, 68, 1)',
                                'borderWidth' => 3,
                                'fill' => true,
                            ],
                            [
                                'label' => 'Retrasos',
                                'data' => $datosRetrasos,
                                'backgroundColor' => 'rgba(245, 158, 11, 0.1)',
                                'borderColor' => 'rgba(245, 158, 11, 1)',
                                'borderWidth' => 3,
                                'fill' => true,
                            ],
                            [
                                'label' => 'Ausencias Parciales',
                                'data' => $datosAusencias,
                                'backgroundColor' => 'rgba(139, 92, 246, 0.1)',
                                'borderColor' => 'rgba(139, 92, 246, 1)',
                                'borderWidth' => 3,
                                'fill' => true,
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    // Métodos de descarga para jornadas
    public function reporteJornadasCsv(array $params, User $authUser): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Jornada::query()
            ->with(['usuario.departamento', 'pausas'])
            ->whereBetween('fecha', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $jornadas = $query->get();

        $filename = "reporte_jornadas_{$desde}_{$hasta}.csv";

        return response()->stream(function() use ($jornadas) {
            $handle = fopen('php://output', 'w');
            
            // Headers CSV
            fputcsv($handle, [
                'Fecha',
                'Usuario',
                'Departamento',
                'Hora Entrada',
                'Hora Salida',
                'Total Horas',
                'Horas Extra',
                'Estado',
                'Pausas'
            ]);

            foreach ($jornadas as $jornada) {
                fputcsv($handle, [
                    $jornada->fecha->format('d/m/Y'),
                    $jornada->usuario ? $jornada->usuario->nombre . ' ' . $jornada->usuario->apellidos : 'N/A',
                    $jornada->usuario && $jornada->usuario->departamento ? $jornada->usuario->departamento->nombre : 'N/A',
                    $jornada->hora_entrada,
                    $jornada->hora_salida,
                    $jornada->total_horas,
                    $jornada->horas_extra,
                    $jornada->estado,
                    $jornada->pausas->count()
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function reporteJornadasPdf(array $params, User $authUser): \Illuminate\Http\Response
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Jornada::query()
            ->with(['usuario.departamento', 'pausas'])
            ->whereBetween('fecha', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $jornadas = $query->with(['usuario.departamento'])->get();

        $filename = "reporte_jornadas_{$desde}_{$hasta}.pdf";

        $pdf = app('dompdf.wrapper');
        $pdf->loadView('reportes.jornadas-pdf', compact('jornadas', 'desde', 'hasta'));
        
        return $pdf->download($filename);
    }

    // Métodos de descarga para solicitudes
    public function reporteSolicitudesCsv(array $params, User $authUser): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Solicitud::query()
            ->with(['usuario.departamento', 'revisor'])
            ->whereBetween('fecha_inicio', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!empty($params['estado'])) {
            $query->where('estado', $params['estado']);
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $solicitudes = $query->get();

        $filename = "reporte_solicitudes_{$desde}_{$hasta}.csv";

        return response()->stream(function() use ($solicitudes) {
            $handle = fopen('php://output', 'w');
            
            // Headers CSV
            fputcsv($handle, [
                'Fecha Inicio',
                'Fecha Fin',
                'Usuario',
                'Departamento',
                'Tipo',
                'Estado',
                'Revisor',
                'Fecha Revisión'
            ]);

            foreach ($solicitudes as $solicitud) {
                fputcsv($handle, [
                    $solicitud->fecha_inicio->format('d/m/Y'),
                    $solicitud->fecha_fin->format('d/m/Y'),
                    $solicitud->usuario ? $solicitud->usuario->nombre . ' ' . $solicitud->usuario->apellidos : 'N/A',
                    $solicitud->usuario && $solicitud->usuario->departamento ? $solicitud->usuario->departamento->nombre : 'N/A',
                    $solicitud->tipo,
                    $solicitud->estado,
                    $solicitud->revisor ? $solicitud->revisor->nombre . ' ' . $solicitud->revisor->apellidos : 'N/A',
                    $solicitud->fecha_revision ? $solicitud->fecha_revision->format('d/m/Y H:i') : 'N/A'
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function reporteSolicitudesPdf(array $params, User $authUser): \Illuminate\Http\Response
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Solicitud::query()
            ->with(['usuario.departamento', 'revisor'])
            ->whereBetween('fecha_inicio', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!empty($params['estado'])) {
            $query->where('estado', $params['estado']);
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $solicitudes = $query->with(['usuario'])->get();

        $filename = "reporte_solicitudes_{$desde}_{$hasta}.pdf";

        $pdf = app('dompdf.wrapper');
        $pdf->loadView('reportes.solicitudes-pdf', compact('solicitudes', 'desde', 'hasta'));
        
        return $pdf->download($filename);
    }

    // Métodos de descarga para incidencias
    public function reporteIncidenciasCsv(array $params, User $authUser): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Incidencia::query()
            ->with(['usuario.departamento', 'revisor'])
            ->whereBetween('fecha', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!empty($params['tipo'])) {
            $query->where('tipo', $params['tipo']);
        }
        if (!empty($params['estado'])) {
            $query->where('estado', $params['estado']);
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $incidencias = $query->get();

        $filename = "reporte_incidencias_{$desde}_{$hasta}.csv";

        return response()->stream(function() use ($incidencias) {
            $handle = fopen('php://output', 'w');
            
            // Headers CSV
            fputcsv($handle, [
                'Fecha',
                'Usuario',
                'Departamento',
                'Tipo',
                'Estado',
                'Descripción',
                'Revisor',
                'Fecha Revisión'
            ]);

            foreach ($incidencias as $incidencia) {
                fputcsv($handle, [
                    $incidencia->fecha->format('d/m/Y'),
                    $incidencia->usuario ? $incidencia->usuario->nombre . ' ' . $incidencia->usuario->apellidos : 'N/A',
                    $incidencia->usuario && $incidencia->usuario->departamento ? $incidencia->usuario->departamento->nombre : 'N/A',
                    $incidencia->tipo,
                    $incidencia->estado,
                    $incidencia->descripcion,
                    $incidencia->revisor ? $incidencia->revisor->nombre . ' ' . $incidencia->revisor->apellidos : 'N/A',
                    $incidencia->fecha_revision ? $incidencia->fecha_revision->format('d/m/Y H:i') : 'N/A'
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function reporteIncidenciasPdf(array $params, User $authUser): \Illuminate\Http\Response
    {
        $desde = $params['desde'];
        $hasta = $params['hasta'];

        $query = Incidencia::query()
            ->with(['usuario.departamento', 'revisor'])
            ->whereBetween('fecha', [$desde, $hasta]);

        // Aplicar filtros
        if (!empty($params['id_usuario'])) {
            $query->where('id_usuario', $params['id_usuario']);
        }
        if (!empty($params['id_departamento'])) {
            $query->whereHas('usuario', fn($q) => $q->where('id_departamento', $params['id_departamento']));
        }
        if (!empty($params['tipo'])) {
            $query->where('tipo', $params['tipo']);
        }
        if (!empty($params['estado'])) {
            $query->where('estado', $params['estado']);
        }
        if (!$authUser->role || $authUser->role->slug !== 'administrador') {
            $query->where('id_usuario', $authUser->id_usuario);
        }

        $incidencias = $query->with(['usuario'])->get();

        $filename = "reporte_incidencias_{$desde}_{$hasta}.pdf";

        $pdf = app('dompdf.wrapper');
        $pdf->loadView('reportes.incidencias-pdf', compact('incidencias', 'desde', 'hasta'));
        
        return $pdf->download($filename);
    }
}
