<?php
namespace App\Enums;

enum SolicitudEstado: string
{
    case PENDIENTE = 'pendiente';
    case APROBADA = 'aprobada';
    case RECHAZADA = 'rechazada';
    case CANCELADA = 'cancelada';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
