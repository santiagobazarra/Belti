# Componente List

## Descripción

El componente `List` es un componente reutilizable para crear listas minimalistas con diseño moderno y responsive. Está basado en el patrón exitoso implementado en las páginas de Solicitudes e Incidencias.

## Características

- ✅ **Responsive**: Adaptación automática a desktop, tablet y mobile
- ✅ **Configurable**: Props flexibles para diferentes casos de uso
- ✅ **Reutilizable**: Una sola implementación para múltiples tipos de listas
- ✅ **Accesible**: Estructura semántica y navegación por teclado
- ✅ **Animaciones**: Transiciones suaves y animaciones de entrada
- ✅ **Estados**: Manejo de carga, vacío y errores

## Estructura de Archivos

```
frontend/src/components/
├── List.jsx                    # Componente principal
├── ListItems.jsx              # Componentes específicos (SolicitudItem, IncidenciaItem)
├── css-components/
│   └── List.css               # Estilos del componente
└── List.md                    # Esta documentación
```

## Importación

```jsx
import List from '../../components/List';
import { SolicitudItem, IncidenciaItem } from '../../components/ListItems';
import '../../components/css-components/List.css';
```

## Uso Básico

```jsx
<List
  items={items}
  renderItem={(item) => <CustomItem item={item} />}
  config={{
    variant: 'custom',
    showHeader: true,
    headerText: 'Mi Lista',
    headerCount: items.length
  }}
/>
```

## Props

### `items` (Array, requerido)
Array de elementos a mostrar en la lista.

### `renderItem` (Function, requerido)
Función que recibe cada elemento y debe retornar el JSX a renderizar.

### `className` (String, opcional)
Clases CSS adicionales para el contenedor principal.

### `config` (Object, opcional)
Objeto de configuración con las siguientes propiedades:

#### `variant` (String, opcional)
- `'solicitud'`: Estilo específico para solicitudes (borde azul en hover)
- `'incidencia'`: Estilo específico para incidencias (borde naranja en hover)
- `'custom'`: Estilo genérico (borde gris en hover)
- **Por defecto**: `'custom'`

#### `itemKey` (String, opcional)
Campo único para la key de cada elemento.
- **Por defecto**: `'id'`

#### `showHeader` (Boolean, opcional)
Mostrar header con contador.
- **Por defecto**: `false`

#### `headerCount` (Number, opcional)
Número a mostrar en el header.
- **Por defecto**: `0`

#### `headerText` (String, opcional)
Texto del header.
- **Por defecto**: `'Elementos'`

#### `loading` (Boolean, opcional)
Estado de carga.
- **Por defecto**: `false`

#### `emptyState` (React.ReactNode, opcional)
Componente personalizado para estado vacío.

## Estructura de Estilos

### Clases Principales

#### Contenedor
```css
.list                    /* Contenedor principal */
.list-solicitud          /* Variante solicitud */
.list-incidencia         /* Variante incidencia */
.list-custom             /* Variante genérica */
```

#### Header
```css
.list-header             /* Contenedor del header */
.list-title              /* Título del header */
.list-count              /* Contador de elementos */
```

#### Estados
```css
.list-loading            /* Estado de carga */
.list-empty              /* Estado vacío */
.list-scrollable         /* Contenedor scrolleable */
```

#### Elementos de Lista
```css
.list-item               /* Elemento individual */
.list-item-solicitud     /* Elemento de solicitud */
.list-item-incidencia    /* Elemento de incidencia */
```

### Estructura de Elemento

Cada elemento de lista sigue esta estructura:

