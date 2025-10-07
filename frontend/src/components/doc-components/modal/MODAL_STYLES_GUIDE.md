# 📘 GUÍA DE USO - SISTEMA UNIFICADO DE ESTILOS PARA MODALES

## 🎯 OBJETIVO
Este documento lista todas las clases CSS disponibles en `modal-styles.css` para que puedas construir modales consistentes sin crear nuevos estilos.

---

## 📦 IMPORTACIÓN

```javascript
// En tu componente React
import '../../components/css-components/modal-styles.css'
```

---

## 🏗️ ESTRUCTURA BÁSICA DE UN MODAL

### 1. VARIANTE ELEGANTE (Recomendada para todos los modales)

```jsx
<Modal>
  <div className="modal-elegant">
    <div className="modal-header">
      <h2 className="modal-title">Título del Modal</h2>
    </div>
    
    <div className="modal-body">
      {/* Contenido aquí */}
    </div>
    
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancelar</button>
      <button className="btn btn-primary">Guardar</button>
    </div>
  </div>
</Modal>
```

**Clases disponibles:**
- `.modal-elegant` - Variante principal (aplicar al contenedor raíz)
- `.modal-header` - Header con gradiente sutil
- `.modal-title` - Título grande y bold
- `.modal-body` - Cuerpo con padding generoso
- `.modal-footer` - Footer con botones alineados a la derecha

---

## 📝 FORMULARIOS EN MODALES

### Labels y Campos

```jsx
<div className="modal-body">
  <label>
    Nombre del Campo <span className="required">*</span>
  </label>
  
  <textarea placeholder="Escribe aquí..."></textarea>
  
  <div className="modal-field-help">
    Texto de ayuda para el usuario
  </div>
</div>
```

**Clases disponibles:**
- `.required` - Asterisco rojo para campos obligatorios
- `textarea` - Estilos automáticos (borde, focus, disabled)
- `.modal-field-help` - Texto de ayuda pequeño y gris

### Grid de Formularios

```jsx
<div className="modal-form-grid cols-2">
  <div>
    <label>Campo 1</label>
    <input type="text" />
  </div>
  <div>
    <label>Campo 2</label>
    <input type="text" />
  </div>
</div>
```

**Clases disponibles:**
- `.modal-form-grid` - Grid básico
- `.cols-2` - 2 columnas (1 en mobile)
- `.cols-3` - 3 columnas (1 en mobile)

---

## 🔍 MODAL DE DETALLES (Información Key-Value)

### Diseño Premium (con iconos)

```jsx
<div className="modal-elegant">
  <div className="modal-body">
    <div className="space-y-5">
      {/* Header con borde inferior */}
      <div>
        <h3>Detalles de la Solicitud</h3>
      </div>
      
      {/* Filas de información */}
      <div className="modal-info-row">
        <div className="modal-info-label">
          <CalendarIcon />
          Fecha
        </div>
        <div className="modal-info-value">
          15 de Octubre, 2024
        </div>
      </div>
      
      <div className="modal-info-row">
        <div className="modal-info-label">
          <UserIcon />
          Usuario
        </div>
        <div className="modal-info-value">
          Juan Pérez
        </div>
      </div>
    </div>
  </div>
</div>
```

**Clases disponibles:**
- `.space-y-5` - Contenedor con espaciado vertical
- `.modal-info-row` - Fila de información (flex horizontal)
- `.modal-info-label` - Label con icono (izquierda)
- `.modal-info-value` - Valor (derecha)

### Diseño Minimalista (sin iconos, más limpio)

```jsx
<div className="modal-elegant">
  <div className="modal-body">
    {/* Header */}
    <div className="detail-header">
      <h3 className="detail-title">Solicitud de Vacaciones</h3>
      <span className="badge success">Aprobada</span>
    </div>
    
    {/* Contenedor de información */}
    <div className="detail-info">
      {/* Fila con 2 columnas */}
      <div className="detail-row">
        <div className="detail-item">
          <span className="detail-label">Tipo</span>
          <span className="detail-value">Vacaciones</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Estado</span>
          <span className="detail-value">Aprobada</span>
        </div>
      </div>
      
      {/* Fila con 1 columna completa */}
      <div className="detail-row single">
        <div className="detail-item full">
          <span className="detail-label">Motivo</span>
          <p className="detail-text">
            Vacaciones de verano programadas...
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Clases disponibles:**
- `.detail-header` - Header simple con borde inferior
- `.detail-title` - Título del detalle
- `.detail-info` - Contenedor de información
- `.detail-row` - Fila con 2 columnas (responsive)
- `.detail-row.single` - Fila con 1 columna
- `.detail-item` - Item individual
- `.detail-item.full` - Item que ocupa toda la fila
- `.detail-label` - Label pequeño uppercase
- `.detail-value` - Valor bold
- `.detail-text` - Texto largo (párrafos)

### Sección de Resolución

```jsx
<div className="detail-resolution aprobada">
  <div className="resolution-header">
    <span className="resolution-label">Aprobada</span>
    <span className="resolution-date">10/10/2024 14:30</span>
  </div>
  
  <div className="resolution-info">
    <span className="resolution-by">Por: Admin Usuario</span>
  </div>
  
  <div className="resolution-comment">
    <p>Aprobado. Todo correcto.</p>
  </div>
