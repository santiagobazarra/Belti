<?php
namespace App\Enums;

enum IncidenciaEstado: string
{
    case PENDIENTE = 'pendiente';
    case APROBADA = 'aprobada';
    case RECHAZADA = 'rechazada';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
