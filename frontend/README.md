# Belti Frontend (React + Vite + Tailwind)

Este frontend implementa la estructura por componentes y pantallas conforme a las funcionalidades descritas en la API. Incluye enrutado, contexto de autenticación, servicios HTTP y vistas placeholder listas para conectar con el backend Laravel.

## Requisitos
- Node 18+ (recomendado LTS)
- Backend Laravel corriendo en `http://localhost:8000` (ajustable por .env)

## Variables de entorno
Copia el archivo `.env.example` a `.env` y ajusta:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Scripts
- `npm run dev` — Arranque en modo desarrollo (Vite)
- `npm run build` — Build de producción en `dist/`
- `npm run preview` — Previsualizar el build de producción
- `npm run lint` — Linter ESLint

## Estructura de carpetas (src)
- `src/main.jsx` — Punto de entrada
- `src/App.jsx` — Definición de rutas con React Router
- `src/index.css` — Estilos globales (Tailwind 4)
- `src/context/AuthContext.jsx` — Contexto de autenticación (login/register/logout)
- `src/lib/api.js` — Cliente Axios con baseURL y token Bearer
- `src/components/ProtectedRoute.jsx` — Ruta protegida (requiere token)
- `src/layouts/MainLayout.jsx` — Layout con navegación superior
- `src/pages/` — Pantallas por dominio de negocio:
  - `auth/`
    - `Login.jsx` — Formulario de acceso
    - `Register.jsx` — Formulario de registro
  - `fichaje/`
    - `Fichaje.jsx` — Toggle iniciar/finalizar jornada y pausa
  - `jornadas/`
    - `Jornadas.jsx` — Listado + resumen con filtros de fecha
  - `incidencias/`
    - `Incidencias.jsx` — Listado + creación básica
  - `solicitudes/`
    - `Solicitudes.jsx` — Listado + creación básica
  - `festivos/`
    - `Festivos.jsx` — Listado + creación/eliminación
  - `configuracion/`
    - `Configuracion.jsx` — GET/PUT de parámetros globales
  - `reportes/`
    - `ReportesResumen.jsx` — Resumen JSON + descarga CSV/PDF
  - `auditoria/`
    - `Auditoria.jsx` — Listado de logs con filtros
  - `admin/`
    - `Roles.jsx` — Listado/creación
    - `Departamentos.jsx` — Listado/creación
    - `Usuarios.jsx` — Listado
  - `NotFound.jsx` — 404
- `src/services/` — Servicios HTTP por módulo:
  - `fichaje.js` — `POST /fichaje/jornada`, `POST /fichaje/pausa`
  - `jornadas.js` — `GET /jornadas`, `GET /jornadas/resumen`
  - `incidencias.js` — CRUD + `PATCH /incidencias/{id}/aprobar`
  - `solicitudes.js` — CRUD
  - `festivos.js` — CRUD
  - `configuracion.js` — `GET/PUT /configuracion`
  - `reportes.js` — JSON/CSV/PDF de `GET /reportes/resumen*`
  - `auditoria.js` — `GET /audit-logs`
  - `admin.js` — `GET/POST /roles`, `/departamentos`, `/usuarios`

## Mapa de rutas (router)
- Público:
  - `/login`
  - `/register`
- Protegidas (requieren token):
  - `/` — Fichaje
  - `/jornadas`
  - `/incidencias`
  - `/solicitudes`
  - `/festivos`
  - `/configuracion`
  - `/reportes/resumen`
  - `/auditoria`
  - `/admin/roles`, `/admin/departamentos`, `/admin/usuarios`

## Flujo de autenticación
- `AuthContext` expone `login(email,password)`, `register(payload)`, `logout()` y guarda token/user en `localStorage`.
- `lib/api` añade el header `Authorization: Bearer <token>` automáticamente y limpia sesión al recibir 401.

## Desarrollo (Windows cmd)
1. Instalar dependencias:
```
npm install
```
2. Crear `.env` a partir de `.env.example` y ajustar `VITE_API_BASE_URL`.
3. Arrancar en desarrollo:
```
npm run dev
```
4. Build de producción:
```
npm run build
```

## Notas
- Las pantallas son placeholders funcionales centrados en la integración con la API; puedes sustituir los `<pre>` de JSON por tablas y componentes UI a medida.
- Tailwind 4 ya está configurado (import global en `index.css`).
