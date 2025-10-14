   # 🏢 PROMPT INTRODUCTORIO - BELTI: Sistema de Control Horario Laboral

## 📋 DESCRIPCIÓN GENERAL

**Belti** es una aplicación web completa de **control horario laboral** desarrollada para cumplir con la normativa española vigente (**RDL 8/2019** y posteriores). Es un sistema robusto que permite gestionar fichajes, incidencias, solicitudes, reportes y administración de usuarios de forma escalable y segura.

### 🎯 PROPÓSITO PRINCIPAL
- **Control de jornada laboral** con registro preciso de entradas, salidas y pausas
- **Gestión de incidencias** para correcciones y olvidos de fichaje
- **Administración de solicitudes** (vacaciones, permisos, etc.)
- **Cumplimiento normativo** con auditoría completa y retención de 4 años
- **Reportes y análisis** con exportación a CSV/PDF

---

## 🏗️ ARQUITECTURA TÉCNICA

### **Backend (Laravel 11)**
- **Framework**: Laravel con API RESTful
- **Base de datos**: MySQL/SQLite
- **Autenticación**: Laravel Sanctum (JWT)
- **Validación**: Requests con políticas de autorización
- **Servicios**: Lógica de negocio encapsulada
- **Auditoría**: Sistema completo de logs

### **Frontend (React 18)**
- **Framework**: React + Vite
- **Estilos**: TailwindCSS + CSS personalizado
- **Estado**: Context API + useState/useEffect
- **Componentes**: Reutilizables y modulares
- **Navegación**: React Router v6

### **Estructura del Proyecto**
```
Belti/
├── backend/          # API Laravel
│   ├── app/
│   │   ├── Models/   # Eloquent Models
│   │   ├── Controllers/ # API Controllers
│   │   ├── Services/ # Lógica de negocio
│   │   ├── Policies/ # Autorización
│   │   └── Enums/    # Estados y tipos
│   ├── database/     # Migraciones y seeders
│   └── routes/       # API Routes
└── frontend/         # React App
    ├── src/
    │   ├── pages/    # Páginas principales
    │   ├── components/ # Componentes reutilizables
    │   ├── services/ # Cliente API
    │   └── context/  # Context API
    └── dist/         # Build de producción
```

---

## 👥 SISTEMA DE USUARIOS Y ROLES

### **Tipos de Usuario**
1. **Empleado** (rol por defecto)
   - Fichar jornada (entrada/salida)
   - Gestionar pausas
   - Crear/editar incidencias propias (solo pendientes)
   - Crear/editar solicitudes propias (solo pendientes)
   - Ver reportes personales
   - Consultar historial propio

2. **Administrador**
   - Todas las funcionalidades de empleado
   - Aprobar/rechazar incidencias y solicitudes
   - Gestión completa de usuarios
   - Gestión de departamentos y roles
   - Fichaje delegado para otros usuarios
   - Reportes globales y exportación
   - Configuración del sistema

### **Sistema de Autorización**
- **Políticas Laravel**: Centralizadas en `IncidenciaPolicy` y `SolicitudPolicy`
- **Control de acceso**: Basado en roles y propiedad de registros
- **Estados de registros**: Solo se pueden editar registros en estado "pendiente"
- **Auditoría**: Todas las acciones quedan registradas

---

## 📊 MODELOS PRINCIPALES Y RELACIONES

### **User (Usuario)**
```php
- id_usuario (PK)
- nombre, apellidos, email
- password (hashed)
- id_departamento (FK)
- id_tipo_jornada (FK) 
- id_rol (FK)
- activo (boolean)
- fecha_alta, fecha_baja
```

### **Jornada (Fichaje de Jornada)**
```php
- id_jornada (PK)
- id_usuario (FK)
- fecha
- hora_entrada, hora_salida
- estado (abierta/cerrada)
- ip_entrada, ip_salida
- hora_entrada_dispositivo, hora_salida_dispositivo
```

### **Pausa (Pausas durante la jornada)**
```php
- id_pausa (PK)
- id_jornada (FK)
- id_tipo_pausa (FK)
- hora_inicio, hora_fin
- tipo, duracion
- es_computable (boolean)
- minutos_computables
- ip_inicio, ip_fin
```

