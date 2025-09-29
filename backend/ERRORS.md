# Formato unificado de errores API

Todas las respuestas de error REST devuelven HTTP status apropiado y cuerpo JSON:

```
{
  "success": false,
  "error": {
    "code": "CODIGO_INTERNO",
    "message": "Mensaje legible",
    "details": { ... } // opcional
  }
}
```

## Códigos definidos

| Código | HTTP | Caso | Detalles |
|--------|------|------|----------|
| UNAUTHENTICATED | 401 | Falta token o token inválido | - |
| FORBIDDEN | 403 | Usuario autenticado sin permisos | - |
| NOT_FOUND | 404 | Ruta inexistente o modelo no encontrado | - |
| METHOD_NOT_ALLOWED | 405 | Método HTTP no soportado | - |
| VALIDATION_ERROR | 422 | Fallo de validación de datos | `details` = errores campo => [mensajes] |
| FICHAJE_ERROR | 409/422 | Reglas de negocio fichaje (FichajeException) | Mensaje específico |
| SERVER_ERROR | 500 | Error interno inesperado | En `APP_DEBUG=true` expone mensaje real |

## Ejemplo VALIDATION_ERROR
```
422
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": {
      "fecha": ["The fecha field is required."],
      "tipo": ["The tipo field is required."]
    }
  }
}
```

## Ejemplo UNAUTHENTICATED
```
401
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Autenticación requerida"
  }
}
```

## Ejemplo FORBIDDEN
```
403
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Acceso denegado"
  }
}
```

## Ejemplo NOT_FOUND
```
404
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Recurso no encontrado"
  }
}
```

## Notas
- Siempre incluir cabecera `Accept: application/json` para asegurar formato.
- Nuevos dominios de negocio deben crear excepción dedicada extendiendo `\Exception` y opcionalmente atributo `status`; el Handler la mapeará agregando un `code` propio.
- Evitar devolver respuestas ad-hoc desde controladores (lanza la excepción o deja propagar). Esto mantiene consistencia.
