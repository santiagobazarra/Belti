# Auditoría de Cambios

Se registra automáticamente la creación, actualización y eliminación de modelos clave:
- Jornada
- Pausa
- Incidencia
- Solicitud
- ConfigEmpresa

## Estructura tabla `audit_logs`
| Campo | Descripción |
|-------|-------------|
| id | PK |
| id_usuario | Usuario que ejecuta la acción (nullable si sistema) |
| model_type | Clase del modelo (FQCN) |
| model_id | ID del registro afectado |
| action | created / updated / deleted |
| changes | JSON { new: {}, old: {} } según acción |
| created_at | Marca temporal |

Índices en `(model_type, model_id)` y `id_usuario`.

## Trait `Auditable`
Se añade a los modelos listados y engancha eventos Eloquent:
- created: guarda atributos completos en `changes.new`.
- updated: guarda solo campos modificados (sin `updated_at`) en `changes.new` y valores previos en `changes.old`.
- deleted: guarda estado previo completo en `changes.old`.

Errores en auditoría no interrumpen la operación principal (try/catch silencioso).

## Endpoint
`GET /api/audit-logs` (solo admin).

Parámetros opcionales:
- `model_type`
- `id_usuario`
- `action`
- `per_page` (por defecto 25)

Respuesta: paginada Laravel estándar.

## Ejemplo de registro
```
{
  "id": 10,
  "id_usuario": 3,
  "model_type": "App\\Models\\Incidencia",
  "model_id": 55,
  "action": "updated",
  "changes": {
    "new": {"descripcion": "Texto modificado"},
    "old": {"descripcion": "Texto original"}
  },
  "created_at": "2025-09-14T13:10:00Z"
}
```

## Próximas mejoras sugeridas
- Soft deletes + registro separado de restauraciones.
- Correlación con IP / user agent.
- Filtro por rango de fechas.
- Firma hash de integridad para detección de manipulación.