### **Incidencia (Correcciones/olvidos)**
```php
- id_incidencia (PK)
- id_usuario (FK)
- fecha, hora_inicio, hora_fin
- tipo, descripcion
- estado (pendiente/revisada/resuelta/rechazada)
- id_revisor (FK)
- fecha_revision, comentario_revision
```

### **Solicitud (Vacaciones/permisos)**
```php
- id_solicitud (PK)
- id_usuario (FK)
- fecha_inicio, fecha_fin
- tipo, motivo
- estado (pendiente/aprobada/rechazada/cancelada)
- id_aprobador (FK)
- fecha_resolucion, comentario_resolucion
```

### **Relaciones Clave**
- `User` → `Jornada` (1:N)
- `Jornada` → `Pausa` (1:N)
- `User` → `Incidencia` (1:N)
- `User` → `Solicitud` (1:N)
- `User` → `Department` (N:1)
- `User` → `Role` (N:1)

---

## ⚙️ FUNCIONALIDADES PRINCIPALES

### **1. Sistema de Fichajes**
- **Toggle inteligente**: Un botón que cambia según el estado (Iniciar jornada/Finalizar jornada)
- **Gestión de pausas**: Botón independiente con selección de tipo de pausa
- **Validaciones**: 
  - No permitir múltiples jornadas por día (configurable)
  - No cerrar jornada con pausas abiertas
  - Prevención de doble click (5 segundos)
- **Registro de IP y hora del dispositivo** para auditoría

### **2. Gestión de Incidencias**
- **Estados**: pendiente → revisada → resuelta/rechazada
- **Tipos**: falta, retraso, corrección, etc.
- **Flujo**: Empleado crea → Admin revisa → Admin aprueba/rechaza
- **Edición**: Solo mientras esté pendiente
- **Auditoría**: Quién, cuándo y por qué se aprobó/rechazó

### **3. Gestión de Solicitudes**
- **Tipos**: vacaciones, permisos, ausencias, etc.
- **Estados**: pendiente → aprobada/rechazada
- **Flujo**: Empleado crea → Admin aprueba/rechaza
- **Edición**: Solo mientras esté pendiente
- **Validaciones**: Fechas coherentes, no solapamientos

### **4. Sistema de Pausas**
- **Tipos configurables**: Descanso, comida, personal, etc.
- **Computabilidad**: Algunas pausas no cuentan en la jornada
- **Límites**: Máximo de usos por día y minutos computables
- **Cálculo automático**: Duración y minutos computables

### **5. Reportes y Análisis**
- **Resúmenes**: Semanales, mensuales, anuales
- **KPIs**: Horas trabajadas, horas extra, pausas, etc.
- **Filtros**: Por usuario, departamento, fechas, estado
- **Exportación**: CSV y PDF
- **Incluir/excluir pausas** en cálculos

### **6. Administración**
- **Gestión de usuarios**: CRUD completo con filtros avanzados
- **Gestión de departamentos**: CRUD completo con vista de usuarios asignados
- **Interfaz con pestañas**: Navegación fluida entre usuarios y departamentos
- **Departamentos**: Organización jerárquica con detalles y estadísticas
- **Roles**: Sistema flexible de permisos
- **Configuración**: Parámetros globales del sistema
- **Auditoría**: Logs de todas las acciones críticas

---

## 🎨 INTERFAZ DE USUARIO

### **Diseño y UX**
- **Responsive**: Adaptado a desktop, tablet y móvil
- **Tema claro/oscuro**: Configurable por usuario
- **Componentes modulares**: List, Modal, DatePicker, etc.
- **Feedback visual**: Estados de carga, confirmaciones, errores
- **Accesibilidad**: ARIA labels, navegación por teclado

### **Páginas Principales**
- **Fichaje**: Página principal con botones de jornada y pausas
- **Jornadas**: Historial con filtros y resúmenes
- **Incidencias**: Lista con creación, edición y aprobación
- **Solicitudes**: Lista con creación, edición y aprobación
- **Reportes**: Análisis con gráficas y exportación
- **Configuración**: Preferencias del usuario
- **Admin**: Gestión unificada de usuarios y departamentos con sistema de pestañas

