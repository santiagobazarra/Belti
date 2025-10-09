# 📊 Sistema de Reportes - Belti

## Descripción General

El sistema de reportes de Belti proporciona una interfaz completa y moderna para generar, visualizar y exportar reportes del sistema de control horario. Incluye gráficas interactivas, estadísticas en tiempo real y múltiples formatos de exportación.

## 🎨 Componentes Principales

### 1. ChartContainer
Componente reutilizable para mostrar gráficas interactivas usando Chart.js.

```jsx
import ChartContainer from '../../components/ChartContainer'

<ChartContainer
  title="Mi Gráfica"
  type="bar" // 'bar', 'line', 'doughnut'
  data={datosGrafica}
  icon={ChartBarIcon}
  onExport={(url) => console.log('Exportado:', url)}
  onShare={() => console.log('Compartir')}
/>
```

**Props:**
- `title`: Título de la gráfica
- `type`: Tipo de gráfica ('bar', 'line', 'doughnut')
- `data`: Datos para Chart.js
- `icon`: Icono de Heroicons
- `onExport`: Callback para exportar
- `onShare`: Callback para compartir
- `showControls`: Mostrar controles (default: true)

### 2. StatCard
Componente para mostrar estadísticas con tendencias.

```jsx
import StatCard from '../../components/StatCard'

<StatCard
  title="Horas Totales"
  value={168.5}
  format="duration" // 'number', 'currency', 'percentage', 'time', 'duration'
  icon={ClockIcon}
  color="primary" // 'primary', 'success', 'warning', 'danger', 'purple', 'pink'
  trend="up" // 'up', 'down', null
  trendValue={4.2}
/>
```

**Props:**
- `title`: Título de la estadística
- `value`: Valor numérico
- `format`: Formato de visualización
- `icon`: Icono de Heroicons
- `color`: Color del tema
- `trend`: Dirección de la tendencia
- `trendValue`: Valor del cambio porcentual

## 📋 Páginas de Reportes

### 1. Resumen General
- **Ruta**: `/reportes` (tab "Resumen")
- **Funcionalidad**: Dashboard con métricas principales
- **Gráficas**: Barras, estadísticas generales
- **Exportación**: CSV, PDF

### 2. Reporte de Jornadas
- **Ruta**: `/reportes` (tab "Jornadas")
- **Funcionalidad**: Análisis de jornadas laborales
- **Gráficas**: Distribución de horas por día
- **Filtros**: Fechas, empleado

### 3. Reporte de Solicitudes
- **Ruta**: `/reportes` (tab "Solicitudes")
- **Funcionalidad**: Análisis de solicitudes de vacaciones/permisos
- **Gráficas**: Gráfico de dona por tipo
- **Filtros**: Fechas, estado

### 4. Reporte de Incidencias
- **Ruta**: `/reportes` (tab "Incidencias")
- **Funcionalidad**: Análisis de incidencias laborales
- **Gráficas**: Líneas temporales
- **Filtros**: Fechas, tipo

## 🎨 Estilos CSS

### Clases Principales

```css
/* Contenedor de filtros */
.reportes-filters

/* Grid de estadísticas */
.reporte-stats-grid

/* Tarjeta de estadística */
.reporte-stat-card

/* Contenedor de gráfica */
.reporte-chart-container

/* Botones personalizados */
.reporte-btn
.reporte-btn-primary
.reporte-btn-secondary
.reporte-btn-success
.reporte-btn-warning
```

### Temas de Color

- **Primary**: Azul (#3b82f6)
- **Success**: Verde (#10b981)
- **Warning**: Amarillo (#f59e0b)
- **Danger**: Rojo (#ef4444)
- **Purple**: Morado (#8b5cf6)
- **Pink**: Rosa (#ec4899)

## 📊 Tipos de Gráficas

### 1. Gráfico de Barras
```javascript
const datosBarras = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
  datasets: [{
    label: 'Horas Trabajadas',
    data: [8.5, 7.2, 8.8, 8.0, 7.5],
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderColor: 'rgba(59, 130, 246, 1)',
    borderWidth: 2,
  }]
}
```

### 2. Gráfico de Líneas
```javascript
const datosLineas = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
  datasets: [{
    label: 'Tendencia',
    data: [10, 15, 12, 18, 20],
    borderColor: 'rgba(16, 185, 129, 1)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    fill: true,
  }]
}
```

### 3. Gráfico de Dona
```javascript
const datosDona = {
  labels: ['Vacaciones', 'Permisos', 'Baja Médica'],
  datasets: [{
    data: [45, 23, 12],
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)'
    ]
  }]
}
```

## 🔧 Configuración de Chart.js

### Opciones Personalizadas
```javascript
const opcionesPersonalizadas = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    }
  }
}
```

## 📱 Responsive Design

El sistema de reportes es completamente responsive:

- **Desktop**: Grid completo con múltiples columnas
- **Tablet**: Adaptación de columnas y espaciado
- **Mobile**: Diseño de una columna con navegación optimizada

### Breakpoints
- `1024px`: Adaptación de grid y espaciado
- `768px`: Cambio a diseño móvil
- `480px`: Optimización para pantallas pequeñas

## 🚀 Funcionalidades Avanzadas

### 1. Exportación de Gráficas
- **PNG**: Exportación como imagen
- **PDF**: Integración con reportes PDF
- **CSV**: Datos tabulares

### 2. Animaciones
- **Entrada**: Fade-in y slide-up
- **Interacciones**: Hover effects y transiciones
- **Carga**: Spinners y estados de loading

### 3. Accesibilidad
- **ARIA labels**: Para lectores de pantalla
- **Navegación por teclado**: Soporte completo
- **Contraste**: Cumplimiento de WCAG

## 🔌 Integración con API

### Ejemplo de Uso
```javascript
const generarReporte = async () => {
  setLoading(true)
  try {
    const response = await api.get('/reportes/jornadas', {
      params: filtros
    })
    setDatos(response.data)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setLoading(false)
  }
}
```

## 📈 Mejores Prácticas

### 1. Performance
- Usar `useMemo` para datos de gráficas
- Implementar lazy loading para gráficas pesadas
- Optimizar re-renders con `useCallback`

### 2. UX
- Mostrar estados de carga claros
- Proporcionar feedback visual inmediato
- Incluir tooltips informativos

### 3. Datos
- Validar datos antes de renderizar
- Manejar estados vacíos graciosamente
- Proporcionar datos de ejemplo para desarrollo

## 🛠️ Desarrollo

### Estructura de Archivos
```
frontend/src/pages/reportes/
├── Reportes.jsx           # Página principal con tabs
├── ReportesResumen.jsx    # Componente de resumen
├── css/
│   └── Reportes.css       # Estilos específicos
└── README.md              # Esta documentación

frontend/src/components/
├── ChartContainer.jsx     # Contenedor de gráficas
└── StatCard.jsx          # Tarjeta de estadísticas
```

### Dependencias
- `chart.js`: Librería de gráficas
- `react-chartjs-2`: Wrapper de React para Chart.js
- `@heroicons/react`: Iconografía
- `react-select`: Selectores avanzados

## 📝 Notas de Desarrollo

1. **Chart.js**: Versión 4.x con soporte completo para React 18
2. **Estilos**: Basados en TailwindCSS con CSS personalizado
3. **Temas**: Sistema de colores consistente con el resto de la app
4. **Responsive**: Mobile-first approach con breakpoints optimizados

---

*Última actualización: Octubre 2025*
