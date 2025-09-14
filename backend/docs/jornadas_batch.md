# Cierre Automático de Jornadas Abiertas

Comando: `php artisan jornadas:cerrar-abiertas`

Cierra jornadas de días anteriores que permanecen sin `hora_salida` asignándoles 23:59 y recalculando horas netas.

## Lógica
1. Selecciona jornadas con `hora_salida` NULL y `fecha` < hoy.
2. Asigna `hora_salida = fecha 23:59:00`.
3. Ejecuta `JornadaCalculator::recalcular` para ajustar `total_horas` y `horas_extra`.
4. Soporta opción `--dry-run` para sólo listar sin modificar.

## Programación
Registrado en el Scheduler (`app/Console/Kernel.php`) para ejecutarse diariamente a las 00:05.

## Uso Manual
```
php artisan jornadas:cerrar-abiertas
php artisan jornadas:cerrar-abiertas --dry-run
```

## Consideraciones
- No modifica jornadas del día actual.
- No crea pausas; solo cierra con el máximo de la jornada (23:59) para evitar jornadas permanentemente abiertas.
- Auditoría: si se requiere registrar este cierre automático, añadir lógica explícita (actualmente pasa por evento updated del modelo si Auditable se aplicara a Jornada).
- Extensión futura: parametrizar hora de cierre por política de empresa.
