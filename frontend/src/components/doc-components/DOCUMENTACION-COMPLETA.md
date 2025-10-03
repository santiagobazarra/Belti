# 📚 Documentación Completa - Componentes UI de Belti

> Documentación unificada de todos los componentes UI desarrollados para la aplicación de control horario Belti.

---

## 📖 Índice

1. [Card Component](#1-card-component)
2. [DatePicker Component](#2-datepicker-component)
3. [Toast Component](#3-toast-component)
4. [JornadaResumenModal Component](#4-jornadaresumenmodal-component)
5. [Lista de Jornadas](#5-lista-de-jornadas)
6. [Resolución de Problemas](#6-resolución-de-problemas)
7. [Mejores Prácticas](#7-mejores-prácticas)

---

# 1. Card Component

## 📦 Descripción General

Componente reutilizable de tarjeta (card) con efecto glassmorphism, optimizado para evitar conflictos de z-index con elementos interactivos como calendarios, dropdowns y modales.

## 🎯 Características

- ✅ Diseño glassmorphism elegante
- ✅ Variante especial `card-interactive` sin backdrop-filter para evitar stacking context issues
- ✅ Efecto hover opcional
- ✅ Subcomponentes Header, Body, Footer
- ✅ Variantes de color (primary, success, warning, danger)
- ✅ Estados especiales (loading, disabled)
- ✅ Responsive y accesible
- ✅ Dark mode ready

## 📝 Uso Básico

```jsx
import Card from '../../components/Card'

// Card simple
<Card>
  <p>Contenido del card</p>
</Card>

// Card con hover effect
<Card hover>
  <p>Card con efecto hover</p>
</Card>

// Card sin padding (contenido custom)
<Card noPadding>
  <img src="imagen.jpg" alt="Imagen" />
</Card>
```

## 🎨 Card Interactivo (para DatePickers, Selects, etc.)

**IMPORTANTE**: Usa la clase `card-interactive` cuando el card contenga elementos con z-index alto como calendarios o dropdowns.

```jsx
<Card className="card-interactive">
  <DatePicker
    label="Fecha"
    selected={fecha}
    onChange={setFecha}
  />
</Card>
```

### ¿Por qué `card-interactive`?

El efecto `backdrop-filter: blur()` crea un nuevo **stacking context** en CSS, lo que causa que elementos con z-index alto (como calendarios) se oculten detrás del card. La clase `card-interactive`:

- ❌ Remueve el `backdrop-filter`
- ✅ Usa un background más opaco
- ✅ Aumenta la sombra para compensar
- ✅ Permite que calendarios/dropdowns se muestren correctamente

## 🧩 Subcomponentes

```jsx
<Card>
  <Card.Header>
    <h2>Título del Card</h2>
  </Card.Header>
  
  <Card.Body>
    <p>Contenido principal</p>
  </Card.Body>
  
  <Card.Footer>
    <button>Acción</button>
  </Card.Footer>
</Card>
```

## 🎨 Variantes de Color

```jsx
// Card azul (primary)
<Card className="card-primary">
  <p>Card primario</p>
</Card>

// Card verde (success)
<Card className="card-success">
  <p>Card de éxito</p>
</Card>

// Card amarillo (warning)
<Card className="card-warning">
  <p>Card de advertencia</p>
</Card>

// Card rojo (danger)
<Card className="card-danger">
  <p>Card de peligro</p>
</Card>
```

## 🔧 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | ReactNode | - | Contenido del card |
| `className` | string | `''` | Clases CSS adicionales |
| `hover` | boolean | `false` | Activa efecto hover |
| `noPadding` | boolean | `false` | Remueve padding interno |
| `onClick` | function | - | Callback al hacer click |

## 📋 Ejemplos Completos

### Ejemplo 1: Card con DatePickers (Jornadas)

```jsx
import Card from '../../components/Card'
import DatePicker from '../../components/DatePicker'

function Jornadas() {
  const [dateRange, setDateRange] = useState({
    desde: new Date(),
    hasta: new Date()
  })

  return (
    <Card className="card-interactive">
      <div className="flex gap-4">
        <DatePicker
          label="Desde"
          selected={dateRange.desde}
          onChange={(date) => setDateRange(prev => ({...prev, desde: date}))}
        />
        <DatePicker
          label="Hasta"
          selected={dateRange.hasta}
          onChange={(date) => setDateRange(prev => ({...prev, hasta: date}))}
        />
      </div>
    </Card>
  )
}
```

### Ejemplo 2: Cards de Resumen con Hover

```jsx
<div className="grid grid-cols-3 gap-6">
  <Card hover>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">Total</p>
        <p className="text-2xl font-bold text-blue-600">$1,234</p>
      </div>
      <div className="bg-blue-100 p-3 rounded-full">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </Card>
  
  {/* Más cards... */}
</div>
```

---

# 2. DatePicker Component

## 📅 Descripción General

Un componente de selección de fecha personalizado basado en `react-datepicker`, diseñado específicamente para integrarse con el diseño de la aplicación Belti con **prioridad absoluta de z-index**.

## ✨ Características Principales

- 📅 Calendario desplegable con diseño moderno
- ⌨️ Entrada manual de fecha
- 🌍 Localización en español
- 🎨 Estilos personalizados que combinan con el diseño del proyecto
- 🔝 **Z-index: 2147483647** (máximo absoluto) para asegurar visibilidad sobre todo
- ♿ Accesible con teclado
- 📱 Responsive y adaptable a móviles
- ⏰ Soporte opcional para selección de hora

## 🚀 Instalación

```bash
npm install react-datepicker date-fns
```

## 📝 Uso Básico

```jsx
import DatePicker from '../components/DatePicker'
import { useState } from 'react'

function MyComponent() {
  const [fecha, setFecha] = useState(new Date())
  
  return (
    <DatePicker
      label="Selecciona una fecha"
      selected={fecha}
      onChange={(date) => setFecha(date)}
      placeholder="DD/MM/YYYY"
    />
  )
}
```

## 🔧 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `selected` | `Date \| string` | - | Fecha seleccionada (objeto Date o string ISO) |
| `onChange` | `function` | - | Callback cuando cambia la fecha: `(date, event) => void` |
| `label` | `string` | - | Etiqueta del campo |
| `placeholder` | `string` | `'Selecciona una fecha'` | Placeholder del input |
| `minDate` | `Date` | - | Fecha mínima seleccionable |
| `maxDate` | `Date` | - | Fecha máxima seleccionable |
| `disabled` | `boolean` | `false` | Si el campo está deshabilitado |
| `dateFormat` | `string` | `'dd/MM/yyyy'` | Formato de fecha |
| `showTimeSelect` | `boolean` | `false` | Mostrar selector de hora |
| `className` | `string` | `''` | Clases CSS adicionales |
| `error` | `string` | - | Mensaje de error a mostrar |

## 💡 Ejemplos

### Fecha básica

```jsx
<DatePicker
  label="Fecha de inicio"
  selected={fechaInicio}
  onChange={setFechaInicio}
/>
```

### Con rango de fechas

```jsx
<DatePicker
  label="Fecha de nacimiento"
  selected={fechaNacimiento}
  onChange={setFechaNacimiento}
  maxDate={new Date()} // No permitir fechas futuras
  minDate={new Date('1900-01-01')} // Fecha mínima
/>
```

### Con selección de hora

```jsx
<DatePicker
  label="Fecha y hora de inicio"
  selected={fechaHora}
  onChange={setFechaHora}
  showTimeSelect
  dateFormat="dd/MM/yyyy HH:mm"
/>
```

### Con validación

```jsx
<DatePicker
  label="Fecha requerida"
  selected={fecha}
  onChange={setFecha}
  error={!fecha ? 'Este campo es obligatorio' : ''}
/>
```

### En un Modal (z-index garantizado)

```jsx
function ModalSolicitudVacaciones({ isOpen, onClose }) {
  const [solicitud, setSolicitud] = useState({
    desde: null,
    hasta: null
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Solicitar Vacaciones</h2>
        
        <div className="space-y-4">
          <DatePicker
            label="Fecha de inicio"
            selected={solicitud.desde}
            onChange={(date) => setSolicitud(prev => ({...prev, desde: date}))}
            minDate={new Date()}
          />
          
          <DatePicker
            label="Fecha de fin"
            selected={solicitud.hasta}
            onChange={(date) => setSolicitud(prev => ({...prev, hasta: date}))}
            minDate={solicitud.desde || new Date()}
          />
          
          {/* El calendario se mostrará SOBRE el modal gracias al z-index máximo */}
        </div>
      </div>
    </div>
  )
}
```

## 🔝 Z-Index y Visibilidad

### Solución Final Implementada

El componente está configurado con **z-index: 2147483647** (máximo absoluto permitido en CSS) para garantizar que SIEMPRE se muestre por encima de cualquier elemento:

```css
/* FUERZA BRUTA: Capturar TODO */
.react-datepicker-popper,
.react-datepicker__tab-loop,
.react-datepicker__portal,
.react-datepicker,
.datepicker-popper,
[class*="react-datepicker"] {
  z-index: 2147483647 !important;
  position: fixed !important;
}
```

### Jerarquía de Z-Index

```
Calendario DatePicker:      2147483647  ⬅️ MÁXIMO ABSOLUTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Toasts/Notifications:       9000
Modales:                    50-51
Cards de Resumen:           auto (< 100)
Contenido normal:           auto
```

### Garantías de Visibilidad

El calendario está **GARANTIZADO** para mostrarse sobre:

✅ **Cards de resumen** (Horas Trabajadas, etc.)
✅ **Modales** (z-index 50-51)
✅ **Toasts** (z-index 9000)
✅ **Sidebars** (z-index 10)
✅ **Cualquier elemento** con z-index < 2147483647

## 🎨 Personalización

### Formatos de fecha comunes

```javascript
// Solo día/mes/año
dateFormat="dd/MM/yyyy"

// Con hora
dateFormat="dd/MM/yyyy HH:mm"

// Mes y año
dateFormat="MM/yyyy"

// Formato largo
dateFormat="EEEE, dd 'de' MMMM 'de' yyyy"
// Resultado: "Lunes, 15 de enero de 2024"
```

## 🔄 Integración con Backend

### Enviar formato ISO

```jsx
const [fecha, setFecha] = useState(new Date())

// Al enviar al backend
const enviarAlBackend = async () => {
  const fechaISO = fecha.toISOString().split('T')[0]
  await api.post('/endpoint', { fecha: fechaISO })
}
```

### Recibir y parsear desde backend

```jsx
// Si el backend devuelve "2024-01-15"
const [fecha, setFecha] = useState(null)

useEffect(() => {
  const cargarDatos = async () => {
    const { data } = await api.get('/endpoint')
    setFecha(new Date(data.fecha)) // Convertir string a Date
  }
  cargarDatos()
}, [])
```

## ♿ Accesibilidad

El componente es accesible mediante teclado:
- **Tab**: Navegar entre elementos
- **Enter/Space**: Abrir calendario
- **Escape**: Cerrar calendario
- **Flechas**: Navegar entre días
- **Page Up/Down**: Cambiar mes
- **Home/End**: Ir al inicio/fin del mes

---

# 3. Toast Component

## 🔔 Descripción General

Componente de notificaciones tipo toast moderno y reutilizable para toda la aplicación con animaciones suaves y auto-cierre configurable.

## 📋 Características

- ✨ Animaciones suaves de entrada y salida
- 🎨 Dos tipos: éxito y error
- 🔔 Auto-cierre configurable
- ❌ Botón de cierre manual
- 📊 Barra de progreso visual
- 📍 4 posiciones disponibles
- 🎭 Efectos hover y transiciones

## 🚀 Uso Básico

### 1. Importar el componente

```jsx
import Toast from '../../components/Toast'
```

### 2. Definir el estado

```jsx
const [message, setMessage] = useState({ type: '', text: '' })
```

### 3. Usar el componente

```jsx
<Toast
  type={message.type}
  message={message.text}
  isVisible={!!message.text}
  onClose={() => setMessage({ type: '', text: '' })}
  duration={5000}
  position="bottom-right"
/>
```

### 4. Mostrar notificaciones

```jsx
// Notificación de éxito
setMessage({
  type: 'success',
  text: '¡Operación completada con éxito!'
})

// Notificación de error
setMessage({
  type: 'error',
  text: 'Ha ocurrido un error. Inténtalo de nuevo.'
})

// Cerrar manualmente
setMessage({ type: '', text: '' })
```

## 📖 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `type` | `'success' \| 'error'` | `'success'` | Tipo de notificación |
| `message` | `string` | `''` | Mensaje a mostrar |
| `isVisible` | `boolean` | `false` | Controla la visibilidad |
| `onClose` | `function` | - | Callback al cerrar |
| `duration` | `number` | `5000` | Duración en ms (0 = sin auto-cierre) |
| `position` | `string` | `'bottom-right'` | Posición en pantalla |

## 📍 Posiciones Disponibles

- `bottom-right` - Esquina inferior derecha (recomendado)
- `bottom-left` - Esquina inferior izquierda
- `top-right` - Esquina superior derecha
- `top-left` - Esquina superior izquierda

## 💡 Ejemplos de Uso

### Con manejo de errores de API

```jsx
const handleApiCall = async () => {
  try {
    await api.post('/endpoint', data)
    setMessage({
      type: 'success',
      text: '¡Operación completada!'
    })
  } catch (error) {
    setMessage({
      type: 'error',
      text: error.response?.data?.message || 'Error al procesar la solicitud'
    })
  }
}
```

### Sin auto-cierre (solo manual)

```jsx
<Toast
  type="error"
  message="Error crítico. Contacta con soporte."
  isVisible={hasCriticalError}
  onClose={() => setHasCriticalError(false)}
  duration={0} // No se cierra automáticamente
/>
```

## 🎯 Mejores Prácticas

1. **Usa mensajes claros y concisos**: Evita textos muy largos
2. **Configura duraciones apropiadas**: 
   - Éxito: 3-5 segundos
   - Error: 5-7 segundos
   - Críticos: Sin auto-cierre (duration={0})
3. **Posición consistente**: Usa la misma posición en toda la app
4. **Evita spam**: No muestres múltiples toasts simultáneos
5. **Feedback inmediato**: Muestra el toast inmediatamente después de una acción

---

# 4. JornadaResumenModal Component

## 🎯 Descripción General

Modal que muestra el resumen detallado de una jornada laboral con un timeline interactivo que visualiza el trabajo y las pausas en tiempo real.

## ✨ Características Principales

### 📊 Timeline Interactivo con Segmentos Reales

El timeline muestra la jornada **exactamente como ocurrió**:

```
09:00    09:30  09:45      12:00  12:30        18:00
  |────────|████|───────────|████|──────────────|
  Trabajo  P1   Trabajo     P2    Trabajo       FIN
```

**Características:**
- ✅ Cada pausa aparece en su **posición temporal real**
- ✅ El trabajo se divide en segmentos entre pausas
- ✅ Los porcentajes son proporcionales al tiempo real
- ✅ Timeline sticky que se convierte en burbuja flotante al hacer scroll
- ✅ Animación fluida y suave (0.8s con curva easeOutExpo)

### 🖱️ Interactividad Bidireccional Completa

#### 1️⃣ Hover en Timeline → Resalta Cards y Lista

**Cuando pasas el mouse sobre TRABAJO (azul):**
```
Timeline: [████ TRABAJO ████] ← hover
              ↓
Card Duración: [RESALTADO - Fondo azul claro]
```

**Cuando pasas el mouse sobre PAUSA (naranja):**
```
Timeline: [██ P1 ██] ← hover
            ↓
Card Pausas: [RESALTADO - Fondo amarillo]
      +
Lista: Item Pausa #1 [RESALTADO]
```

#### 2️⃣ Hover en Lista → Resalta Timeline y Card

```
Lista: [#1] 09:30 → 09:45 [15m] ← hover
              ↓
Timeline: [██ P1 ██] ← OSCURECIDO
              ↓
Card Pausas: [RESALTADO]
```

### 🫧 Timeline Sticky como Burbuja Flotante

Cuando haces scroll en el modal:

**Antes del scroll:**
```
┌─────────────────────────────────────┐
│ Timeline                            │
│ (posición normal, ancho completo)   │
└─────────────────────────────────────┘
```

**Después del scroll:**
```
    ┌──────────────────────────┐
    │ Timeline (burbuja)       │
    │ • Bordes redondeados     │
    │ • Centrado (95% ancho)   │
    │ • Sombra flotante        │
    │ • Animación suave        │
    └──────────────────────────┘
```

**Características de la animación:**
- Duración: 0.8s
- Curva: `cubic-bezier(0.16, 1, 0.3, 1)` (easeOutExpo - misma que Apple)
- Efectos: Transición suave de posición, tamaño, bordes y sombra
- Sin efectos exagerados: Solo movimiento fluido

## 📊 Estructura del Modal

### Header
- Título: "Resumen de Jornada"
- Fecha completa en español
- Botón de cierre (X)

### Body

#### 1. Timeline (Sticky)
```
┌───────────────────────────────────────────┐
│ Timeline de la Jornada        [Trabajo][Pausas]
│ ├─────────┬──┬─────────┬──┬──────────────┤
│ │  Trab.  │P1│  Trab.  │P2│  Trabajo     │
│ └─────────┴──┴─────────┴──┴──────────────┘
│ 09:00                              18:00  │
└───────────────────────────────────────────┘
```

#### 2. Cards de Estadísticas (4 columnas)
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Entrada │ │ Salida  │ │ Duración│ │ Pausas  │
│ 09:00   │ │ 18:00   │ │ 8h 0m   │ │ 0h 30m  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

#### 3. Detalle Cronológico (Lista intercalada)
```
┌─────────────────────────────────────┐
│ Detalle Cronológico          🟠2 ⚫5│
├─────────────────────────────────────┤
│ 🔵 [TRABAJO]        [2h 30m]        │
│    09:00 → 11:30                    │
├─────────────────────────────────────┤
│ 🟠 [Comida]         [30m]           │
│    11:30 → 12:00                    │
├─────────────────────────────────────┤
│ 🔵 [TRABAJO]        [5h 30m]        │
│    12:00 → 17:30                    │
└─────────────────────────────────────┘
```

**Badges en header:**
- 🟠 Naranja: Número de pausas
- ⚫ Gris: Total de actividades (trabajo + pausas)

### Footer
- Botón "Cerrar"

## 🎨 Estilos de Resaltado

### Timeline Segmentos:
```css
/* Normal */
.segment-trabajo { background: #3b82f6; }
.segment-pausa { background: #f59e0b; }

/* Hover (solo oscurecimiento) */
.segment-trabajo:hover {
  background: #2563eb; /* Tono más oscuro */
}

.segment-pausa:hover {
  background: #d97706; /* Tono más oscuro */
}

/* Overlay negro sutil */
.timeline-segment::after {
  background: rgba(0, 0, 0, 0.15);
  opacity: 0 → 1 (on hover)
}
```

### Cards Resaltados:
```css
/* Card de Duración resaltado (trabajo) */
.stat-duracion.stat-card-highlighted {
  background: #eff6ff !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

/* Card de Pausas resaltado */
.stat-card-highlighted {
  background: #fffbeb !important;
  border-color: #fbbf24 !important;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.1);
}
```

### Items de Lista Resaltados:
```css
/* Item de trabajo resaltado */
.actividad-item-highlighted.actividad-item-trabajo {
  background: #eff6ff !important;
  border-color: #3b82f6 !important;
  box-shadow: inset 4px 0 0 #3b82f6; /* Barra lateral azul */
  transform: translateX(2px);
}

/* Item de pausa resaltado */
.actividad-item-highlighted.actividad-item-pausa {
  background: #fffbeb !important;
  border-color: #fbbf24 !important;
  box-shadow: inset 4px 0 0 #f59e0b; /* Barra lateral naranja */
  transform: translateX(2px);
}
```

## 🔧 Lógica de Cálculo

### Algoritmo de Segmentación:

```javascript
calcularSegmentosTimeline() {
  1. Obtener tiempo de inicio y fin de jornada
  2. Ordenar pausas por hora de inicio
  3. Contador de trabajos = 0
  4. Para cada pausa:
     a. Añadir segmento de TRABAJO antes de la pausa (con trabajoIndex++)
     b. Añadir segmento de PAUSA (con pausaIndex)
     c. Actualizar tiempo actual
  5. Añadir segmento de TRABAJO final (con trabajoIndex++)
  6. Calcular porcentaje de cada segmento = (duración / totalTime) * 100
}
```

**Ejemplo Real:**
```
Jornada: 09:00 - 18:00 (9 horas = 540 minutos)

Pausa 1: 10:30 - 10:45 (15 min)
Pausa 2: 14:00 - 14:30 (30 min)

Segmentos generados:
├─ Trabajo 0: 09:00-10:30 = 90 min = 16.7%
├─ Pausa 0:   10:30-10:45 = 15 min = 2.8%
├─ Trabajo 1: 10:45-14:00 = 195 min = 36.1%
├─ Pausa 1:   14:00-14:30 = 30 min = 5.6%
└─ Trabajo 2: 14:30-18:00 = 210 min = 38.8%
```

### Lista Intercalada:

La función `crearListaIntercalada()` genera una lista cronológica con:
- **Tipo**: 'trabajo' o 'pausa'
- **Inicio/Fin**: Objetos Date
- **Duración**: Minutos
- **trabajoIndex**: Índice del período de trabajo
- **pausaIndex**: Índice de la pausa
- **tipoPausa**: Nombre del tipo de pausa (ej: "Comida", "Descanso")

## 📱 Estados de Hover

### Variables de Estado:
```javascript
const [hoveredSegment, setHoveredSegment] = useState(null)
// Índice del segmento en el timeline con hover

const [hoveredPausaIndex, setHoveredPausaIndex] = useState(null)
// Índice de la pausa específica con hover

const [hoveredTrabajoIndex, setHoveredTrabajoIndex] = useState(null)
// Índice del período de trabajo específico con hover (NUEVO)
```

### Flujo de Eventos:

#### Caso 1: Hover en Trabajo del Timeline
```
Usuario → Pasa mouse sobre segmento trabajo #1 en timeline
  ↓
onMouseEnter → setHoveredSegment(index) + setHoveredTrabajoIndex(1)
  ↓
Timeline: segmento se oscurece (#2563eb)
  ↓
Card Duración: se resalta con fondo azul
```

#### Caso 2: Hover en Pausa del Timeline
```
Usuario → Pasa mouse sobre segmento pausa #2 en timeline
  ↓
onMouseEnter → setHoveredSegment(index) + setHoveredPausaIndex(2)
  ↓
Timeline: segmento P2 se oscurece (#d97706)
  ↓
Card Pausas: se resalta con fondo amarillo
  ↓
Lista: Item Pausa #2 se resalta con barra lateral naranja
```

#### Caso 3: Hover en Item de Trabajo de Lista
```
Usuario → Pasa mouse sobre item de trabajo #0 en lista
  ↓
onMouseEnter → setHoveredTrabajoIndex(0)
  ↓
Lista: Item se resalta con barra lateral azul
  ↓
Timeline: Segmento trabajo #0 se oscurece
  ↓
Card Duración: se resalta con fondo azul
```

#### Caso 4: Hover en Item de Pausa de Lista
```
Usuario → Pasa mouse sobre item de pausa #1 en lista
  ↓
onMouseEnter → setHoveredPausaIndex(1)
  ↓
Lista: Item #1 se resalta con barra lateral naranja
  ↓
Timeline: Segmento P1 se oscurece
  ↓
Card Pausas: se resalta con fondo amarillo
```

## 🎯 Labels en Timeline

Los labels se muestran solo si hay espacio suficiente:

### Trabajo:
```javascript
{segmento.porcentaje > 8 && (
  <span>{formatTime(duracion)}</span>
)}
```
- Si ocupa más del 8% → Muestra duración completa (ej: "2h 30m")

### Pausas:
```javascript
{segmento.porcentaje > 8 && (
  <span>P{pausaIndex + 1}</span>
)}
```
- Si ocupa más del 8% → Muestra "P1", "P2", etc.

## 🎨 Paleta de Colores

| Elemento | Normal | Hover | Resaltado |
|----------|--------|-------|-----------|
| **Trabajo Timeline** | `#3b82f6` | `#2563eb` | overlay negro |
| **Pausa Timeline** | `#f59e0b` | `#d97706` | overlay negro |
| **Card Duración** | `#fafafa` | `#f9fafb` | `#eff6ff` |
| **Card Pausas** | `#fafafa` | `#f9fafb` | `#fffbeb` |
| **Item Trabajo** | `white` | `#eff6ff` | `#eff6ff + barra azul` |
| **Item Pausa** | `white` | `#fffbeb` | `#fffbeb + barra naranja` |
| **Badge Pausas** | `#f59e0b` | - | - |
| **Badge Total** | `#6b7280` | - | - |

## ✨ Transiciones

Todas las transiciones son suaves y rápidas:

```css
.timeline-section { transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.timeline-segment { transition: all 0.25s ease-out; }
.stat-card { transition: all 0.2s ease; }
.actividad-item { transition: all 0.2s ease; }
```

## 🚀 Uso

```jsx
import JornadaResumenModal from './JornadaResumenModal'

function Jornadas() {
  const [selectedJornada, setSelectedJornada] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleOpenResumen = (jornada) => {
    setSelectedJornada(jornada)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedJornada(null)
  }

  return (
    <>
      {/* Lista de jornadas con botón Resumen */}
      <button onClick={() => handleOpenResumen(jornada)}>
        Resumen
      </button>

      {/* Modal */}
      {showModal && selectedJornada && (
        <JornadaResumenModal
          jornada={selectedJornada}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
```

## 🔍 Estructura de Datos Esperada

```javascript
jornada = {
  fecha: "2024-01-15",
  hora_inicio: "2024-01-15T09:00:00",
  hora_fin: "2024-01-15T18:00:00",
  duracion_minutos: 480,
  pausa_total_minutos: 30,
  pausas: [
    {
      hora_inicio: "2024-01-15T11:30:00",
      hora_fin: "2024-01-15T12:00:00",
      duracion_minutos: 30,
      tipo_pausa: {
        nombre: "Comida"
      },
      // Fallbacks
      tipo_nombre: "Comida",
      tipo: "Comida"
    }
  ]
}
```

**Sistema de Fallback Robusto:**
```javascript
const inicio = jornada.hora_inicio || jornada.inicio || jornada.hora_entrada || jornada.entrada
const fin = jornada.hora_fin || jornada.fin || jornada.hora_salida || jornada.salida
const tipoPausa = pausa.tipo_pausa?.nombre || pausa.tipo_nombre || pausa.tipo || 'Pausa'
```

---

# 5. Lista de Jornadas

## 🎨 Descripción General

Componente de lista de historial de jornadas con diseño completamente responsive y visual moderno.

## ✨ Características Implementadas

### 📊 Estructura Visual

Cada item de jornada muestra:

1. **Columna de Fecha** (con icono):
   - Día de la semana abreviado (MIÉ)
   - Número del día grande (15)
   - Mes abreviado (Oct)

2. **Columna de Horarios**:
   - Inicio con icono ▶️ verde
   - Flecha divisora (→)
   - Fin con icono ⏹️ rojo

3. **Columna de Estadísticas**:
   - Pausas (si > 0) con icono ⏸️ amarillo
   - Duración con icono 🕐 azul

4. **Columna de Estado y Acciones**:
   - Badge de estado (Finalizada/En curso)
   - Botón "Resumen"

## 📱 Sistema Responsive Completo

### Desktop (>1024px)
```
Grid: auto | 1fr | auto | auto
┌──────┬────────────┬─────────┬────────┐
│Fecha │  Horarios  │  Stats  │ Estado │
└──────┴────────────┴─────────┴────────┘
```

### Tablet (768px - 1024px)
```
Grid: auto | 1fr | auto
┌──────┬────────────┬─────────┐
│Fecha │  Horarios  │  Stats  │
├──────┴────────────┴─────────┤
│     Estado (full width)     │
└─────────────────────────────┘
```

### Móvil (640px - 768px)
```
Grid: auto | 1fr
┌──────┬──────────┐
│Fecha │  (flex)  │
├──────┴──────────┤
│    Horarios     │ (horizontal, centered)
├─────────────────┤
│     Stats       │ (horizontal, centered)
├─────────────────┤
│     Estado      │ (centered)
└─────────────────┘
```

### Móvil pequeño (<640px)
```
Grid: 1fr (single column)
┌─────────────────┐
│      Fecha      │
├─────────────────┤
│   Inicio box    │
│    Fin box      │
├─────────────────┤
│   Pausas box    │
│  Duración box   │
├─────────────────┤
│     Estado      │
│     Resumen     │
└─────────────────┘
```

## 🎯 Características Visuales

### Efectos Hover
```css
.jornada-item:hover {
  transform: translateX(4px);
  box-shadow: -4px 0 0 0 var(--primary-color);
  border-color: var(--primary-color);
}
```

### Animación de Entrada
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

Delays escalonados:
- Item 1: 0.05s
- Item 2: 0.1s
- Item 3: 0.15s
- ...

## 🔧 Sistema de Fallback para Datos

```javascript
// Para horarios
const inicio = jornada.hora_inicio || jornada.inicio || jornada.hora_entrada || jornada.entrada
const fin = jornada.hora_fin || jornada.fin || jornada.hora_salida || jornada.salida

// Para estadísticas
const pausas = jornada.pausa_total_minutos || jornada.pausas_minutos || jornada.pausas || 0
const duracion = jornada.duracion_minutos || jornada.duracion || jornada.total_minutos || 0

// Para estado
const hasFin = jornada.hora_fin || jornada.fin || jornada.hora_salida || jornada.salida
const status = hasFin 
  ? { label: 'Finalizada', class: 'success' } 
  : { label: 'En curso', class: 'warning' }
```

## 📊 Breakpoints Detallados

| Breakpoint | Grid Columns | Padding | Font Sizes | Layout |
|------------|--------------|---------|------------|--------|
| >1024px | 4 cols | 1.25rem | Normal | Horizontal completo |
| 768-1024px | 3 cols | 1rem | Normal | Estado abajo |
| 640-768px | 2 cols | 1rem | Reducido | Apilado parcial |
| 380-640px | 1 col | 0.875rem | Pequeño | Vertical completo |
| <380px | 1 col | 0.75rem | Mini | Vertical compacto |

## 🎨 Estados de Botones

### Botón Resumen
```css
.btn-resumen {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-resumen:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

## 📝 Uso

```jsx
import './Jornadas.css'

function Jornadas() {
  const [jornadas, setJornadas] = useState([])
  
  return (
    <div className="list">
      <div className="list-header">
        Historial de Jornadas
      </div>

      <div className="list-scrollable">
        {jornadas.map((jornada, index) => {
          const status = getJornadaStatus(jornada)
          const inicio = jornada.hora_inicio || jornada.inicio
          const fin = jornada.hora_fin || jornada.fin
          
          return (
            <div key={jornada.id} className="jornada-item">
              {/* Columna de fecha */}
              <div className="jornada-date-col">
                <div className="jornada-icon">
                  <CalendarDaysIcon className="h-5 w-5" />
                </div>
                <div className="jornada-date">
                  <div className="jornada-day">Mié</div>
                  <div className="jornada-date-number">15</div>
                  <div className="jornada-month">Oct</div>
                </div>
              </div>

              {/* Columna de horarios */}
              <div className="jornada-times-col">
                <div className="jornada-time-item">
                  <PlayIcon className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="jornada-time-label">Inicio</div>
                    <div className="jornada-time-value">{formatTimeOnly(inicio)}</div>
                  </div>
                </div>
                <div className="jornada-time-divider">→</div>
                <div className="jornada-time-item">
                  <StopIcon className="h-4 w-4 text-red-600" />
                  <div>
                    <div className="jornada-time-label">Fin</div>
                    <div className="jornada-time-value">{formatTimeOnly(fin)}</div>
                  </div>
                </div>
              </div>

              {/* Columna de stats */}
              <div className="jornada-stats-col">
                <div className="jornada-stat">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="jornada-stat-label">Duración</div>
                    <div className="jornada-stat-value">{formatTime(duracion)}</div>
                  </div>
                </div>
              </div>

              {/* Columna de estado y acciones */}
              <div className="jornada-actions-col">
                <span className={`jornada-badge jornada-badge-${status.class}`}>
                  {status.label}
                </span>
                <button
                  onClick={() => handleOpenResumen(jornada)}
                  className="btn-resumen"
                >
                  <DocumentChartBarIcon className="h-4 w-4" />
                  <span>Resumen</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

# 6. Resolución de Problemas

## 🐛 Problemas Comunes y Soluciones

### Problema: El calendario del DatePicker se oculta detrás de un card

**Causa**: El `backdrop-filter: blur()` del card crea un stacking context que atrapa elementos hijos.

**Solución**:
```jsx
// Usa card-interactive en cards con DatePicker
<Card className="card-interactive">
  <DatePicker ... />
</Card>
```

### Problema: El calendario se oculta detrás de un modal

**Causa**: El modal tiene z-index alto pero menor que el del calendar.

**Solución**: El DatePicker ya tiene z-index 2147483647 (máximo absoluto), por lo que SIEMPRE se mostrará sobre cualquier modal. No requiere ninguna acción adicional.

### Problema: Los datos de jornada no se muestran

**Causa**: El backend puede enviar los datos con nombres de campos diferentes.

**Solución**: Usa el sistema de fallback implementado:
```javascript
const inicio = jornada.hora_inicio || jornada.inicio || jornada.hora_entrada || jornada.entrada
const fin = jornada.hora_fin || jornada.fin || jornada.hora_salida || jornada.salida
```

### Problema: El timeline del modal no se hace sticky

**Causa**: El contenedor padre puede tener `overflow: hidden`.

**Solución**: El modal ya tiene `overflow-y: auto` en `.modal-body`. Asegúrate de que:
```css
.modal-body {
  overflow-y: auto;
  overflow-x: hidden;
}
```

### Problema: El hover no funciona en el timeline

**Causa**: Los handlers de evento no están correctamente conectados.

**Solución**: Verifica que los estados de hover estén definidos:
```javascript
const [hoveredSegment, setHoveredSegment] = useState(null)
const [hoveredPausaIndex, setHoveredPausaIndex] = useState(null)
const [hoveredTrabajoIndex, setHoveredTrabajoIndex] = useState(null)
```

### Problema: La animación del sticky es brusca

**Causa**: Curva de animación incorrecta o duración muy corta.

**Solución**: Usa la curva easeOutExpo:
```css
.timeline-section {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Problema: El toast no desaparece automáticamente

**Causa**: El componente Toast no está recibiendo la prop `duration` o está en 0.

**Solución**:
```jsx
<Toast
  duration={5000} // 5 segundos
  // ...otras props
/>
```

### Problema: Las pausas no aparecen en el timeline

**Causa**: El backend no envía las pausas en formato de array o no tienen `hora_inicio`/`hora_fin`.

**Solución**: Verifica la estructura de datos en consola:
```javascript
console.log('📊 Datos de jornada:', jornada)
console.log('📊 Pausas:', jornada.pausas)
```

Si el backend solo envía `pausa_total_minutos`, el timeline mostrará solo trabajo continuo.

---

# 7. Mejores Prácticas

## 🎯 Componentes

### Card
✅ **Hacer:**
- Usar `card-interactive` para cards con elementos interactivos (DatePicker, Select, Dropdown)
- Usar `hover` para cards clickeables o interactivos
- Agrupar contenido relacionado en un solo card
- Usar subcomponentes (Header, Body, Footer) para estructura clara

❌ **Evitar:**
- Anidar cards dentro de cards
- Usar backdrop-filter en cards con calendarios
- Cards sin padding para contenido de texto
- Cards demasiado anchos (max-width recomendado: 1200px)

### DatePicker
✅ **Hacer:**
- Convertir a formato ISO antes de enviar al backend: `fecha.toISOString().split('T')[0]`
- Usar `minDate`/`maxDate` para validación visual
- Mostrar mensajes de error claros con la prop `error`
- Usar labels descriptivos

❌ **Evitar:**
- Confiar solo en validación client-side
- Fechas sin formateo al mostrar
- Múltiples DatePickers sin Card parent
- Fechas hardcodeadas sin contexto

### Toast
✅ **Hacer:**
- Mensajes cortos y claros (max 80 caracteres)
- Usar duraciones apropiadas según tipo:
  - Éxito: 3-5 segundos
  - Error: 5-7 segundos
  - Crítico: Sin auto-cierre
- Posición consistente en toda la app
- Mostrar inmediatamente después de la acción

❌ **Evitar:**
- Múltiples toasts simultáneos
- Mensajes técnicos para usuarios finales
- Toasts sin botón de cierre manual
- Duraciones muy cortas (<2 segundos) o muy largas (>10 segundos)

### JornadaResumenModal
✅ **Hacer:**
- Cerrar con ESC (ya implementado)
- Mostrar loading state mientras cargan datos
- Manejar casos sin pausas
- Usar el sistema de fallback para campos

❌ **Evitar:**
- Abrir múltiples modales simultáneamente
- Modificar datos directamente en el modal
- No mostrar feedback de errores
- Modales sin scroll para contenido largo

## 🎨 Diseño

### Colores
✅ **Hacer:**
- Usar variables CSS para colores consistentes
- Mantener contraste mínimo 4.5:1 para accesibilidad
- Usar colores semánticos:
  - Azul: Información, trabajo
  - Verde: Éxito, completado
  - Amarillo: Advertencia, en proceso
  - Rojo: Error, urgente
  - Naranja: Pausas, secundario

### Espaciado
✅ **Hacer:**
- Usar escala consistente: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem
- Más espacio alrededor de elementos interactivos (min 44x44px touch target)
- Espaciado consistente en grids y listas

### Tipografía
✅ **Hacer:**
- Jerarquía clara: h1 > h2 > h3 > p
- Line-height: 1.5 para texto, 1.2 para títulos
- Font sizes responsive con media queries
- `text-transform: uppercase` para labels pequeños

## 🚀 Performance

✅ **Hacer:**
- Usar `React.memo()` para componentes que no cambian frecuentemente
- Lazy load de modales y componentes pesados
- Debounce en búsquedas y filtros
- Pagination o infinite scroll para listas largas (>50 items)

❌ **Evitar:**
- Re-renders innecesarios
- Cargar todos los datos al inicio
- Múltiples llamadas API simultáneas
- Imágenes sin optimizar

## ♿ Accesibilidad

✅ **Hacer:**
- Labels en todos los inputs
- Alt text en imágenes
- Navegación con teclado (Tab, Enter, Escape)
- Mensajes de error descriptivos
- Roles ARIA cuando sea necesario
- Focus visible en elementos interactivos

❌ **Evitar:**
- Depender solo de color para información
- Botones sin texto (solo iconos)
- Modales que atrapan el focus
- Inputs sin labels o placeholders poco claros

## 🧪 Testing

✅ **Hacer:**
- Probar en diferentes navegadores (Chrome, Firefox, Safari, Edge)
- Probar en móvil y desktop
- Validar formularios con datos inválidos
- Probar casos límite (listas vacías, errores de red)
- Verificar accesibilidad con herramientas (Lighthouse, WAVE)

## 📦 Organización de Código

✅ **Hacer:**
- Un componente por archivo
- CSS module o archivo CSS dedicado por componente
- Agrupar funciones auxiliares en utils
- Comentar código complejo
- README.md para componentes reutilizables

❌ **Evitar:**
- Componentes gigantes (>500 líneas)
- Lógica de negocio en componentes de UI
- CSS inline excesivo
- Duplicación de código

---

## 📚 Referencias y Recursos

### Documentación Oficial
- [React](https://react.dev/) - Documentación oficial de React
- [React DatePicker](https://reactdatepicker.com/) - Documentación del DatePicker
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
- [Heroicons](https://heroicons.com/) - Iconos SVG

### Conceptos CSS Avanzados
- [CSS Stacking Context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context) - Entender z-index
- [CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/) - Guía completa de Grid
- [CSS Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) - Guía completa de Flexbox
- [CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions) - Transiciones CSS

### Design Patterns
- [React Composition Pattern](https://reactjs.org/docs/composition-vs-inheritance.html) - Composición vs Herencia
- [Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks) - Patrón de componentes compuestos
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) - Hooks personalizados

### Accesibilidad
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Guías de accesibilidad web
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - Mejores prácticas ARIA
- [WebAIM](https://webaim.org/) - Recursos de accesibilidad web

### Herramientas
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Auditoría de performance y accesibilidad
- [WAVE](https://wave.webaim.org/) - Evaluación de accesibilidad web
- [Can I Use](https://caniuse.com/) - Compatibilidad de features CSS/JS

---

## 🎉 Conclusión

Esta documentación cubre todos los componentes UI principales desarrollados para la aplicación Belti:

- ✅ **Card**: Componente de tarjeta reutilizable con solución a problemas de z-index
- ✅ **DatePicker**: Selector de fechas con z-index máximo absoluto
- ✅ **Toast**: Sistema de notificaciones moderno
- ✅ **JornadaResumenModal**: Modal interactivo con timeline y animaciones fluidas
- ✅ **Lista de Jornadas**: Lista responsive con diseño moderno

Todos los componentes están:
- 📱 Completamente responsive
- ♿ Accesibles
- 🎨 Con diseño consistente
- 🚀 Optimizados para performance
- 📚 Documentados con ejemplos

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025  
**Autor**: Equipo Belti

---

💡 **Tip**: Marca esta documentación como favorito. Contiene toda la información necesaria para trabajar con los componentes UI de Belti.

¿Preguntas o sugerencias? Contacta al equipo de desarrollo. 🚀
