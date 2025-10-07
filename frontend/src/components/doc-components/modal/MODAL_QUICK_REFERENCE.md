# 🎨 REFERENCIA RÁPIDA - CLASES CSS DE MODALES

## 📦 IMPORTACIÓN
```javascript
import '../../components/css-components/modal-styles.css'
```

---

## 🏗️ ESTRUCTURA BASE

```
.modal-elegant          → Variante principal (contenedor raíz)
  ├── .modal-header     → Header con gradiente
  │     └── .modal-title → Título grande
  ├── .modal-body       → Cuerpo con padding
  └── .modal-footer     → Footer con botones
```

---

## 📝 FORMULARIOS

### Labels
```
label                   → Label de formulario
  └── .required         → Asterisco rojo (*)
```

### Campos
```
textarea                → Textarea con estilos automáticos
  ::placeholder         → Placeholder gris
  :focus                → Borde azul + sombra
  :disabled             → Fondo gris, deshabilitado
```

### Grids
```
.modal-form-grid        → Grid de formulario
  ├── .cols-2           → 2 columnas (1 en mobile)
  └── .cols-3           → 3 columnas (1 en mobile)
```

### Ayuda
```
.modal-field-help       → Texto de ayuda pequeño
```

---

## 🔍 MODAL DE DETALLES - PREMIUM (con iconos)

```
.space-y-5              → Contenedor espaciado
  └── .modal-info-row   → Fila de información
        ├── .modal-info-label → Label + icono (izq.)
        └── .modal-info-value → Valor (der.)
```

---

## 🔍 MODAL DE DETALLES - MINIMALISTA (sin iconos)

```
.detail-header          → Header simple
  └── .detail-title     → Título del detalle

.detail-info            → Contenedor de info
  └── .detail-row       → Fila (2 cols)
      ├── .single       → 1 columna
      └── .detail-item  → Item individual
            ├── .full   → Ocupa toda la fila
            ├── .detail-label → Label pequeño
            ├── .detail-value → Valor bold
            └── .detail-text  → Texto largo
```

### Resolución
```
.detail-resolution      → Contenedor resolución
  ├── .aprobada         → Verde
  ├── .rechazada        → Rojo
  ├── .resolution-header → Header
  │     ├── .resolution-label → Label estado
  │     └── .resolution-date  → Fecha
  ├── .resolution-info  → Info revisor
  │     └── .resolution-by → Nombre
  └── .resolution-comment → Comentario
```

---

## ✅ MODAL DE CONFIRMACIÓN

### Aprobar
```
.modal-confirm-approve  → Contenedor aprobación
  └── .modal-confirm-icon → Icono circular verde
```

### Rechazar
```
.modal-confirm-reject   → Contenedor rechazo
  └── .modal-confirm-icon → Icono circular rojo
```

### Textos
```
h3                      → Título confirmación
p                       → Descripción
  └── strong            → Texto destacado
```

---

## 🎨 BLOQUES DE COLOR

```
.bg-red-50              → Rojo (rechazo, error)
  ├── svg               → Icono rojo
  ├── span              → Label uppercase
  └── p                 → Texto destacado

.bg-green-50            → Verde (aprobación, éxito)
  ├── svg               → Icono verde
  ├── span              → Label uppercase
  └── p                 → Texto destacado

.bg-amber-50            → Amarillo (pendiente)
  ├── svg               → Icono amarillo
  ├── span              → Label uppercase
  └── p                 → Texto destacado

.bg-blue-50             → Azul (información)
  └── p                 → Texto info
```

---

## 📅 DATEPICKER

```
.datepicker-wrapper     → Wrapper con z-index
.react-datepicker-popper → Auto-configurado
.react-datepicker       → Auto-configurado
```

---

## 👤 FOOTER REVISOR

```
.pt-4.border-t          → Footer gris
  └── .flex             → Icono + texto
        ├── svg         → Icono
        └── span        → Texto
```

---

## 🎭 BADGES

```
.badge                  → Badge genérico
.incidencia-badge       → Badge incidencia
.solicitud-badge        → Badge solicitud
  ├── .success          → Verde
  ├── .danger           → Rojo
  ├── .warning          → Amarillo
  └── .info             → Azul
```