</div>
```

**Clases disponibles:**
- `.detail-resolution` - Contenedor de resolución
- `.aprobada` - Variante verde
- `.rechazada` - Variante roja
- `.resolution-header` - Header con label y fecha
- `.resolution-label` - Label uppercase (color según estado)
- `.resolution-date` - Fecha pequeña
- `.resolution-info` - Info del revisor
- `.resolution-by` - Nombre del revisor
- `.resolution-comment` - Bloque de comentario

---

## ✅ MODAL DE CONFIRMACIÓN (Aprobar/Rechazar)

### Aprobar

```jsx
<div className="modal-elegant">
  <div className="modal-body">
    <div className="modal-confirm-approve">
      <div className="flex">
        <div className="modal-confirm-icon">
          <CheckIcon />
        </div>
        <div>
          <h3>¿Aprobar solicitud?</h3>
          <p>
            Estás a punto de aprobar la solicitud de <strong>Juan Pérez</strong>.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Rechazar

```jsx
<div className="modal-elegant">
  <div className="modal-body">
    <div className="modal-confirm-reject">
      <div className="flex">
        <div className="modal-confirm-icon">
          <XMarkIcon />
        </div>
        <div>
          <h3>¿Rechazar solicitud?</h3>
          <p>
            Estás a punto de rechazar la solicitud de <strong>Juan Pérez</strong>.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Clases disponibles:**
- `.modal-confirm-approve` - Contenedor para modal de aprobación
- `.modal-confirm-reject` - Contenedor para modal de rechazo
- `.modal-confirm-icon` - Icono circular con gradiente
- `h3` dentro - Título de confirmación
- `p` dentro - Descripción
- `strong` dentro - Texto destacado

---

## 🎨 SECCIONES DESTACADAS (Bloques de Color)

### Motivo de Rechazo (Rojo)

```jsx
<div className="bg-red-50">
  <div className="flex">
    <XCircleIcon />
    <span>Motivo del Rechazo</span>
  </div>
  <p>
    La solicitud fue rechazada porque...
  </p>
</div>
```

### Comentario de Aprobación (Verde)

```jsx
<div className="bg-green-50">
  <div className="flex">
    <CheckCircleIcon />
    <span>Comentario de Aprobación</span>
  </div>
  <p>
    Todo está correcto. Aprobado.
  </p>
</div>
```

### Información Pendiente (Amarillo)

```jsx
<div className="bg-amber-50">
  <div className="flex">
    <ClockIcon />
    <span>Pendiente de Revisión</span>
  </div>
  <p>
    Esta solicitud está pendiente de revisión por el administrador.
  </p>
</div>
```

### Información General (Azul)

```jsx
<div className="bg-blue-50">
  <p>
    ℹ️ Información adicional sobre esta operación.
  </p>
</div>
```

**Clases disponibles:**
- `.bg-red-50` - Bloque rojo (rechazo, error)
- `.bg-green-50` - Bloque verde (aprobación, éxito)
- `.bg-amber-50` - Bloque amarillo (pendiente, advertencia)
- `.bg-blue-50` - Bloque azul (información general)

---

## 📅 INTEGRACIÓN CON DATEPICKER

Los estilos ya están preparados para que DatePicker funcione correctamente en modales:

```jsx
<div className="modal-elegant">
  <div className="modal-body">
    <div className="datepicker-wrapper">
      <DatePicker 
        selected={fecha}
        onChange={setFecha}
      />
    </div>
  </div>
</div>
```

**Clases disponibles:**
- `.datepicker-wrapper` - Wrapper con z-index adecuado
- `.react-datepicker-popper` - Estilos automáticos (z-index, animaciones deshabilitadas)

---

## 👤 FOOTER DE REVISOR

```jsx
<div className="pt-4 border-t">
  <div className="flex">
    <UserIcon />
    <span>Revisado por: Admin Usuario el 10/10/2024</span>
  </div>
