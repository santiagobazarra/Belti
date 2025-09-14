# Autorización (Policies)

Se han definido policies para los modelos `Incidencia` y `Solicitud` con el objetivo de centralizar la lógica de autorización y eliminar condicionales manuales en los controladores.

## Reglas Generales

- Rol `administrador`: acceso completo (view/viewAny/create/update/delete) sobre incidencias y solicitudes de cualquier usuario.
- Rol empleado (o usuario sin rol administrador):
  - Puede listar únicamente sus propios registros (el filtrado se aplica en el controlador después de `viewAny`).
  - Puede ver (`view`) solo sus propios registros.
  - Puede crear (`create`) registros propios.
  - Puede actualizar (`update`) o eliminar (`delete`) únicamente si el registro pertenece al usuario y su estado es `pendiente`.

## Métodos en las Policies

`IncidenciaPolicy` y `SolicitudPolicy` implementan:
- `viewAny(User $user)` -> true (el filtrado se hace a nivel de query si no es admin).
- `view(User $user, Model $m)` -> admin o propietario.
- `create(User $user)` -> permitido para todos (empleados/administrador).
- `update(User $user, Model $m)` -> admin siempre; propietario solo si estado `pendiente`.
- `delete(User $user, Model $m)` -> mismas condiciones que update.

## Controladores

`IncidenciaController` y `SolicitudController` ahora usan `$this->authorize(...)` en:

- `index` -> `viewAny`
- `store` -> `create`
- `show` -> `view`
- `update` -> `update`
- `destroy` -> `delete`

La validación de campos según rol se mantiene (admin puede cambiar estado y campos de revisión / resolución; empleado solo edita el campo descriptivo / motivo mientras está pendiente).

## Enums de Estados

Se incorporaron enums PHP 8.1:

`App\Enums\IncidenciaEstado` -> pendiente, revisada, resuelta, rechazada  
`App\Enums\SolicitudEstado` -> pendiente, aprobada, rechazada, cancelada

Los controladores validan estados usando `implode(',', Enum::values())` evitando duplicar literales y reduciendo errores tipográficos.

## Tests

Tests añadidos:
- `PolicyIncidenciaTest`:
  - Empleado no modifica incidencia ajena.
  - Empleado no modifica incidencia no pendiente.
  - Admin cambia estado de incidencia ajena.
- `PolicySolicitudTest`:
  - Empleado no elimina solicitud no pendiente.
  - Empleado no ve solicitud ajena.
  - Admin aprueba solicitud.

Estos cubren los caminos críticos de autorización.

## Próximas Mejoras Sugeridas

- Extraer enumeraciones de estados a constantes/Enums PHP 8.1.
- Añadir gates específicos para acciones masivas (batch approve) si se implementan.
- Registrar métricas de denegaciones (ej. listener para FailedAuthorization) si se requiere auditoría de intentos.
