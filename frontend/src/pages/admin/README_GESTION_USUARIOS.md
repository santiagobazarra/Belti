# 👥 Gestión de Usuarios y Departamentos

## 📋 Descripción General

Módulo de administración completo para la gestión de usuarios y departamentos del sistema Belti. Proporciona una interfaz moderna con sistema de pestañas para administrar toda la estructura organizativa de la empresa.

## ✨ Características Principales

### **Sistema de Pestañas**
- **Navegación Fluida**: Alterna entre gestión de usuarios y departamentos sin cambiar de página
- **Diseño Moderno**: Indicador visual del tab activo con animación
- **Responsive**: Se adapta a dispositivos móviles ocultando texto y mostrando solo íconos

### **Gestión de Usuarios**
- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar usuarios
- 🔍 **Filtros Avanzados**: Filtrar por departamento y rol con selectores modernos
- 👤 **Avatares Dinámicos**: Iniciales de usuarios con gradientes
- 📊 **Estadísticas**: Contadores en tiempo real
- 🎨 **Badges de Estado**: Indicadores visuales de estado activo/pendiente
- 📧 **Validación de Email**: Verificación de emails únicos
- 🔒 **Gestión de Contraseñas**: Cambio opcional al editar (no obligatorio)

### **Gestión de Departamentos**
- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar departamentos
- 👀 **Vista de Detalles**: Modal con información completa del departamento
- 👥 **Listado de Usuarios**: Ver todos los usuarios asignados a cada departamento
- 📊 **Contador de Usuarios**: Visualización rápida de usuarios por departamento
- 📝 **Descripción Opcional**: Campo de descripción para contextualizar departamentos

## 🎨 Diseño y UX

### **Componentes Utilizados**
- **Card**: Contenedor para filtros con glassmorphism
- **List**: Componente reutilizable para listados
- **Modal**: Sistema de modales con diferentes variantes
- **Select (react-select)**: Selectores con búsqueda y diseño personalizado
- **ConfirmDialog**: Confirmaciones para acciones destructivas

### **Estilos Aplicados**
- **Glassmorphism**: Efecto cristal en cards
- **Gradientes**: En avatares e íconos
- **Animaciones**: Transiciones suaves en hover y cambios de estado
- **Sombras**: Profundidad visual con box-shadows
- **Responsive**: Adaptación completa a móviles y tablets

## 🔧 Estructura de Archivos

```
frontend/src/pages/admin/
├── GestionUsuarios.jsx          # Componente principal
└── css/
    └── GestionUsuarios.css      # Estilos específicos
```

## 📊 Flujos de Usuario

### **Flujo de Creación de Usuario**
1. Click en "Nuevo Usuario"
2. Completar formulario:
   - Nombre y apellidos
   - Email único
   - Contraseña
   - Rol (obligatorio)
   - Departamento (opcional)
3. Validación automática
4. Guardar y actualizar lista

### **Flujo de Edición de Usuario**
1. Click en "Editar" en la lista
2. Modal precargado con datos actuales
3. Modificar campos necesarios
4. Contraseña opcional (solo si se quiere cambiar)
5. Actualizar y refrescar lista

### **Flujo de Eliminación de Usuario**
1. Click en "Eliminar"
2. Modal de confirmación con advertencia
3. Confirmación explícita
4. Eliminación permanente
5. Actualización de lista

### **Flujo de Creación de Departamento**
1. Cambiar a pestaña "Departamentos"
2. Click en "Nuevo Departamento"
3. Completar formulario:
   - Nombre (obligatorio)
   - Descripción (opcional)
4. Guardar y actualizar lista

### **Flujo de Vista de Detalles de Departamento**
1. Click en "Ver" en un departamento
2. Modal con información:
   - Nombre y descripción
   - Contador de usuarios
   - Lista completa de usuarios asignados
3. Visualización de avatares y roles de usuarios

## 🎯 Funcionalidades Técnicas

### **Filtrado de Usuarios**
```javascript
// Filtros aplicados vía query params
const params = new URLSearchParams()
if (filters.departamento_id) params.append('id_departamento', filters.departamento_id)
if (filters.rol_id) params.append('id_rol', filters.rol_id)
```

### **Gestión de Estado**
- **useState**: Estados locales para modales, formularios y listas
- **useEffect**: Carga de datos al montar y cambiar filtros
- **useCallback**: Optimización de funciones de carga