</div>
```

**Clases disponibles:**
- `.pt-4.border-t` - Footer gris con borde superior
- `.flex` dentro - Icono + texto alineados

---

## 🎭 BADGES EN MODALES

Los badges existentes (`.badge`, `.incidencia-badge`, `.solicitud-badge`) ya tienen estilos adaptados para modales:

```jsx
<div className="modal-elegant">
  <span className="badge success">Aprobada</span>
  <span className="badge danger">Rechazada</span>
  <span className="badge warning">Pendiente</span>
</div>
```

---

## 📱 RESPONSIVE AUTOMÁTICO

Todos los estilos son completamente responsive:
- **Desktop (>768px)**: Layout completo con 2-3 columnas
- **Tablet (≤768px)**: Botones full-width, columnas reducidas
- **Mobile (≤640px)**: Todo en 1 columna, padding reducido
- **Mobile Small (≤480px)**: Optimización máxima

**No necesitas clases especiales, el responsive es automático.**

---

## ✨ UTILIDADES ESPECIALES

### Espaciado Vertical

```jsx
<div className="space-y-4">
  {/* Elementos con gap de 1rem */}
</div>

<div className="space-y-5">
  {/* Elementos con gap de 1.25rem */}
</div>

<div className="space-y-0">
  {/* Bloque con fondo gris y padding */}
</div>
```

### Animaciones

Las animaciones están incorporadas automáticamente:
- `.space-y-4`, `.space-y-5` → Animación fadeInUp
- `.bg-red-50`, `.bg-green-50`, `.bg-amber-50` → Animación slideInDown

---

## 🎯 EJEMPLOS COMPLETOS

### Ejemplo 1: Modal de Formulario (Crear/Editar)

```jsx
<Modal isOpen={showModal} onClose={handleClose}>
  <div className="modal-elegant">
    <div className="modal-header">
      <h2 className="modal-title">Nueva Solicitud</h2>
    </div>
    
    <div className="modal-body">
      <div className="modal-form-grid cols-2">
        <div>
          <label>
            Fecha Inicio <span className="required">*</span>
          </label>
          <DatePicker selected={fechaInicio} onChange={setFechaInicio} />
        </div>
        <div>
          <label>
            Fecha Fin <span className="required">*</span>
          </label>
          <DatePicker selected={fechaFin} onChange={setFechaFin} />
        </div>
      </div>
      
      <div>
        <label>
          Motivo <span className="required">*</span>
        </label>
        <textarea 
          placeholder="Describe el motivo de tu solicitud..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <div className="modal-field-help">
          Mínimo 20 caracteres
        </div>
      </div>
    </div>
    
    <div className="modal-footer">
      <button className="btn btn-secondary" onClick={handleClose}>
        Cancelar
      </button>
      <button className="btn btn-primary" onClick={handleSubmit}>
        Guardar
      </button>
    </div>
  </div>
</Modal>
```

### Ejemplo 2: Modal de Detalles (Ver Información)

```jsx
<Modal isOpen={showModal} onClose={handleClose}>
  <div className="modal-elegant">
    <div className="modal-body">
      <div className="detail-header">
        <h3 className="detail-title">Solicitud de Vacaciones</h3>
        <span className="badge success">Aprobada</span>
      </div>
      
      <div className="detail-info">
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Tipo</span>
            <span className="detail-value">Vacaciones</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Usuario</span>
            <span className="detail-value">Juan Pérez</span>
          </div>
        </div>
        
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Fecha Inicio</span>
            <span className="detail-value">01/11/2024</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fecha Fin</span>
            <span className="detail-value">15/11/2024</span>
          </div>
        </div>
        
        <div className="detail-row single">
          <div className="detail-item full">
            <span className="detail-label">Motivo</span>
            <p className="detail-text">
              Vacaciones de verano programadas con antelación.
            </p>
          </div>
        </div>
        
        <div className="detail-resolution aprobada">
          <div className="resolution-header">
            <span className="resolution-label">Aprobada</span>
            <span className="resolution-date">10/10/2024 14:30</span>
          </div>
          
          <div className="resolution-info">
            <span className="resolution-by">Por: Admin Usuario</span>
          </div>
          
          <div className="resolution-comment">
            <p>Todo correcto. Disfuta de tus vacaciones.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="modal-footer">
      <button className="btn btn-secondary" onClick={handleClose}>
        Cerrar
      </button>
    </div>
  </div>
