# Belti API - Guía de Pruebas (Postman)

Formato general:
- Base URL (dev): `http://localhost:8000/api` (ajusta según entorno)
- Autenticación: Token Bearer Sanctum (header `Authorization: Bearer {token}`) salvo endpoints públicos de login/register.
- Contenido: `Content-Type: application/json`

## 1. Autenticación

### Crear usuario administrador rápido (CLI)
```
php artisan app:create-admin admin@example.com --password=Secret123
```
Si no se pasan argumentos solicitará email y generará password.

### Registro
POST /register
Body JSON:
```
{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "email": "juan+p1@example.com",
  "password": "secret",
  "password_confirmation": "secret"
}
```
Respuesta 201:
```
{ "token": "<TOKEN>", "token_type": "Bearer", "user": { ... }}
```

### Login
POST /login
```
{
  "email": "juan+p1@example.com",
  "password": "secret"
}
```
Respuesta 200:
```
{ "token": "<TOKEN>", "token_type": "Bearer", "user": { ... } }
```

### Me (perfil)
GET /me (Auth requerida)
Respuesta 200: Usuario autenticado.

### Logout
POST /logout (Auth)
Respuesta 204/200.

## 2. Fichaje (Jornadas & Pausas)

### Iniciar / Finalizar Jornada (toggle)
POST /fichaje/jornada (Auth)
Body opcional: `{}`
Respuesta:
```
{ "status": "iniciada" | "finalizada", "jornada": { ... } }
```

### Iniciar / Finalizar Pausa (toggle)
POST /fichaje/pausa (Auth)
Respuesta:
```
{ "status": "iniciada" | "finalizada", "pausa": { ... } }
```

