import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'

// Públicas
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import NotFound from './pages/NotFound'

// Privadas - Páginas principales
import Dashboard from './pages/Dashboard'
import Fichar from './pages/fichar/Fichar'
import Jornadas from './pages/jornadas/Jornadas'
import Incidencias from './pages/incidencias/Incidencias'
import Solicitudes from './pages/solicitudes/Solicitudes'
import Festivos from './pages/festivos/Festivos'
import Perfil from './pages/perfil/Perfil'

// Privadas - Solo administradores
import Reportes from './pages/reportes/Reportes'
import GestionUsuarios from './pages/admin/GestionUsuarios'
import Auditoria from './pages/auditoria/Auditoria'
import Configuracion from './pages/configuracion/Configuracion'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="fichar" element={<Fichar />} />
              <Route path="jornadas" element={<Jornadas />} />
              <Route path="incidencias" element={<Incidencias />} />
              <Route path="solicitudes" element={<Solicitudes />} />
              <Route path="festivos" element={<Festivos />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="usuarios" element={<GestionUsuarios />} />
              <Route path="auditoria" element={<Auditoria />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
