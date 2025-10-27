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
  StopIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon as ClockSolid,
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  XCircleIcon,
  CheckCircleIcon as CheckCircleSolid,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import {
  ClockIcon as ClockSolidIcon,
  CalendarDaysIcon as CalendarDaysSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
  EnvelopeIcon as EnvelopeSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  PlayIcon as PlaySolidIcon,
  PauseIcon as PauseSolidIcon,
  StopIcon as StopSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  ArrowTrendingUpIcon as ArrowTrendingUpSolidIcon,
  ArrowTrendingDownIcon as ArrowTrendingDownSolidIcon,
  BellIcon as BellSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  EyeIcon as EyeSolidIcon,
  PlusIcon as PlusSolidIcon,
  CalendarIcon as CalendarSolidIcon,
  ClockIcon as ClockSolidIcon2,
  UserIcon as UserSolidIcon,
  BuildingOfficeIcon as BuildingOfficeSolidIcon,
  ShieldCheckIcon as ShieldCheckSolidIcon,
  ArrowRightIcon as ArrowRightSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon2,
  ExclamationCircleIcon as ExclamationCircleSolidIcon
} from '@heroicons/react/24/solid'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    jornadaActual: null,
    proximosFestivos: [],
    resumenMensual: null,
    estadisticasGenerales: null,
    solicitudesRecientes: [],
    incidenciasRecientes: [],
    comunicados: []
  })
  const [loading, setLoading] = useState({
    jornada: true,
    festivos: true,
    mensual: true,
    generales: true,
    solicitudes: true,
    incidencias: true
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Cargar jornada actual
      try {
        const { data: jornadaData } = await api.get('/fichaje/estado')
        setStats(prev => ({ ...prev, jornadaActual: jornadaData.jornada }))
      } catch (error) {
        console.error('Error al cargar jornada actual:', error)
      } finally {
        setLoading(prev => ({ ...prev, jornada: false }))
      }

      // Cargar próximos festivos
      try {
        const { data: festivosData } = await api.get('/festivos/proximos?limit=3')
        setStats(prev => ({ ...prev, proximosFestivos: festivosData.data || festivosData }))
      } catch (error) {
        console.error('Error al cargar festivos:', error)
      } finally {
        setLoading(prev => ({ ...prev, festivos: false }))
      }

      // Cargar resumen mensual
      try {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const { data: mensualData } = await api.get(`/jornadas/resumen-mensual?year=${year}&month=${month}`)
        setStats(prev => ({ ...prev, resumenMensual: mensualData }))
      } catch (error) {
        console.error('Error al cargar resumen mensual:', error)
      } finally {
        setLoading(prev => ({ ...prev, mensual: false }))
      }

      // Cargar estadísticas generales (solo para admin)
      if (isAdmin) {
        try {
          const { data: generalesData } = await api.get('/dashboard/estadisticas-generales')
          setStats(prev => ({ ...prev, estadisticasGenerales: generalesData }))
        } catch (error) {
          console.error('Error al cargar estadísticas generales:', error)
        } finally {
          setLoading(prev => ({ ...prev, generales: false }))
        }
      } else {
        setLoading(prev => ({ ...prev, generales: false }))
      }

      // Cargar solicitudes recientes
      try {
        const { data: solicitudesData } = await api.get('/solicitudes?limit=3')
        setStats(prev => ({ ...prev, solicitudesRecientes: solicitudesData.data || solicitudesData }))
      } catch (error) {
        console.error('Error al cargar solicitudes:', error)
      } finally {
        setLoading(prev => ({ ...prev, solicitudes: false }))
      }

      // Cargar incidencias recientes
      try {
        const { data: incidenciasData } = await api.get('/incidencias?limit=3')
        setStats(prev => ({ ...prev, incidenciasRecientes: incidenciasData.data || incidenciasData }))
      } catch (error) {
        console.error('Error al cargar incidencias:', error)
      } finally {
        setLoading(prev => ({ ...prev, incidencias: false }))
      }
    } catch (error) {
      console.error('Error general al cargar datos del dashboard:', error)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m'
    const hours = Math.floor(Math.abs(minutes) / 60)
    const mins = Math.abs(minutes) % 60
    return `${hours}h ${mins}m`
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const getJornadaStatus = (jornada) => {
    if (!jornada) return { label: 'No iniciada', class: 'info', icon: ClockIcon }
    
    const hasFin = jornada.hora_fin || jornada.fin || jornada.hora_salida || jornada.salida
    if (hasFin) {
      return { label: 'Finalizada', class: 'success', icon: CheckCircleIcon }
    }
    return { label: 'En curso', class: 'warning', icon: PlayIcon }
  }

  const jornadaStatus = getJornadaStatus(stats.jornadaActual)

  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Header para Admin */}
        <div className="card">
          <div className="card-content py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getGreeting()}, {user?.nombre}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Panel de administración • {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Sistema activo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado general del día */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
              Estado General del Día
            </h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-white rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Empleados trabajando</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading.generales ? '-' : (stats.estadisticasGenerales?.empleados_trabajando || '0')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-white rounded-lg p-4 border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 p-2 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Incidencias pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading.generales ? '-' : (stats.estadisticasGenerales?.incidencias_pendientes || '0')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-white rounded-lg p-4 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <EnvelopeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-600">Solicitudes pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading.generales ? '-' : (stats.estadisticasGenerales?.solicitudes_pendientes || '0')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas y métricas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-green-600" />
                Horas Trabajadas
              </h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hoy</span>
                  <span className="text-lg font-bold text-gray-900">
                    {loading.generales ? '-' : (stats.estadisticasGenerales?.horas_hoy || '0h')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Esta semana</span>
                  <span className="text-lg font-bold text-gray-900">
                    {loading.generales ? '-' : (stats.estadisticasGenerales?.horas_semana || '0h')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Este mes</span>
                  <span className="text-lg font-bold text-gray-900">
                    {loading.generales ? '-' : (stats.estadisticasGenerales?.horas_mes || '0h')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                Alertas del Sistema
              </h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      {stats.estadisticasGenerales?.empleados_sin_salida || '0'} empleados sin fichar salida
                    </span>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <BellIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {stats.estadisticasGenerales?.solicitudes_pendientes || '0'} solicitudes pendientes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gestión rápida */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ArrowRightIcon className="h-5 w-5 text-blue-600" />
              Gestión Rápida
            </h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/usuarios" className="group">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all group-hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-500 p-3 rounded-lg mb-3">
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">Empleados</p>
                    <p className="text-sm text-gray-600">Gestionar</p>
                  </div>
                </div>
              </Link>

              <Link to="/jornadas" className="group">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-md transition-all group-hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-500 p-3 rounded-lg mb-3">
                      <ClockIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">Fichajes</p>
                    <p className="text-sm text-gray-600">Globales</p>
                  </div>
                </div>
              </Link>

              <Link to="/reportes" className="group">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 hover:shadow-md transition-all group-hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-purple-500 p-3 rounded-lg mb-3">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">Reportes</p>
                    <p className="text-sm text-gray-600">Mensuales</p>
                  </div>
                </div>
              </Link>

              <Link to="/auditoria" className="group">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-all group-hover:scale-105">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-indigo-500 p-3 rounded-lg mb-3">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900">Auditoría</p>
                    <p className="text-sm text-gray-600">Registros</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard para empleado
  return (
    <div className="space-y-6">
      {/* Header para Empleado */}
      <div className="card">
        <div className="card-content py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user?.nombre}!
              </h1>
              <p className="text-gray-600 mt-1">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Sistema activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado actual de jornada */}
      <div className="card">
        <div className="card-content py-3">
          {loading.jornada ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : stats.jornadaActual ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <PlayIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">En jornada desde las</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.jornadaActual.hora_entrada ? 
                      new Date(stats.jornadaActual.hora_entrada).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">Duración actual</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatDuration(stats.jornadaActual.duracion_minutos || 0)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">No hay jornada activa</p>
                  <p className="text-lg font-semibold text-gray-900">Inicia tu jornada laboral</p>
                </div>
              </div>
              <Link to="/fichar" className="btn btn-primary">
                <PlayIcon className="h-5 w-5 mr-2" />
                Fichar Entrada
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Resumen del día/semana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas trabajadas hoy</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading.mensual ? '-' : (stats.resumenMensual?.horas_hoy || '0h')}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Esta semana</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading.mensual ? '-' : (stats.resumenMensual?.horas_semana || '0h')}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CalendarDaysIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio diario</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading.mensual ? '-' : (stats.resumenMensual?.promedio_diario || '0h')}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solicitudes y ausencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5 text-orange-600" />
              Mis Solicitudes Recientes
            </h3>
          </div>
          <div className="card-content">
            {loading.solicitudes ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              </div>
            ) : stats.solicitudesRecientes.length > 0 ? (
              <div className="space-y-3">
                {stats.solicitudesRecientes.map((solicitud, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 p-2 rounded-lg">
                        <EnvelopeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{solicitud.tipo}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(solicitud.fecha_inicio).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      solicitud.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                      solicitud.estado === 'rechazada' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {solicitud.estado}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-4 rounded-2xl mb-4 shadow-sm inline-block">
                  <EnvelopeIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay solicitudes</h4>
                <p className="text-gray-600 mb-4">Crea tu primera solicitud</p>
                <Link to="/solicitudes" className="btn btn-primary btn-sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nueva Solicitud
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              Próximos Festivos
            </h3>
          </div>
          <div className="card-content">
            {loading.festivos ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : stats.proximosFestivos.length > 0 ? (
              <div className="space-y-3">
                {stats.proximosFestivos.map((festivo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{festivo.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(festivo.fecha).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {Math.ceil((new Date(festivo.fecha) - new Date()) / (1000 * 60 * 60 * 24))} días
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-4 rounded-2xl mb-4 shadow-sm inline-block">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay festivos próximos</h4>
                <p className="text-gray-600">No se encontraron festivos en los próximos días</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <ArrowRightIcon className="h-5 w-5 text-blue-600" />
            Accesos Rápidos
          </h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/fichar" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-md transition-all group-hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-500 p-3 rounded-lg mb-3">
                    <PlayIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">Fichar</p>
                  <p className="text-sm text-gray-600">Control horario</p>
                </div>
              </div>
            </Link>

            <Link to="/jornadas" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all group-hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-500 p-3 rounded-lg mb-3">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">Mis Fichajes</p>
                  <p className="text-sm text-gray-600">Historial</p>
                </div>
              </div>
            </Link>

            <Link to="/solicitudes" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 hover:shadow-md transition-all group-hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-orange-500 p-3 rounded-lg mb-3">
                    <EnvelopeIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">Mis Solicitudes</p>
                  <p className="text-sm text-gray-600">Vacaciones</p>
                </div>
              </div>
            </Link>

            <Link to="/incidencias" className="group">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-all group-hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-yellow-500 p-3 rounded-lg mb-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">Mis Incidencias</p>
                  <p className="text-sm text-gray-600">Gestionar</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}