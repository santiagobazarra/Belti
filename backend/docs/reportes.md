# Reportes

## Endpoint Resumen
`GET /api/reportes/resumen`

Parámetros query:
- `desde` (YYYY-MM-DD, requerido)
- `hasta` (YYYY-MM-DD, requerido, >= desde)
- `id_usuario` (opcional, solo admin)
- `id_departamento` (opcional, solo admin)

Respuesta JSON:
```
{
  "totales": {
    "horas_netas": 32.5,
    "horas_extra": 4,
    "pausas_no_computables_horas": 1.5,
    "pausas_computables_horas": 0.5,
    "dias_trabajados": 4,
    "horas_jornada_estandar": 8,
    "horas_deficit": -0.5
  },
  "detalle": [
    {
      "fecha": "2025-09-12",
      "usuario": "Nombre Apellidos",
      "departamento": "IT",
      "horas_netas": 8,
      "horas_extra": 1,
      "pausas_no_computables_horas": 0.25,
      "pausas_computables_horas": 0.0
    }
  ]
}
```

Notas:
- `horas_netas` proviene de `jornadas.total_horas` (ya neto descontando pausas no computables).
- `horas_extra` suma de campo `horas_extra` por jornada.
- Pausas se agrupan según `es_computable`.
- `horas_jornada_estandar` se lee de configuración (`configuracion_empresa` clave `horas_jornada_estandar`, por defecto 8 si no existe).
- `horas_deficit = horas_jornada_estandar * dias_trabajados - horas_netas` (positivo indica déficit, negativo indica superávit).

Restricciones de acceso:
- Empleado: siempre forzado a su propio usuario aunque envíe `id_usuario`.
- Admin: puede filtrar por usuario y/o departamento.

## Export CSV
`GET /api/reportes/resumen.csv` mismos parámetros.

Formato columnas:
```
fecha,usuario,departamento,horas_netas,horas_extra,pausas_no_computables_horas,pausas_computables_horas
2025-09-12,Nombre Apellidos,IT,8,1,0.25,0
...
TOTALS,,,32.5,4,1.5,0.5
```

La fila TOTALS coloca totales alineados con las columnas numéricas.

## Export PDF
`GET /api/reportes/resumen.pdf` mismos parámetros que JSON/CSV.

Características:
- Plantilla blade `reportes/resumen_pdf`.
- Incluye tabla detalle y totales + horas estándar y déficit.
- Cabecera `Content-Type: application/pdf` y descarga forzada.

Notas técnicas:
- Usa paquete `barryvdh/laravel-dompdf` (v3.x).
- Para personalizar estilo editar el blade; fuentes embebidas limitadas.

## Próximas mejoras sugeridas
- Exportación PDF.
- Filtro por rango de creación de usuario / rol.
- Métrica `horas_deficit` incluida también en CSV (nueva columna) si se necesita.
- Cachear resultados por combinaciones de filtros + rango.
- Endpoint adicional: agregación mensual agrupada por usuario/departamento.
