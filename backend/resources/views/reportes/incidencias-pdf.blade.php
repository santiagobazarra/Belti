<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Incidencias</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            background: #fff;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }

        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #2563eb;
        }

        .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }

        .report-title {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
        }

        .report-period {
            font-size: 12px;
            color: #888;
        }

        .info-section {
            margin-bottom: 25px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #2563eb;
        }

        .info-title {
            font-size: 13px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .info-item {
            text-align: center;
        }

        .info-number {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            display: block;
        }

        .info-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }

        .data-table th {
            background: #2563eb;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .data-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
            font-size: 10px;
            color: #333;
        }

        .data-table tr:nth-child(even) {
            background: #f9f9f9;
        }

        .data-table tr:hover {
            background: #f0f8ff;
        }

        .status-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-abierta {
            background: #fff3cd;
            color: #856404;
        }

        .status-en_proceso {
            background: #d1ecf1;
            color: #0c5460;
        }

        .status-resuelta {
            background: #d4edda;
            color: #155724;
        }

        .status-cerrada {
            background: #e2e3e5;
            color: #383d41;
        }

        .priority-badge {
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .priority-alta {
            background: #f8d7da;
            color: #721c24;
        }

        .priority-media {
            background: #fff3cd;
            color: #856404;
        }

        .priority-baja {
            background: #d4edda;
            color: #155724;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 9px;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }

        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
            
            .header {
                margin-bottom: 20px;
            }
            
            .data-table {
                font-size: 9px;
            }
            
            .data-table th,
            .data-table td {
                padding: 8px 6px;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="logo">B</div>
        <div class="company-name">BELTI</div>
        <div class="report-title">Reporte de Incidencias</div>
        <div class="report-period">Período: {{ $desde }} - {{ $hasta }}</div>
    </div>

    <!-- Summary Information -->
    <div class="info-section">
        <div class="info-title">Resumen del Reporte</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-number">{{ $incidencias->count() }}</span>
                <span class="info-label">Total Incidencias</span>
            </div>
            <div class="info-item">
                <span class="info-number">{{ $incidencias->where('estado', 'abierta')->count() }}</span>
                <span class="info-label">Abiertas</span>
            </div>
            <div class="info-item">
                <span class="info-number">{{ $incidencias->where('estado', 'en_proceso')->count() }}</span>
                <span class="info-label">En Proceso</span>
            </div>
            <div class="info-item">
                <span class="info-number">{{ $incidencias->where('estado', 'resuelta')->count() }}</span>
                <span class="info-label">Resueltas</span>
            </div>
        </div>
    </div>

    <!-- Data Table -->
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 18%;">Empleado</th>
                <th style="width: 12%;">Tipo</th>
                <th style="width: 12%;">Fecha</th>
                <th style="width: 10%;">Estado</th>
                <th style="width: 10%;">Prioridad</th>
                <th style="width: 38%;">Descripción</th>
            </tr>
        </thead>
        <tbody>
            @forelse($incidencias as $incidencia)
                <tr>
                    <td>{{ $incidencia->usuario->nombre ?? 'N/A' }}</td>
                    <td>{{ ucfirst($incidencia->tipo) }}</td>
                    <td>{{ \Carbon\Carbon::parse($incidencia->created_at)->format('d/m/Y') }}</td>
                    <td>
                        <span class="status-badge status-{{ $incidencia->estado }}">
                            {{ ucfirst(str_replace('_', ' ', $incidencia->estado)) }}
                        </span>
                    </td>
                    <td>
                        @if($incidencia->prioridad)
                            <span class="priority-badge priority-{{ strtolower($incidencia->prioridad) }}">
                                {{ ucfirst($incidencia->prioridad) }}
                            </span>
                        @else
                            <span class="priority-badge priority-media">Media</span>
                        @endif
                    </td>
                    <td>{{ Str::limit($incidencia->descripcion, 60) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="no-data">
                        No se encontraron incidencias para el período seleccionado
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <p>Reporte generado el {{ date('d/m/Y H:i:s') }} por el Sistema de Control Horario Belti</p>
        <p>Este documento es confidencial y está destinado únicamente para uso interno</p>
    </div>
</body>
</html>