```jsx
<div className="list-item">
  {/* Columna Izquierda: Fecha */}
  <div className="list-date-col">
    <div className="list-date">
      <div className="list-day">lun</div>
      <div className="list-date-number">15</div>
      <div className="list-month">ene</div>
    </div>
    <div className="list-status-indicator success"></div>
  </div>

  {/* Columna Central: Contenido */}
  <div className="list-info-col">
    <div className="list-header-row">
      <div className="list-tipo">Vacaciones</div>
      <span className="list-badge success">Aprobada</span>
    </div>
    <div className="list-meta-row">
      <div className="list-usuario">
        <UserIcon />
        Juan Pérez
      </div>
      <div className="list-meta-item">
        <ClockIcon />
        5 días
      </div>
    </div>
    <div className="list-descripcion">
      15 ene 2024 - 19 ene 2024
    </div>
  </div>

  {/* Columna Derecha: Acciones */}
  <div className="list-actions-col">
    <button className="list-btn-icon list-btn-icon-success">
      <CheckIcon />
    </button>
    <button className="list-btn-resumen">
      <EyeIcon />
      <span>Detalles</span>
    </button>
  </div>
</div>
```

## Clases CSS Disponibles

### Columna Izquierda (Fecha)
```css
.list-date-col           /* Contenedor de fecha */
.list-date               /* Fecha */
.list-day                /* Día de la semana */
.list-date-number        /* Número del día */
.list-month              /* Mes */
.list-status-indicator   /* Indicador de estado */
```

### Columna Central (Contenido)
```css
.list-info-col           /* Contenedor de información */
.list-header-row         /* Fila superior */
.list-tipo               /* Tipo de elemento */
.list-badge              /* Badge de estado */
.list-meta-row           /* Fila de metadata */
.list-usuario            /* Información de usuario */
.list-meta-item          /* Elemento de metadata */
.list-descripcion        /* Descripción */
```

### Columna Derecha (Acciones)
```css
.list-actions-col        /* Contenedor de acciones */
.list-btn-icon           /* Botón de icono */
.list-btn-icon-success   /* Botón éxito */
.list-btn-icon-danger    /* Botón peligro */
.list-btn-icon-primary   /* Botón primario */
.list-btn-resumen        /* Botón de detalles */
```

### Estados de Badge
```css
.list-badge.success      /* Badge verde */
.list-badge.danger       /* Badge rojo */
.list-badge.warning      /* Badge amarillo */
.list-badge.info         /* Badge gris */
```

### Indicadores de Estado
```css
.list-status-indicator.success    /* Indicador verde */
.list-status-indicator.danger     /* Indicador rojo */
.list-status-indicator.warning    /* Indicador amarillo */
.list-status-indicator.info       /* Indicador gris */
```

## Responsive

### Desktop (>1024px)
- Grid de 3 columnas: `auto 1fr auto`
- Fecha en columna izquierda
- Contenido en columna central
- Acciones en columna derecha

### Tablet (768px-1024px)
- Mantiene estructura de 3 columnas
- Reduce gaps y tamaños
- Optimiza espaciado

### Mobile (<768px)
- Layout vertical tipo tarjeta
- Fecha en horizontal con indicador a la derecha
- Contenido apilado verticalmente
- Acciones en grid de 3 columnas
- Botón "Detalles" con texto visible

### Extra Small (<480px)
- Reduce aún más los tamaños
- Optimiza para pantallas muy pequeñas

## Ejemplos de Uso

### Lista de Solicitudes
```jsx
<List
  items={solicitudes}
  renderItem={(solicitud) => (
    <SolicitudItem
      solicitud={solicitud}
      isAdmin={isAdmin}
      onAprobar={handleAprobar}
      onRechazar={handleRechazar}
      onEditar={handleEditar}
      onVerDetalles={handleVerDetalles}
      TIPOS_SOLICITUD={TIPOS_SOLICITUD}
      ESTADOS={ESTADOS}
      calculateDays={calculateDays}
    />
  )}
  config={{
    variant: 'solicitud',
    itemKey: 'id_solicitud',
    showHeader: true,
    headerCount: solicitudes.length,
    headerText: 'Solicitudes',
    loading: loading,
    emptyState: <CustomEmptyState />
  }}
/>
```