---

## ✨ UTILIDADES

### Espaciado
```
.space-y-4              → Gap 1rem + animación
.space-y-5              → Gap 1.25rem + animación
.space-y-0              → Fondo gris + padding
```

### Flex
```
.flex                   → Display flex
```

---

## 📱 RESPONSIVE

**Automático** - No necesitas clases adicionales

- **>768px**: Layout completo
- **≤768px**: Botones full-width, 1 columna
- **≤640px**: Padding reducido
- **≤480px**: Optimización máxima

---

## 🎯 CLASES MÁS USADAS (TOP 20)

1. `.modal-elegant` - Base obligatoria
2. `.modal-header` - Header del modal
3. `.modal-title` - Título
4. `.modal-body` - Cuerpo
5. `.modal-footer` - Footer
6. `.modal-form-grid` - Grid formulario
7. `.cols-2` - 2 columnas
8. `.required` - Campo obligatorio
9. `.modal-field-help` - Ayuda
10. `.detail-header` - Header detalle
11. `.detail-row` - Fila detalle
12. `.detail-item` - Item detalle
13. `.detail-label` - Label detalle
14. `.detail-value` - Valor detalle
15. `.modal-confirm-approve` - Confirmar aprobación
16. `.modal-confirm-reject` - Confirmar rechazo
17. `.bg-red-50` - Bloque rojo
18. `.bg-green-50` - Bloque verde
19. `.detail-resolution` - Resolución
20. `.aprobada` / `.rechazada` - Estados

---

## 🔄 MIGRACIÓN (Cambios principales)

```
❌ ANTES                        ✅ AHORA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
.modal-elegant-solicitud    →   .modal-elegant
.modal-elegant-incidencia   →   .modal-elegant

.modal-info-row-solicitud   →   .modal-info-row
.modal-info-label-solicitud →   .modal-info-label
.modal-info-value-solicitud →   .modal-info-value

.solicitud-detail-header    →   .detail-header
.solicitud-detail-title     →   .detail-title
.solicitud-detail-info      →   .detail-info

.modal-confirm-solicitud-   →   .modal-confirm-approve
  approve
.modal-confirm-solicitud-   →   .modal-confirm-reject
  reject
```

---

## 🎓 REGLAS DE ORO

1. ✅ Siempre usa `.modal-elegant` como base
2. ✅ Usa `.detail-row` para layouts de 2 columnas
3. ✅ Usa `.modal-form-grid` para formularios
4. ✅ Los bloques de color tienen animación incluida
5. ✅ El responsive es automático
6. ✅ DatePicker necesita `.datepicker-wrapper`
7. ❌ No uses estilos inline
8. ❌ No crees nuevos estilos si existe una clase

---

## 🔧 ESTRUCTURA DE ARCHIVOS

```
frontend/
└── src/
    ├── components/
    │   └── css-components/
    │       ├── modal-styles.css ← ESTILOS
    │       ├── MODAL_STYLES_GUIDE.md ← GUÍA COMPLETA
    │       └── MODAL_QUICK_REFERENCE.md ← ESTA GUÍA
    └── pages/
        ├── solicitudes/
        │   └── Solicitudes.jsx ← Importar aquí
        └── incidencias/
            └── Incidencias.jsx ← Importar aquí
```

---

## 📊 COBERTURA

**✅ Incluido:**
- Solicitudes
- Incidencias
- Usuarios (futuro)
- Departamentos (futuro)
- Festivos (futuro)

**❌ Excluido:**
- Jornadas (mantiene estilos propios)

---

## 🚀 EJEMPLO ULTRA-RÁPIDO

```jsx
import '../../components/css-components/modal-styles.css'

<Modal>
  <div className="modal-elegant">
    <div className="modal-header">
      <h2 className="modal-title">Título</h2>
    </div>
    <div className="modal-body">
      {/* Contenido */}
    </div>
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancelar</button>
      <button className="btn btn-primary">Guardar</button>
    </div>
  </div>
</Modal>
```

---

**Versión:** 1.0  
**Última actualización:** Octubre 2024

Para ejemplos completos ver: `MODAL_STYLES_GUIDE.md`
