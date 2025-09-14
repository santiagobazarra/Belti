<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1 { font-size: 18px; margin: 0 0 10px; }
        table { width:100%; border-collapse: collapse; margin-top:10px; }
        th, td { border:1px solid #444; padding:4px 6px; }
        th { background:#f0f0f0; }
        tfoot td { font-weight:bold; }
        .meta { margin-bottom:8px; }
    </style>
</head>
<body>
    <h1>Resumen de Jornadas</h1>
    <div class="meta">Rango: {{ $desde }} - {{ $hasta }}</div>
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Departamento</th>
                <th>Horas Netas</th>
                <th>Horas Extra</th>
                <th>Pausas No Comp.</th>
                <th>Pausas Comp.</th>
            </tr>
        </thead>
        <tbody>
            @forelse($detalle as $row)
                <tr>
                    <td>{{ $row['fecha'] }}</td>
                    <td>{{ $row['usuario'] }}</td>
                    <td>{{ $row['departamento'] }}</td>
                    <td style="text-align:right">{{ number_format($row['horas_netas'],2) }}</td>
                    <td style="text-align:right">{{ number_format($row['horas_extra'],2) }}</td>
                    <td style="text-align:right">{{ number_format($row['pausas_no_computables_horas'],2) }}</td>
                    <td style="text-align:right">{{ number_format($row['pausas_computables_horas'],2) }}</td>
                </tr>
            @empty
                <tr><td colspan="7">Sin datos</td></tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3">Totales</td>
                <td style="text-align:right">{{ number_format($totales['horas_netas'],2) }}</td>
                <td style="text-align:right">{{ number_format($totales['horas_extra'],2) }}</td>
                <td style="text-align:right">{{ number_format($totales['pausas_no_computables_horas'],2) }}</td>
                <td style="text-align:right">{{ number_format($totales['pausas_computables_horas'],2) }}</td>
            </tr>
            <tr>
                <td colspan="7">Horas estándar: {{ $totales['horas_jornada_estandar'] }} | Déficit: {{ number_format($totales['horas_deficit'],2) }}</td>
            </tr>
        </tfoot>
    </table>
    <div style="margin-top:10px; font-size:10px;">Generado: {{ date('Y-m-d H:i') }}</div>
</body>
</html>