### **Componentes Reutilizables**
- **List**: Lista genérica con paginación y filtros
- **Modal**: Sistema de modales con diferentes variantes
- **DatePicker**: Selector de fechas personalizado
- **Card**: Tarjetas de contenido consistentes
- **Button**: Botones con diferentes estilos y estados

---

## 🔒 SEGURIDAD Y CUMPLIMIENTO

### **Normativa Española**
- **RDL 8/2019**: Registro obligatorio de jornada
- **Retención**: Mínimo 4 años de registros
- **Acceso inmediato**: Para empleados, RRHH e inspección
- **Inmutabilidad**: Los fichajes no se editan, solo se corrigen con incidencias
- **Trazabilidad**: IP, hora servidor, hora dispositivo

### **Medidas de Seguridad**
- **Autenticación**: JWT con Laravel Sanctum
- **Autorización**: Políticas basadas en roles
- **Validación**: Requests con reglas estrictas
- **Auditoría**: Logs de todas las acciones críticas
- **Prevención**: Anti-double-click, validaciones de estado
- **Encriptación**: Contraseñas hasheadas

---

## 🚀 FLUJOS DE TRABAJO PRINCIPALES

### **Flujo de Fichaje Diario**
1. Usuario accede a la aplicación
2. Ve estado actual de su jornada
3. Puede iniciar jornada (si no hay una activa)
4. Durante la jornada puede hacer pausas
5. Al finalizar, cierra la jornada
6. Sistema calcula automáticamente duraciones

### **Flujo de Incidencia**
1. Empleado detecta error en fichaje
2. Crea incidencia con datos correctos
3. Estado: pendiente
4. Administrador revisa y aprueba/rechaza
5. Si se aprueba, sustituye el fichaje original
6. Todo queda auditado

### **Flujo de Solicitud**
1. Empleado necesita días libres
2. Crea solicitud con fechas y motivo
3. Estado: pendiente
4. Administrador revisa y aprueba/rechaza
5. Se registra la decisión con comentarios
6. Empleado puede ver el estado

---

## 🛠️ TECNOLOGÍAS Y HERRAMIENTAS

### **Backend Stack**
- **PHP 8.1+** con Laravel 11
- **MySQL/SQLite** para persistencia
- **Laravel Sanctum** para autenticación
- **Eloquent ORM** para modelos
- **Laravel Policies** para autorización
- **Laravel Migrations** para esquema DB

### **Frontend Stack**
- **React 18** con hooks
- **Vite** como bundler
- **TailwindCSS** para estilos
- **React Router v6** para navegación
- **Axios** para peticiones HTTP
- **Context API** para estado global

### **Herramientas de Desarrollo**
- **Git** para control de versiones
- **Composer** para dependencias PHP
- **NPM** para dependencias JavaScript
- **ESLint** para linting
- **PHPUnit** para testing backend
- **Laravel Telescope** para debugging

---

## 📁 ESTRUCTURA DE ARCHIVOS CLAVE

### **Backend - Archivos Importantes**
```
backend/
├── app/Http/Controllers/
│   ├── AuthController.php          # Login/registro
│   ├── FichajeController.php       # Fichajes y pausas
│   ├── IncidenciaController.php    # CRUD incidencias
│   ├── SolicitudController.php     # CRUD solicitudes
│   └── UserController.php          # Gestión usuarios
├── app/Services/
│   ├── FichajeService.php          # Lógica de fichajes
│   ├── JornadaCalculator.php       # Cálculos de jornada
│   └── ReporteService.php          # Generación reportes
├── app/Models/
│   ├── User.php                    # Modelo usuario
│   ├── Jornada.php                 # Modelo jornada
│   ├── Incidencia.php              # Modelo incidencia
│   └── Solicitud.php               # Modelo solicitud
└── routes/api.php                  # Rutas API
```

