import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import {
  HomeIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// Navegación para usuarios base (empleados)
const userNavItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/fichar', label: 'Fichar', icon: ClockIcon },
  { to: '/jornadas', label: 'Mis jornadas', icon: DocumentTextIcon },
  { to: '/incidencias', label: 'Mis incidencias', icon: ExclamationTriangleIcon },
  { to: '/solicitudes', label: 'Mis solicitudes', icon: EnvelopeIcon },
  { to: '/festivos', label: 'Festivos', icon: CalendarDaysIcon },
  { to: '/perfil', label: 'Mi perfil', icon: UserIcon },
]

// Navegación adicional para administradores
const adminNavItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/fichar', label: 'Fichar', icon: ClockIcon },
  { to: '/jornadas', label: 'Jornadas', icon: DocumentTextIcon },
  { to: '/incidencias', label: 'Incidencias', icon: ExclamationTriangleIcon },
  { to: '/solicitudes', label: 'Solicitudes', icon: EnvelopeIcon },
  { to: '/festivos', label: 'Festivos', icon: CalendarDaysIcon },
  { to: '/reportes', label: 'Reportes', icon: ChartBarIcon },
  { to: '/usuarios', label: 'Usuarios', icon: UserGroupIcon },
  { to: '/auditoria', label: 'Auditoría', icon: ShieldCheckIcon },
  { to: '/configuracion', label: 'Configuración', icon: Cog6ToothIcon },
  { to: '/perfil', label: 'Mi perfil', icon: UserIcon },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // Determinar si el usuario es administrador
  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  // Seleccionar navegación según rol
  const navItems = isAdmin ? adminNavItems : userNavItems

  const initials = `${(user?.nombre?.[0]||'').toUpperCase()}${(user?.apellidos?.[0]||'').toUpperCase()}` || 'U'
  const fullName = `${user?.nombre || ''} ${user?.apellidos || ''}`.trim() || user?.email || 'Usuario'

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar menú móvil al cambiar de tamaño de pantalla
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }, [isMobile, mobileMenuOpen])

  // Función para manejar navegación con animación
  const handleNavigation = (to) => {
    if (isMobile) {
      setMobileMenuOpen(false)
    }
    
    setIsNavigating(true)
    
    // Navegación inmediata sin delay
    navigate(to)
    setIsNavigating(false)
  }

  // Componente de navegación reutilizable
  const NavigationItems = ({ className = '', onItemClick }) => (
    <nav className={className}>
      {navItems.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={item.to}
            onClick={() => {
              handleNavigation(item.to)
              onItemClick?.()
            }}
            className={`nav-item ${collapsed && !isMobile ? 'collapsed' : ''} ${isNavigating ? 'navigating' : ''}`}
            style={{
              animationDelay: `${index * 30}ms`,
              animationFillMode: 'both'
            }}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="transition-all duration-300">
                {item.label}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )

  // Navbar superior para móvil
  if (isMobile) {
    return (
      <>
        {/* Navbar superior */}
        <nav className="mobile-navbar">
          <div className="mobile-navbar-content">
            <div className="mobile-navbar-logo">
              <img
                src="/logo.svg"
                alt="Control Laboral"
                className="h-10 w-auto"
              />
            </div>
            <button
              className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>


        {/* Menú lateral deslizable */}
        <aside className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <NavigationItems 
            className="mobile-sidebar-nav"
            onItemClick={() => setMobileMenuOpen(false)}
          />

          <div className="mobile-sidebar-footer">
            <div className="flex items-center gap-3">
              <div className="user-avatar" title={fullName}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {isAdmin ? 'Administrador' : (user?.role?.nombre || 'Empleado')}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="mobile-logout-btn"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>
      </>
    )
  }

  // Sidebar normal para desktop
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header con logo y toggle */}
      <div className="sidebar-header" style={{ padding: collapsed ? '1.5rem 0.5rem' : '1rem 1rem', minHeight: collapsed ? '4.5rem' : '3.5rem' }}>
        {!collapsed && (
          <div className="flex items-center transition-all duration-300">
            <img
              src="/logo.svg"
              alt="Control Laboral"
              className="h-20 w-auto"
              title="Control Laboral"
            />
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center" title="Control Laboral">
            <img
              src="/logo.svg"
              alt="CL"
              className="h-6 w-auto"
            />
          </div>
        )}
        <button
          className="toggle-btn"
          onClick={() => onToggle(!collapsed)}
          aria-label="Alternar menú"
        >
          {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <NavigationItems className="sidebar-nav" />

      {/* Footer con perfil de usuario */}
      <div className="sidebar-footer">
        <div className="flex items-center gap-3">
          <div className="user-avatar" title={fullName}>
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900 truncate leading-tight">
                {fullName}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {isAdmin ? 'Administrador' : (user?.role?.nombre || 'Empleado')}
              </div>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-600 transition-all duration-200 mt-1 font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
        {collapsed && (
          <div className="mt-3 text-center">
            <div className="text-xs text-gray-400 mb-2" title={fullName}>
              {isAdmin ? 'A' : (user?.role?.nombre?.[0] || 'E')}
            </div>
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors duration-200 font-medium"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
