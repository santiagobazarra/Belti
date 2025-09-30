import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import {
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    jornadaActual: null,
    resumenSemanal: null,
    incidenciasPendientes: 0,
    solicitudesPendientes: 0,
    proximosFestivos: []
  })
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Cargar datos en paralelo
      const promises = [
        // Jornada actual (todos los usuarios)
        api.get('/jornadas?desde=' + new Date().toISOString().split('T')[0] + '&hasta=' + new Date().toISOString().split('T')[0]).catch(() => ({ data: [] })),
        // Resumen semanal
        api.get('/jornadas/resumen?desde=' + getWeekStart() + '&hasta=' + new Date().toISOString().split('T')[0]).catch(() => ({ data: {} })),
        // Festivos próximos
        api.get('/festivos').catch(() => ({ data: [] }))
      ]

      // Solo administradores cargan estadísticas globales
      if (isAdmin) {
        promises.push(
          api.get('/incidencias?estado=pendiente').catch(() => ({ data: [] })),
          api.get('/solicitudes?estado=pendiente').catch(() => ({ data: [] }))
        )
      } else {
        promises.push(
          api.get('/incidencias?estado=pendiente').catch(() => ({ data: [] })),
          api.get('/solicitudes?estado=pendiente').catch(() => ({ data: [] }))
        )
      }

      const [jornadasHoy, resumenSemanal, festivos, incidencias, solicitudes] = await Promise.all(promises)

      // Procesar festivos próximos (próximos 30 días)
      const hoy = new Date()
      const proximosFestivos = (festivos.data.data || festivos.data || [])
        .filter(festivo => {
          const fechaFestivo = new Date(festivo.fecha)
          const diffTime = fechaFestivo - hoy
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays >= 0 && diffDays <= 30
        })
        .slice(0, 3)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

      setStats({
        jornadaActual: (jornadasHoy.data.data || jornadasHoy.data || [])[0] || null,
        resumenSemanal: resumenSemanal.data || {},
        incidenciasPendientes: isAdmin ?
          (incidencias.data.data || incidencias.data || []).length :
          (incidencias.data.data || incidencias.data || []).filter(i => i.user_id === user.id).length,
        solicitudesPendientes: isAdmin ?
          (solicitudes.data.data || solicitudes.data || []).length :
          (solicitudes.data.data || solicitudes.data || []).filter(s => s.user_id === user.id).length,
        proximosFestivos
      })
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekStart = () => {
    const today = new Date()
    const monday = new Date(today)
    const diff = today.getDay() - 1 // Lunes = 0
    if (diff < 0) monday.setDate(today.getDate() - 6) // Si es domingo
    else monday.setDate(today.getDate() - diff)
    return monday.toISOString().split('T')[0]
  }

  const formatTime = (minutes) => {
    if (!minutes) return '0h 0m'
    const hours = Math.floor(Math.abs(minutes) / 60)
    const mins = Math.abs(minutes) % 60
    const sign = minutes < 0 ? '-' : ''
    return `${sign}${hours}h ${mins}m`
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {user?.nombre}!
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Panel de administración del sistema' : 'Resumen de tu actividad laboral'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Estado de jornada actual */}
      {stats.jornadaActual && (
        <Link to="/fichar" className="card card-hover !py-2 !px-6 h-auto block">
          <div className="card-content !py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${stats.jornadaActual.hora_fin ? 'bg-gray-100' : 'bg-green-100'}`}>
                  {stats.jornadaActual.hora_fin ? (
                    <StopIcon className="h-6 w-6 text-gray-600" />
                  ) : (
                    <PlayIcon className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stats.jornadaActual.hora_fin ? 'Jornada finalizada' : 'Jornada en curso'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Inicio: {(() => {
                      const h = stats.jornadaActual.hora_inicio;
                      if (!h) return '--:--';
                      const d = new Date(h);
                      return isNaN(d) ? '--:--' : d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    })()}</span>
                    {stats.jornadaActual.hora_fin && (
                      <span>Fin: {formatDateTime(stats.jornadaActual.hora_fin)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(stats.resumenSemanal.horas_trabajadas_minutos || stats.resumenSemanal.total_minutos || 0)}
                </p>
                <p className="text-sm text-gray-500">Trabajadas hoy</p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/jornadas" className="card card-hover block">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas esta semana</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(stats.resumenSemanal.horas_trabajadas_minutos || stats.resumenSemanal.total_minutos || 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/incidencias" className="card card-hover block">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? 'Incidencias pendientes' : 'Mis incidencias'}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.incidenciasPendientes}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/solicitudes" className="card card-hover block">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? 'Solicitudes pendientes' : 'Mis solicitudes'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.solicitudesPendientes}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <EnvelopeIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Link>

        {isAdmin ? (
          <Link to="/reportes" className="card card-hover block">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reportes</p>
                  <p className="text-2xl font-bold text-green-600">Ver</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="card card-hover">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Días trabajados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.resumenSemanal.dias_trabajados || 0}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CalendarDaysIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accesos rápidos */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="card-title">Accesos Rápidos</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                to="/fichar"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <ClockIcon className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Fichar</span>
              </Link>

              <Link
                to="/jornadas"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <CalendarDaysIcon className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Jornadas</span>
              </Link>

              <Link
                to="/incidencias"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Incidencias</span>
              </Link>

              <Link
                to="/solicitudes"
                className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <EnvelopeIcon className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Solicitudes</span>
              </Link>

              {isAdmin && [
                <Link
                  key="usuarios-link"
                  to="/usuarios"
                  className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                >
                  <UserGroupIcon className="h-8 w-8 text-indigo-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Usuarios</span>
                </Link>,

                <Link
                  key="reportes-link"
                  to="/reportes"
                  className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all"
                >
                  <ChartBarIcon className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Reportes</span>
                </Link>
              ]}
            </div>
          </div>
        </div>

        {/* Próximos festivos */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Próximos Festivos</h3>
          </div>
          <div className="card-content">
            {stats.proximosFestivos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay festivos próximos
              </p>
            ) : (
              <div className="space-y-3">
                {stats.proximosFestivos.map((festivo, index) => (
                  <div key={festivo.id || `festivo-${index}`} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {festivo.descripcion}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(festivo.fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