### **Frontend - Archivos Importantes**
```
frontend/src/
├── pages/
│   ├── solicitudes/Solicitudes.jsx    # Gestión solicitudes
│   ├── incidencias/Incidencias.jsx    # Gestión incidencias
│   ├── fichaje/Fichaje.jsx            # Página principal
│   ├── admin/GestionUsuarios.jsx      # Gestión usuarios y departamentos
│   └── reportes/ReportesResumen.jsx   # Reportes
├── components/
│   ├── List.jsx                       # Lista reutilizable
│   ├── Modal.jsx                      # Sistema modales
│   ├── DatePicker.jsx                 # Selector fechas
│   ├── Card.jsx                       # Tarjetas de contenido
│   └── ListItems.jsx                  # Items de listas
├── services/
│   ├── api.js                         # Cliente HTTP
│   ├── solicitudes.js                 # API solicitudes
│   └── incidencias.js                 # API incidencias
└── context/AuthContext.jsx            # Autenticación
```

---

## 🎯 CUANDO USAR ESTE PROMPT

### **Casos de Uso Ideales**
- ✅ Añadir nuevas funcionalidades al sistema
- ✅ Modificar flujos existentes de fichaje/solicitudes
- ✅ Crear nuevos tipos de reportes o análisis
- ✅ Implementar nuevas validaciones o reglas de negocio
- ✅ Mejorar la interfaz de usuario
- ✅ Optimizar consultas o performance
- ✅ Añadir nuevos roles o permisos
- ✅ Integrar con sistemas externos

### **Contexto de Desarrollo**
- **Estado actual**: Sistema funcional en producción
- **Arquitectura establecida**: No cambiar stack tecnológico
- **Patrones establecidos**: Seguir convenciones existentes
- **Testing**: Mantener cobertura de pruebas
- **Documentación**: Actualizar docs cuando sea necesario

---

## 📝 INSTRUCCIONES DE USO

### **Para Solicitar Cambios**
1. **Describe el objetivo**: ¿Qué quieres lograr?
2. **Especifica el alcance**: ¿Qué partes afecta?
3. **Menciona restricciones**: ¿Algo que no deba cambiar?
4. **Incluye ejemplos**: Si es posible, muestra el comportamiento esperado

### **Para Reportar Problemas**
1. **Describe el comportamiento actual**: ¿Qué está pasando?
2. **Explica el comportamiento esperado**: ¿Qué debería pasar?
3. **Incluye pasos para reproducir**: ¿Cómo se reproduce?
4. **Menciona el contexto**: ¿En qué página/funcionalidad ocurre?

### **Para Nuevas Funcionalidades**
1. **Define el problema**: ¿Qué necesidad cubre?
2. **Describe la solución**: ¿Cómo debería funcionar?
3. **Especifica usuarios**: ¿Quién la usará?
4. **Menciona integración**: ¿Cómo se relaciona con el sistema actual?

---

## 🔄 MANTENIMIENTO Y EVOLUCIÓN

### **Principios de Desarrollo**
- **DRY**: No repetir código
- **SOLID**: Principios de diseño sólido
- **Clean Code**: Código legible y mantenible
- **Security First**: Seguridad desde el diseño
- **Performance**: Optimización continua
- **UX/UI**: Experiencia de usuario excelente

### **Convenciones Establecidas**
- **Naming**: camelCase en JS, snake_case en PHP
- **Estructura**: Componentes por funcionalidad
- **Estilos**: TailwindCSS + CSS personalizado
- **API**: RESTful con respuestas JSON consistentes
- **Errores**: Mensajes descriptivos y útiles
- **Logs**: Auditoría completa de acciones críticas

---

## 🎉 CONCLUSIÓN

**Belti** es un sistema robusto y completo de control horario que cumple con la normativa española y proporciona una excelente experiencia tanto para empleados como para administradores. Su arquitectura modular y bien documentada permite evoluciones y mejoras continuas manteniendo la estabilidad y seguridad del sistema.

**¡Está listo para recibir nuevas funcionalidades y mejoras!** 🚀

---

*Este prompt introductorio se actualiza periódicamente para reflejar el estado actual del sistema. Última actualización: Octubre 2025*






