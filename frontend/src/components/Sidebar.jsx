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
  XMarkIcon,
  ArrowRightOnRectangleIcon
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
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onItemClick}
            className={({ isActive }) => 
              `nav-item ${collapsed && !isMobile ? 'collapsed' : ''} ${isActive ? 'active' : ''}`
            }
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
          </NavLink>
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
      <div className="sidebar-header">
        <div className="sidebar-logo-container">
          <img
            src="/logo.svg"
            alt="Control Laboral"
            className="sidebar-logo"
            title="Control Laboral"
          />
        </div>
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
        <div className="sidebar-user-info">
          <div 
            className={`user-avatar ${isAdmin ? 'admin' : 'employee'}`}
            title={fullName}
          >
            {initials}
          </div>
          <div className="user-text-info">
            <div className="user-name">
              {fullName}
            </div>
            <div className="user-role">
              {isAdmin ? 'Administrador' : (user?.role?.nombre || 'Empleado')}
            </div>
          </div>
        </div>
        
        {/* Botón de cerrar sesión */}
        <button
          onClick={logout}
          className="logout-btn"
          title="Cerrar sesión"
        >
          <ArrowRightOnRectangleIcon />
          <span className="logout-text">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