</Modal>
```

### Ejemplo 3: Modal de Confirmación (Aprobar)

```jsx
<Modal isOpen={showAprobarModal} onClose={handleClose}>
  <div className="modal-elegant">
    <div className="modal-body">
      <div className="modal-confirm-approve">
        <div className="flex">
          <div className="modal-confirm-icon">
            <CheckIcon />
          </div>
          <div>
            <h3>¿Aprobar solicitud?</h3>
            <p>
              Estás a punto de aprobar la solicitud de <strong>Juan Pérez</strong> 
              para vacaciones del <strong>01/11/2024</strong> al <strong>15/11/2024</strong>.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <label>Comentario (opcional)</label>
        <textarea 
          placeholder="Añade un comentario..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </div>
    </div>
    
    <div className="modal-footer">
      <button className="btn btn-secondary" onClick={handleClose}>
        Cancelar
      </button>
      <button className="btn btn-success" onClick={handleAprobar}>
        Aprobar
      </button>
    </div>
  </div>
</Modal>
```

### Ejemplo 4: Modal de Confirmación (Rechazar)

```jsx
<Modal isOpen={showRechazarModal} onClose={handleClose}>
  <div className="modal-elegant">
    <div className="modal-body">
      <div className="modal-confirm-reject">
        <div className="flex">
          <div className="modal-confirm-icon">
            <XMarkIcon />
          </div>
          <div>
            <h3>¿Rechazar solicitud?</h3>
            <p>
              Estás a punto de rechazar la solicitud de <strong>Juan Pérez</strong>. 
              Esta acción es permanente.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <label>
          Motivo del rechazo <span className="required">*</span>
        </label>
        <textarea 
          placeholder="Explica el motivo del rechazo..."
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
        />
        <div className="modal-field-help">
          Este comentario será visible para el usuario
        </div>
      </div>
    </div>
    
    <div className="modal-footer">
      <button className="btn btn-secondary" onClick={handleClose}>
        Cancelar
      </button>
      <button className="btn btn-danger" onClick={handleRechazar}>
        Rechazar
      </button>
    </div>
  </div>
</Modal>
```

---

## 🚀 MIGRACIÓN DESDE ESTILOS ANTIGUOS

### Mapeo de clases antiguas a nuevas:

| **Clase Antigua** | **Clase Nueva** | **Notas** |
|-------------------|----------------|-----------|
| `.modal-elegant-solicitud` | `.modal-elegant` | Ahora es genérico |
| `.modal-info-row-solicitud` | `.modal-info-row` | Unificado |
| `.modal-info-label-solicitud` | `.modal-info-label` | Unificado |
| `.modal-info-value-solicitud` | `.modal-info-value` | Unificado |
| `.modal-confirm-solicitud-approve` | `.modal-confirm-approve` | Unificado |
| `.modal-confirm-solicitud-reject` | `.modal-confirm-reject` | Unificado |
| `.solicitud-detail-header` | `.detail-header` | Unificado |
| `.solicitud-detail-title` | `.detail-title` | Unificado |
| `.solicitud-detail-info` | `.detail-info` | Unificado |

---

## ⚠️ IMPORTANTE: NO USAR ESTILOS EN

- **Módulo de Jornadas**: Mantiene sus propios estilos (no migrar)

---

## 📋 CHECKLIST DE MIGRACIÓN

Para migrar un modal existente a este sistema:

1. ✅ Importar `modal-styles.css` en tu componente
2. ✅ Cambiar `.modal-elegant-XXXX` por `.modal-elegant`
3. ✅ Reemplazar clases específicas por las genéricas (ver tabla)
4. ✅ Verificar que los bloques de color usen `.bg-red-50`, `.bg-green-50`, etc.
5. ✅ Comprobar que los grids usen `.modal-form-grid` con `.cols-2` o `.cols-3`
6. ✅ Asegurar que DatePicker esté dentro de `.datepicker-wrapper`
7. ✅ Eliminar estilos redundantes del CSS específico del módulo
8. ✅ Probar responsive en mobile, tablet y desktop

---

## 🎓 MEJORES PRÁCTICAS

1. **Siempre usa `.modal-elegant`** como clase base
2. **Usa `.detail-row` para layouts de 2 columnas** que colapsan en mobile
3. **Usa `.modal-form-grid` para formularios** en lugar de CSS Grid manual
4. **Los bloques de color (`.bg-red-50`, etc.) ya tienen animación** incluida
5. **No añadas estilos inline**, usa las clases existentes
6. **Para badges usa las clases existentes** (`.badge`, `.incidencia-badge`, etc.)
7. **El responsive es automático**, no necesitas media queries adicionales

---

## 📞 SOPORTE

Si necesitas una clase que no existe en este sistema:
1. Revisa si puedes combinar clases existentes
2. Consulta esta guía nuevamente
3. Solo añade CSS nuevo si es absolutamente necesario y específico del módulo

---

**Versión:** 1.0  
**Fecha:** Octubre 2024  
**Compatibilidad:** Solicitudes, Incidencias, Usuarios, Departamentos, y futuros módulos (excepto Jornadas)
