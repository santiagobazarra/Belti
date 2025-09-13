# 📌 Belti – Web App

Aplicación web para **control horario laboral**, desarrollada como un sistema completo de fichajes, incidencias, resúmenes y gestión de usuarios.  
Cumple con la normativa española vigente (**RDL 8/2019** y posteriores desarrollos legales) sobre registro de jornada laboral.

---

## 🚀 Descripción general

**Control Laboral** es una aplicación web que permite a empleados y administradores gestionar de forma sencilla y auditada:

- Registro de **entradas, salidas y pausas** (con botón independiente y contador).
- Creación y validación de **incidencias** (olvidos de fichaje, correcciones).
- Generación de **resúmenes semanales, mensuales y anuales** con KPIs.
- Gestión de **usuarios, roles y departamentos** por parte de RRHH/Administración.
- Cumplimiento de la **normativa de control horario** con retención mínima de 4 años y acceso inmediato a registros.

El sistema está diseñado para ser **escalable**, **seguro** y **multiplataforma** (usable desde web y adaptado a tablets).

---

## 👤 Funcionalidades de empleado
- **Fichar jornada**: botón inteligente de entrada/salida según el estado actual de la jornada.
- **Gestionar pausas**: botón específico para iniciar/detener pausa (con contador acumulativo, disponible solo si hay entrada activa).
- **Registrar incidencias**: con fecha, hora de inicio, hora de fin, motivo y pausas opcionales mediante botón *Añadir pausa*.  - Validaciones: no se permiten incidencias sin jornada (fecha, inicio, fin). Las pausas son opcionales.
- **Editar/Eliminar incidencias**: siempre que estén en estado *pendiente*.
- **Consultar historial**: listado filtrable de fichajes e incidencias.
- **Resúmenes**: vista semanal, mensual o anual con KPIs y gráficas.  - Incluye **checkbox “Incluir pausas”** (marcado por defecto) para ver el cómputo con/sin pausas.
- **Calendario**: vista mensual de jornadas, incidencias y (opcional) solicitudes de vacaciones.
- **Preferencias**: idioma, tema claro/oscuro, zona horaria, cambio de contraseña con verificación.

---

## 🛠️ Funcionalidades de administrador / RRHH
- **Gestión de incidencias**: aprobar, rechazar o solicitar aclaraciones (todo queda auditado).
- **Fichaje delegado**: registrar entrada/salida de un empleado con motivo asociado.
- **Gestión de usuarios**: crear nuevos empleados, asignar roles, departamentos, restablecer contraseñas, activar/desactivar usuarios.
- **Informes globales**: resúmenes por empleado/departamento, exportación a **CSV/PDF**.
- **Políticas configurables**: duración de jornada, pausas computables/no computables, umbrales de horas extra.

---

## 📊 Reglas de cálculo
- **Tiempo efectivo** = (hora salida – hora entrada) – pausas no computables.
- **Incidencias aprobadas** sustituyen o completan fichajes en el cómputo.
- **Horas extra** = tiempo efectivo que supere límites diarios/semanales configurables.
- **Eventos atómicos inmutables**: ningún fichaje se edita; toda corrección pasa por incidencias o fichajes delegados.
- Todos los registros guardan **IP de origen**, **hora del servidor** y, opcionalmente, **hora del dispositivo** con offset.

---

## ⚖️ Cumplimiento normativo
- Basado en **RDL 8/2019** (registro obligatorio de jornada) y **anteproyecto 2025** (digitalización y trazabilidad).
- Registros disponibles de forma inmediata para empleados, RRHH e inspección.
- Conservación mínima de **4 años**.
- Sin almacenamiento de datos sensibles (ej. salud). Ausencias médicas solo como tipos genéricos.
- Logs de auditoría para toda acción crítica (aprobaciones, ediciones, borrados).

---

## 🏗️ Tecnologías recomendadas
- **Frontend**: React, TailwindCSS, i18n para idiomas.- **Backend**: Laravel (PHP), API RESTful + JWT para autenticación.- **Base de datos**: MySQL.- **Infraestructura**: servidor NTP sincronizado y copias de seguridad cifradas.

---

## 📦 Instalación (guía inicial)
```bash
# Clonar repositorio
git clone https://github.com/santiagobazarra/belti.git
cd belti

# Backend (Laravel ejemplo)
cd backend
composer install
php artisan migrate
php artisan serve

# Frontend (React ejemplo)
cd frontend
npm install
npm run dev
```

---

## 🤝 Contribuciones
¡Las contribuciones son bienvenidas!  
Abre un *issue* para reportar errores o sugerir mejoras.  
Envía un *pull request* para colaborar con código.

---

## 📄 Licencia
Este proyecto está bajo la licencia **MIT**. Consulta el archivo LICENSE para más detalles.