### Listar Jornadas
GET /jornadas (Auth)
Query params opcionales: `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
Respuesta paginate JSON.

### Resumen Jornadas
GET /jornadas/resumen (Auth)
Métricas agregadas (horas, extras, déficit).

## 3. Incidencias

`Route::apiResource('incidencias')` + `PATCH /incidencias/{id}/aprobar`

Campos principales:
- fecha (date, requerido)
- tipo (falta|retraso|ausencia_parcial|anomalia_horas|otra)
- descripcion (string opcional)
- hora_inicio / hora_fin (HH:MM en petición; se almacenan como datetime ISO8601 UTC: `YYYY-MM-DDTHH:MM:SS.uuuuuuZ`). Requeridos cuando tipo es `anomalia_horas` o `ausencia_parcial`.
- estado (pendiente|aprobada|rechazada)
- comentario_revision (string admin)
- fecha_revision (datetime admin)

Regla negocio: Para tipos que reconstruyen o corrigen horas (`anomalia_horas`, `ausencia_parcial`) se exige rango horario válido (hora_inicio < hora_fin). Al aprobar (endpoint específico) se generará o ampliará la jornada del día con ese rango. El estado pasa de `pendiente` a `aprobada`.

### Crear
POST /incidencias
```
{
  "fecha": "2025-09-14",
  "tipo": "anomalia_horas",
  "hora_inicio": "08:00",
  "hora_fin": "15:30",
  "descripcion": "Olvido fichaje"
}
```
Respuesta 201: objeto incidencia (estado inicial `pendiente`).

### Listar
GET /incidencias (Auth)
Query filtros: `estado=pendiente`, `tipo=falta`, `desde=YYYY-MM-DD`, `hasta=YYYY-MM-DD`

### Ver
GET /incidencias/{id}

### Actualizar (Empleado - solo descripción si pendiente)
PATCH /incidencias/{id}
```
{ "descripcion": "Descripción ajustada" }
```

### Actualizar (Admin - cambio estado o rangos antes de aprobar)
PATCH /incidencias/{id}
```
{ "estado": "revisada", "comentario_revision": "Verificado", "hora_inicio": "08:00", "hora_fin": "16:00" }
```

### Aprobar (aplicar a jornada)
PATCH /incidencias/{id}/aprobar (Admin)
Respuesta 200: incidencia con estado `aprobada` + jornada ajustada/creada (verificar consultando `/jornadas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`).

Códigos de error relevantes:
- 422 VALIDATION_ERROR: faltan hora_inicio / hora_fin para tipo que lo requiere
- 409 INCIDENCIA_NO_PENDIENTE: intento de aprobar incidencia no pendiente
- 422 INCIDENCIA_SIN_RANGO: aprobar sin rango

### Eliminar
DELETE /incidencias/{id}
Empleado solo si propia y pendiente. Admin siempre.

## 4. Solicitudes (Vacaciones / Permisos)

`Route::apiResource('solicitudes')`

Campos: fecha_inicio, fecha_fin, tipo (vacaciones|permiso|baja_medica|otro), motivo, estado (pendiente|aprobada|rechazada|cancelada), comentario_resolucion, fecha_resolucion.

### Crear
POST /solicitudes
```
{
  "fecha_inicio": "2025-09-20",
  "fecha_fin": "2025-09-22",
  "tipo": "vacaciones",
  "motivo": "Viaje"
}
```

### Listar
GET /solicitudes
Filtros: `estado=pendiente&tipo=vacaciones&desde=YYYY-MM-DD&hasta=YYYY-MM-DD`

### Ver
GET /solicitudes/{id}

### Actualizar (Empleado - motivo si pendiente)
PATCH /solicitudes/{id}
```
{ "motivo": "Cambio logística" }
```

### Actualizar (Admin - resolver)
PATCH /solicitudes/{id}
```
{ "estado": "aprobada", "comentario_resolucion": "OK" }
```

### Eliminar
DELETE /solicitudes/{id}
Empleado solo propia pendiente. Admin siempre.

## 5. Festivos

`Route::apiResource('festivos')`

### Crear (Admin)
POST /festivos
```
{ "fecha": "2025-12-25", "descripcion": "Navidad", "tipo": "nacional" }
```
### Listar
GET /festivos
### Ver
GET /festivos/{id}
### Actualizar (Admin)
PUT /festivos/{id}
```
{ "descripcion": "Navidad", "tipo": "nacional" }
```
### Eliminar (Admin)
DELETE /festivos/{id}
Respuesta:
```
{
  "deleted": true,
  "resource": "festivo",
  "id": "12",
  "message": "Festivo eliminado",
  "timestamp": "2025-09-16T12:34:56Z"
}
```

## 6. Configuración Empresa (Admin) 
>[!IMPORTANT]
> Recordar que esto hacerlo posteriormente la verificacion de los servicios

Gestiona parámetros globales usados para validaciones de jornadas, pausas y cálculos.
Solo rol administrador (`role.slug = administrador`).

### Endpoints
GET /configuracion  
PUT /configuracion

### Campos soportados (todas opcionales en PUT)
- horas_jornada_estandar (number >= 0) Horas estándar de una jornada completa (ej: 8, 7.5).
- horas_max_diarias (number >= 0) Límite duro de horas trabajadas en un día antes de marcar exceso.
- minutos_min_pausa (integer >= 0) Mínimo de minutos para que una pausa compute como obligatoria.
- max_pausas_no_computables (integer >= 0) Cantidad de pausas que pueden excluirse del cómputo.
- politica_horas_extra (string) Texto libre / markdown corto de política interna.
- zona_horaria (string) Identificador IANA (ej: Europe/Madrid). Usado para interpretar y mostrar horas en reportes.

Notas:
- Almacén key/value. Los valores numéricos se guardan como string; interpreta el cliente si necesita tipo numérico.
- Cache 1h: tras PUT se invalida y GET devuelve inmediatamente valores nuevos.
- PUT solo aplica claves presentes y no nulas.

### Ejemplo GET
Respuesta (200):
```
{
  "horas_jornada_estandar": "8",
  "horas_max_diarias": "10",
  "minutos_min_pausa": "15",
  "max_pausas_no_computables": "2",
  "politica_horas_extra": "Se requiere aprobación previa",
  "zona_horaria": "Europe/Madrid"
}
```
Si aún no existe alguna clave simplemente no aparece.

### Ejemplo PUT (actualizar varios campos)
```
PUT /configuracion
{
  "horas_jornada_estandar": 7.5,
  "zona_horaria": "Europe/Madrid",
  "politica_horas_extra": "Aprobación jefe directo"
}
```
Respuesta (200): objeto completo actualizado.

### Validaciones de error (422)
```
{
  "message": "The given data was invalid.",
  "errors": {
    "horas_jornada_estandar": ["The horas_jornada_estandar must be a number."],
    "zona_horaria": ["The zona_horaria must be a string."]
  }
}
```

### Errores de autorización (403)
Si el usuario autenticado no es administrador.

## 7. Reportes

### Resumen JSON
GET /reportes/resumen?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&usuario_id=ID (admin opcional) &departamento_id=ID
Respuesta: métricas agregadas (totales, horas_extra, horas_deficit, agrupaciones).

### Resumen CSV
GET /reportes/resumen.csv (mismos query params)
Header: `Accept: text/csv`

### Resumen PDF
GET /reportes/resumen.pdf (mismos query params)
Header: `Accept: application/pdf`

## 8. Auditoría

GET /audit-logs (Admin)
Query: `model=Incidencia&usuario_id=ID&desde=YYYY-MM-DD&hasta=YYYY-MM-DD&accion=created|updated|deleted`
Respuesta: lista de eventos (model, id, accion, cambios, user_id, timestamp).

## 9. Roles / Departamentos / Usuarios (Admin)

### Roles
GET /roles
POST /roles
```
{ "nombre": "supervisor", "descripcion": "Rol intermedio" }
```
PUT /roles/{id}
DELETE /roles/{id}

### Departamentos
GET /departamentos
POST /departamentos
```
{ "nombre": "Operaciones" }
```
PUT /departamentos/{id}
DELETE /departamentos/{id}

### Usuarios
GET /usuarios?departamento_id=ID&rol_id=ID
POST /usuarios
```
{
  "nombre": "Ana",
  "apellidos": "García",
  "email": "ana@example.com",
  "password": "secret",
  "id_rol": 2,
  "id_departamento": 1
}
```
PUT /usuarios/{id}
PATCH /usuarios/{id} (parcial)
DELETE /usuarios/{id}

### Asignar Departamento Usuario
POST /usuarios/{id}/departamento
```
{ "id_departamento": 3 }
```

## 10. Headers útiles en Postman

| Header | Valor |
|--------|-------|
| Authorization | Bearer <token> |
| Accept | application/json (por defecto) |
| Content-Type | application/json |

## 11. Errores comunes

- 401: Token inválido o ausente.
- 403: Política impide acción (no propietario o estado no pendiente).
- 422: Validación fallida (mostrar detalles en body `errors`).

## 12. Orden sugerido de pruebas
1. Auth: register -> login -> me
2. Crear roles extra (opcional) y usuarios
3. Fichaje: iniciar jornada -> iniciar pausa -> finalizar pausa -> finalizar jornada
4. Crear incidencias y solicitudes (empleado) y resolver con admin
5. Crear festivos y verificar impacto en reportes (opcional)
6. Ajustar configuración (horas_jornada_estandar) y pedir /reportes/resumen
7. Revisar auditoría tras crear/actualizar/eliminar modelos

---
Guía generada para soporte de pruebas manuales en Postman. Añadir nuevos endpoints aquí conforme se expandan funcionalidades (ej. notificaciones, reporte mensual, etc.).
