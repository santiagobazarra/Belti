import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === '1')
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Guardar estado del sidebar solo en desktop
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar_collapsed', sidebarCollapsed ? '1' : '0')
    }
  }, [sidebarCollapsed, isMobile])

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <main className={`main-content ${sidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile-layout' : ''}`}>
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
