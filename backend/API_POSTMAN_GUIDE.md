# Belti API - Guía de Pruebas (Postman)

Formato general:
- Base URL (dev): `http://localhost:8000/api` (ajusta según entorno)
- Autenticación: Token Bearer Sanctum (header `Authorization: Bearer {token}`) salvo endpoints públicos de login/register.
- Contenido: `Content-Type: application/json`

## 1. Autenticación

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
Respuesta 201: datos usuario + token (si implementado) o requiere luego login.

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
{ "token": "<SANCTUM_TOKEN>", "user": { ... } }
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

`Route::apiResource('incidencias')`

Campos: fecha (date), tipo (falta|retraso|ausencia_parcial|anomalia_horas|otra), descripcion, estado (enum interno), comentario_revision (admin), fecha_revision.

### Crear
POST /incidencias
```
{
  "fecha": "2025-09-14",
  "tipo": "falta",
  "descripcion": "Olvido fichaje mañana"
}
```
Respuesta 201: objeto incidencia.

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

### Actualizar (Admin - cambio estado)
PATCH /incidencias/{id}
```
{ "estado": "revisada", "comentario_revision": "Verificado" }
```

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
{ "fecha": "2025-12-25", "nombre": "Navidad", "ambito": "nacional" }
```
### Listar
GET /festivos
### Ver
GET /festivos/{id}
### Actualizar (Admin)
PUT /festivos/{id}
```
{ "nombre": "Navidad", "ambito": "nacional" }
```
### Eliminar (Admin)
DELETE /festivos/{id}

## 6. Configuración Empresa (Admin)

GET /configuracion
PUT /configuracion
```
{
  "horas_jornada_estandar": 8,
  "zona_horaria": "Europe/Madrid"
}
```

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
