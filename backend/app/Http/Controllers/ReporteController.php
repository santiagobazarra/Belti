<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\ReporteService;

class ReporteController extends Controller
{
    public function resumen(Request $request, ReporteService $service)
    {
        $data = $request->validate([
            'desde' => 'required|date',
            'hasta' => 'required|date|after_or_equal:desde',
            'id_usuario' => 'nullable|integer',
            'id_departamento' => 'nullable|integer'
        ]);
        return $service->resumen($data, Auth::user());
    }

    public function resumenCsv(Request $request, ReporteService $service)
    {
        $data = $request->validate([
            'desde' => 'required|date',
            'hasta' => 'required|date|after_or_equal:desde',
            'id_usuario' => 'nullable|integer',
            'id_departamento' => 'nullable|integer'
        ]);
        $res = $service->resumen($data, Auth::user());
    $lines = [];
    $lines[] = 'fecha,usuario,departamento,horas_netas,horas_extra,pausas_no_computables_horas,pausas_computables_horas';
        foreach($res['detalle'] as $row){
            $lines[] = collect($row)->only(['fecha','usuario','departamento','horas_netas','horas_extra','pausas_no_computables_horas','pausas_computables_horas'])
                ->map(fn($v)=> str_replace(['"','"'], '"', (string)$v))
                ->implode(',');
        }
        // Añadir fila totales al final (manteniendo columnas definidas)
        $t = $res['totales'];
        $lines[] = 'TOTALS,,,' . implode(',', [
            $t['horas_netas'],
            $t['horas_extra'],
            $t['pausas_no_computables_horas'],
            $t['pausas_computables_horas']
        ]);
        $csv = implode("\n", $lines);
        $filename = 'reporte_resumen_'.$data['desde'].'_'.$data['hasta'].'.csv';
        return response($csv,200,[
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"'
        ]);
    }

    public function resumenPdf(Request $request, ReporteService $service)
    {
        $data = $request->validate([
            'desde' => 'required|date',
            'hasta' => 'required|date|after_or_equal:desde',
            'id_usuario' => 'nullable|integer',
            'id_departamento' => 'nullable|integer'
        ]);
        $res = $service->resumen($data, Auth::user());
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reportes.resumen_pdf', array_merge($res, $data));
        $filename = 'reporte_resumen_'.$data['desde'].'_'.$data['hasta'].'.pdf';
        return $pdf->download($filename);
    }
}
