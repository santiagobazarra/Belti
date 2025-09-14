# Flujo de Fichaje API

## Endpoints
POST /api/fichaje/jornada
- Toggle inicio/fin de jornada.
- Respuestas:
  - { status: "started", jornada: {...} }
  - { status: "ended", jornada: {...} }

POST /api/fichaje/pausa
- Toggle inicio/fin de pausa.
- Respuestas:
  - { status: "break_started", pausa: {...} }
  - { status: "break_ended", pausa: {...}, acumulado_horas: n }

## Reglas
1. Una sola jornada diaria si permitir_multiples_jornadas_dia = false.
2. No se puede cerrar jornada con pausa abierta.
3. Anti double click: 5s entre acciones jornada/pausa.
4. Pausas no computables (es_computable=false) descuentan tiempo neto.
5. Se registran IP y hora dispositivo.

## Campos opcionales en requests
- device_time: string ISO (hora local del dispositivo) (si no se envía se usa servidor).
- tipo (pausa): texto categoría (ej: descanso, comida, médico...).
- es_computable (pausa): boolean (default false).

## Estados sugeridos frontend
- sin_jornada -> mostrar botón "Iniciar Jornada".
- jornada_abierta (sin pausa) -> botones: "Iniciar Pausa" y "Finalizar Jornada".
- pausa_abierta -> botón "Finalizar Pausa" (deshabilitar cerrar jornada).
- jornada_cerrada -> bloquear toggles (si no se permiten múltiples) o permitir nueva jornada según config.

## Secuencia típica
1. POST /fichaje/jornada  -> started
2. POST /fichaje/pausa    -> break_started
3. POST /fichaje/pausa    -> break_ended
4. POST /fichaje/jornada  -> ended

## Errores (422 JSON {message})
- "Ya existe una jornada registrada hoy"
- "Hay una pausa abierta, ciérrala antes de finalizar la jornada"
- "No hay una jornada abierta para iniciar/terminar pausa"
- "Acción muy rápida, espera unos segundos"

## Próximas mejoras posibles
- Límite máximo de horas continuas.
- Validación de ventana horaria de inicio (ej: no antes de X).
- Tipos de pausa preconfigurados en tabla.
- Registro geolocalización.
