import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import {
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PlayIcon,
  StopIcon,
  PauseIcon
} from '@heroicons/react/24/outline'

export default function Jornadas() {
  const { user } = useAuth()
  const [jornadas, setJornadas] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  })

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  const loadJornadas = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        desde: dateRange.desde,
        hasta: dateRange.hasta
      })
      const { data } = await api.get(`/jornadas?${params}`)
      setJornadas(data.data || data)
    } catch (error) {
      console.error('Error al cargar jornadas:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange.desde, dateRange.hasta])

  const loadResumen = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        desde: dateRange.desde,
        hasta: dateRange.hasta
      })
      const { data } = await api.get(`/jornadas/resumen?${params}`)
      setResumen(data)
    } catch (error) {
      console.error('Error al cargar resumen:', error)
    }
  }, [dateRange.desde, dateRange.hasta])

  useEffect(() => {
    loadJornadas()
    loadResumen()
  }, [loadJornadas, loadResumen])

  const formatTime = useCallback((minutes) => {
    if (!minutes) return '0h 0m'
    const hours = Math.floor(Math.abs(minutes) / 60)
    const mins = Math.abs(minutes) % 60
    const sign = minutes < 0 ? '-' : ''
    return `${sign}${hours}h ${mins}m`
  }, [])

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gestión de Jornadas' : 'Mis Jornadas'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Consulta y gestiona las jornadas laborales' : 'Consulta el historial de tus jornadas laborales'}
          </p>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 form-input-container">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={dateRange.desde}
                onChange={(e) => setDateRange(prev => ({...prev, desde: e.target.value}))}
                className="form-input"
              />
            </div>
            <div className="flex-1 form-input-container">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={dateRange.hasta}
                onChange={(e) => setDateRange(prev => ({...prev, hasta: e.target.value}))}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de jornadas */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card card-hover">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas Trabajadas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatTime(resumen.horas_trabajadas_minutos || resumen.total_minutos)}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas Extra</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatTime(resumen.horas_extra_minutos || 0)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Días Trabajados</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {resumen.dias_trabajados || jornadas.length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de jornadas con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          Historial de Jornadas
        </div>

        {loading ? (
          <div className="list-empty">
            <div className="list-empty-icon">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="list-empty-title">Cargando jornadas...</div>
            <div className="list-empty-message">Obteniendo datos del servidor</div>
          </div>
        ) : jornadas.length === 0 ? (
          <div className="list-empty">
            <CalendarDaysIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin jornadas registradas</div>
            <div className="list-empty-message">No se encontraron jornadas en el período seleccionado</div>
          </div>
        ) : (
          <div className="list-scrollable">
            {jornadas.map((jornada, index) => (
              <div key={jornada.id || `jornada-${index}`} className="list-item">
                <div className="list-item-icon">
                  <CalendarDaysIcon className="h-5 w-5" />
                </div>

                <div className="list-item-content">
                  <div className="list-item-title">
                    {new Date(jornada.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="list-item-subtitle">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <PlayIcon className="h-4 w-4 text-green-600" />
                        Inicio: {jornada.hora_inicio ? formatDateTime(jornada.hora_inicio) : '-'}
                      </span>
                      <span className="flex items-center gap-1">
                        <StopIcon className="h-4 w-4 text-red-600" />
                        Fin: {jornada.hora_fin ? formatDateTime(jornada.hora_fin) : '-'}
                      </span>
                      {jornada.pausa_total_minutos > 0 && (
                        <span className="flex items-center gap-1">
                          <PauseIcon className="h-4 w-4 text-yellow-600" />
                          Pausas: {formatTime(jornada.pausa_total_minutos)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="list-item-meta">
                    Duración: {formatTime(jornada.duracion_minutos)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`list-item-badge ${jornada.hora_fin ? 'success' : 'warning'}`}>
                    {jornada.hora_fin ? 'Finalizada' : 'En curso'}
                  </span>

                  <div className="list-item-actions">
                    <button className="btn btn-xs btn-ghost">
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