### **React Select Personalizado**
```javascript
// Componente de flecha personalizado
const DropdownIndicator = (props) => (
  <div style={{ transform: props.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <ChevronDownIcon />
  </div>
)

// Estilos personalizados para match con el diseño
const customSelectStyles = {
  control: (base, state) => ({
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    // ... más estilos
  })
}
```

## 🔒 Seguridad y Validaciones

### **Validaciones Frontend**
- ✅ Campos obligatorios marcados con asterisco
- ✅ Email válido (type="email")
- ✅ Contraseña obligatoria en creación
- ✅ Rol obligatorio
- ✅ Confirmación antes de eliminar

### **Control de Acceso**
- 🔐 Solo administradores pueden acceder
- 🔐 Verificación de rol en componente
- 🔐 Mensaje de error si no tiene permisos

### **Validaciones Backend Esperadas**
- Email único en la base de datos
- Validación de roles existentes
- Validación de departamentos existentes
- No permitir eliminar departamentos con usuarios (opcional)

## 📱 Responsive Design

### **Desktop (>1024px)**
- Layout completo con todas las columnas
- Filtros en grid de 2 columnas
- Acciones visibles en línea

### **Tablet (768px - 1024px)**
- Filtros en columna única
- Lista adaptada con wrap
- Acciones en línea inferior

### **Mobile (<768px)**
- Tabs con solo íconos
- Filtros full width
- Lista compacta
- Acciones en botones pequeños
- Modales en full screen

## 🎨 Customización de Estilos

### **Variables de Color Principales**
```css
/* Azul primario */
--primary: #3b82f6;
--primary-dark: #2563eb;

/* Grises */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-900: #111827;

/* Estados */
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
```

### **Clases Personalizadas**
- `.gestion-usuarios-container`: Contenedor principal
- `.tabs-container`: Navegación de pestañas
- `.tab-button`: Botón de pestaña individual
- `.filters-card`: Card de filtros
- `.list-item-avatar`: Avatar con iniciales
- `.list-item-badge`: Badges de estado

## 🚀 Mejoras Futuras Sugeridas

### **Funcionalidades**
- [ ] Exportación de usuarios a CSV/Excel
- [ ] Importación masiva de usuarios
- [ ] Asignación múltiple de usuarios a departamentos
- [ ] Histórico de cambios de usuarios
- [ ] Búsqueda por nombre/email
- [ ] Paginación de resultados
- [ ] Ordenamiento de columnas

### **UX/UI**
- [ ] Drag & drop para asignar departamentos
- [ ] Vista de organigrama
- [ ] Estadísticas visuales con gráficas
- [ ] Modo tabla vs modo cards
- [ ] Temas personalizables

### **Técnicas**
- [ ] Caché de datos con React Query
- [ ] Optimistic updates
- [ ] Validación con Zod/Yup
- [ ] Tests unitarios con Vitest
- [ ] Tests E2E con Playwright

## 📚 Dependencias Utilizadas

- **react**: ^19.1.1
- **react-select**: ^5.10.2 (Selectores avanzados)
- **@heroicons/react**: ^2.2.0 (Iconos)
- **react-router-dom**: ^7.9.3 (Navegación)

## 🐛 Troubleshooting

### **Problema: Select no muestra opciones**
**Solución**: Verificar que los datos vienen en el formato correcto:
```javascript
const options = data.map(item => ({ value: item.id, label: item.nombre }))
```

### **Problema: Modal no se cierra**
**Solución**: Verificar que el estado `isOpen` se actualiza correctamente y que el componente Modal tiene la prop `onClose`.

### **Problema: Filtros no funcionan**
**Solución**: Verificar que el backend acepta los query params correctos (`id_departamento`, `id_rol`).

### **Problema: Avatar no muestra iniciales**
**Solución**: Verificar que los campos `nombre` y `apellidos` existen en el objeto usuario.

## 📖 Ejemplos de Uso

### **Crear un usuario programáticamente**
```javascript
const newUser = {
  nombre: 'Juan',
  apellidos: 'Pérez',
  email: 'juan.perez@empresa.com',
  password: 'password123',
  id_rol: 2,
  id_departamento: 1
}

await api.post('/usuarios', newUser)
```

### **Filtrar usuarios por departamento**
```javascript
setFiltersUsuarios({ departamento_id: '3', rol_id: '' })
// Esto disparará useEffect que carga usuarios con el filtro
```

### **Abrir modal de edición**
```javascript
openModalUsuario(usuario)
// Precarga el formulario con los datos del usuario
```

---

**Última actualización**: Octubre 2025  
**Autor**: Sistema Belti  
**Versión**: 1.0.0