### Lista de Incidencias
```jsx
<List
  items={incidencias}
  renderItem={(incidencia) => (
    <IncidenciaItem
      incidencia={incidencia}
      isAdmin={isAdmin}
      onAprobar={handleAprobar}
      onRechazar={handleRechazar}
      onEditar={handleEditar}
      onVerDetalles={handleVerDetalles}
      TIPOS_INCIDENCIA={TIPOS_INCIDENCIA}
      ESTADOS={ESTADOS}
    />
  )}
  config={{
    variant: 'incidencia',
    itemKey: 'id_incidencia',
    showHeader: true,
    headerCount: incidencias.length,
    headerText: 'Incidencias',
    loading: loading
  }}
/>
```

### Lista Personalizada
```jsx
<List
  items={customItems}
  renderItem={(item) => (
    <div className="list-item">
      <div className="list-date-col">
        {/* Fecha personalizada */}
      </div>
      <div className="list-info-col">
        {/* Contenido personalizado */}
      </div>
      <div className="list-actions-col">
        {/* Acciones personalizadas */}
      </div>
    </div>
  )}
  config={{
    variant: 'custom',
    showHeader: false,
    loading: false
  }}
  className="mi-lista-personalizada"
/>
```

## Personalización de Estilos

### Agregar Nuevos Estilos

Para agregar nuevos estilos al componente, edita el archivo `List.css`:

```css
/* Nuevo estilo personalizado */
.mi-lista-personalizada .list-item {
  border-left-color: #purple;
}

.mi-lista-personalizada .list-item:hover {
  border-left-color: #purple;
  background: #f8f0ff;
}

/* Nuevo badge */
.list-badge.custom {
  background: #e9d5ff;
  color: #6b21a8;
}
```

### Variantes Adicionales

Para crear una nueva variante, agrega las clases correspondientes:

```css
.list-mi-variante .list-item:hover {
  border-left-color: #mi-color;
}
```

Y úsala en el config:
```jsx
config={{
  variant: 'mi-variante'
}}
```

## Mejores Prácticas

1. **Siempre importa los estilos**: Incluye `'../../components/css-components/List.css'` en tus páginas
2. **Usa los componentes específicos**: Utiliza `SolicitudItem` e `IncidenciaItem` cuando sea posible
3. **Mantén la estructura**: Respeta la estructura de 3 columnas para consistencia visual
4. **Personaliza con clases**: Agrega clases personalizadas en lugar de modificar el CSS base
5. **Usa las props correctas**: Aprovecha la configuración para diferentes casos de uso

## Troubleshooting

### Problemas Comunes

1. **Estilos no se aplican**: Verifica que hayas importado `List.css`
2. **Responsive no funciona**: Asegúrate de usar las clases correctas (`list-item`, etc.)
3. **Animaciones no aparecen**: Verifica que no haya conflictos con otros CSS
4. **Layout roto**: Confirma que estés usando la estructura correcta de 3 columnas

### Debugging

Para debuggear problemas de estilos:

```jsx
// Agrega clases de debug
<List
  className="debug-list"
  // ... resto de props
/>
```

```css
/* Estilos de debug */
.debug-list .list-item {
  border: 2px solid red !important;
}

.debug-list .list-date-col {
  background: rgba(255, 0, 0, 0.1) !important;
}
```

## Mantenimiento

- **Actualizaciones**: El componente se actualiza automáticamente en todas las páginas que lo usan
- **Nuevas características**: Agrega nuevas props al objeto `config` para mantener compatibilidad
- **Estilos**: Modifica `List.css` para cambios visuales globales
- **Componentes específicos**: Actualiza `ListItems.jsx` para nuevos tipos de elementos

## Conclusión

El componente `List` proporciona una base sólida y reutilizable para crear listas consistentes en toda la aplicación. Su diseño responsive y configurabilidad lo hacen ideal para múltiples casos de uso, manteniendo la consistencia visual y la facilidad de mantenimiento.
