# Toast Component

Componente de notificaciones tipo toast moderno y reutilizable para toda la aplicación.

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

### Ejemplo 1: Notificación básica con auto-cierre

```jsx
import { useState } from 'react'
import Toast from '../../components/Toast'

function MyComponent() {
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSuccess = () => {
    setMessage({
      type: 'success',
      text: '¡Los datos se han guardado correctamente!'
    })
  }

  return (
    <div>
      <button onClick={handleSuccess}>Guardar</button>
      
      <Toast
        type={message.type}
        message={message.text}
        isVisible={!!message.text}
        onClose={() => setMessage({ type: '', text: '' })}
      />
    </div>
  )
}
```

### Ejemplo 2: Con duración personalizada

```jsx
<Toast
  type="error"
  message="Sesión expirada. Por favor, inicia sesión nuevamente."
  isVisible={isSessionExpired}
  onClose={() => setIsSessionExpired(false)}
  duration={10000} // 10 segundos
  position="top-right"
/>
```

### Ejemplo 3: Sin auto-cierre (solo manual)

```jsx
<Toast
  type="error"
  message="Error crítico. Contacta con soporte."
  isVisible={hasCriticalError}
  onClose={() => setHasCriticalError(false)}
  duration={0} // No se cierra automáticamente
/>
```

### Ejemplo 4: Con manejo de errores de API

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

### Ejemplo 5: Múltiples notificaciones con temporizador

```jsx
const showNotifications = () => {
  // Primera notificación
  setMessage({
    type: 'success',
    text: 'Paso 1 completado'
  })

  // Segunda notificación después de 6 segundos
  setTimeout(() => {
    setMessage({
      type: 'success',
      text: 'Paso 2 completado'
    })
  }, 6000)
}
```

## 🎨 Personalización

El componente usa las siguientes animaciones CSS (ya incluidas):
- `animate-slideInRight` - Entrada desde la derecha
- `animate-slideInLeft` - Entrada desde la izquierda
- `animate-shrinkWidth` - Barra de progreso

Los colores se ajustan automáticamente según el tipo:
- **Success**: Verde/Emerald
- **Error**: Rojo/Rose

## 🔧 Integración con formularios

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    const response = await api.post('/users', formData)
    setMessage({
      type: 'success',
      text: `Usuario ${response.data.nombre} creado correctamente`
    })
    // Resetear formulario después del mensaje
    setTimeout(() => {
      resetForm()
    }, 5000)
  } catch (error) {
    setMessage({
      type: 'error',
      text: extractErrorMessage(error, 'Error al crear usuario')
    })
  }
}
```

## 📝 Notas

- El componente se monta/desmonta automáticamente según `isVisible`
- La barra de progreso se sincroniza con la duración configurada
- El auto-cierre solo se activa si `duration > 0`
- Puedes tener múltiples instancias del componente si necesitas mostrar varios toasts simultáneamente

## 🎯 Mejores Prácticas

1. **Usa mensajes claros y concisos**: Evita textos muy largos
2. **Configura duraciones apropiadas**: 
   - Éxito: 3-5 segundos
   - Error: 5-7 segundos
   - Críticos: Sin auto-cierre (duration={0})
3. **Posición consistente**: Usa la misma posición en toda la app
4. **Evita spam**: No muestres múltiples toasts simultáneos
5. **Feedback inmediato**: Muestra el toast inmediatamente después de una acción

## 🔄 Actualizaciones Futuras

Posibles mejoras para implementar:
- Tipos adicionales: `warning`, `info`
- Sonidos de notificación
- Cola de notificaciones
- Animaciones de salida
- Temas personalizables
- Soporte para HTML en mensajes
