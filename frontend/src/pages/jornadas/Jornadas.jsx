import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import DatePicker from '../../components/DatePicker'
import Card from '../../components/Card'
import JornadaResumenModal from '../../components/JornadaResumenModal'
import './css/Jornadas.css'
import {
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline'

export default function Jornadas() {
  const { user } = useAuth()
  const [jornadas, setJornadas] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedJornada, setSelectedJornada] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [dateRange, setDateRange] = useState({
    desde: new Date(),
    hasta: new Date()
  })

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  const loadJornadas = useCallback(async () => {
    try {
      setLoading(true)
      // Convertir fechas a formato ISO para el backend
      const desdeISO = dateRange.desde instanceof Date 
        ? dateRange.desde.toISOString().split('T')[0]
        : dateRange.desde
      const hastaISO = dateRange.hasta instanceof Date
        ? dateRange.hasta.toISOString().split('T')[0]
        : dateRange.hasta
        
      const params = new URLSearchParams({
        desde: desdeISO,
        hasta: hastaISO
      })
      const { data } = await api.get(`/jornadas?${params}`)
      console.log('📊 Datos de jornadas recibidos:', data.data || data)
      setJornadas(data.data || data)
    } catch (error) {
      console.error('Error al cargar jornadas:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  const loadResumen = useCallback(async () => {
    try {
      // Convertir fechas a formato ISO para el backend
      const desdeISO = dateRange.desde instanceof Date 
        ? dateRange.desde.toISOString().split('T')[0]
        : dateRange.desde
      const hastaISO = dateRange.hasta instanceof Date
        ? dateRange.hasta.toISOString().split('T')[0]
        : dateRange.hasta
        
      const params = new URLSearchParams({
        desde: desdeISO,
        hasta: hastaISO
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
    
    // Actualizar cada minuto para mostrar progreso en tiempo real
    const interval = setInterval(() => {
      loadResumen() // Solo recargar el resumen, no toda la lista
    }, 60000) // cada 60 segundos
    
    return () => clearInterval(interval)
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
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '-'
    }
  }, [])

  const formatTimeOnly = useCallback((dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '-'
    }
  }, [])

  const getJornadaStatus = useCallback((jornada) => {
    // Verificar múltiples campos posibles para hora_fin
    const hasFin = jornada.hora_fin || jornada.fin || jornada.hora_salida || jornada.salida
    
    if (hasFin) {
      return { label: 'Finalizada', class: 'success' }
    }
    return { label: 'En curso', class: 'warning' }
  }, [])

  const handleOpenResumen = useCallback((jornada) => {
    setSelectedJornada(jornada)
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setSelectedJornada(null)
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
      <Card className="card-interactive">
        <div className="flex flex-col sm:flex-row gap-4" style={{ overflow: 'visible', }}>
          <div className="flex-1" style={{ overflow: 'visible' }}>
            <DatePicker
              label="Desde"
              selected={dateRange.desde}
              onChange={(date) => setDateRange(prev => ({...prev, desde: date}))}
              maxDate={dateRange.hasta}
              placeholder="Selecciona fecha inicial"
            />
          </div>
          <div className="flex-1" style={{ overflow: 'visible' }}>
            <DatePicker
              label="Hasta"
              selected={dateRange.hasta}
              onChange={(date) => setDateRange(prev => ({...prev, hasta: date}))}
              minDate={dateRange.desde}
              placeholder="Selecciona fecha final"
            />
          </div>
        </div>
      </Card>

      {/* Resumen de jornadas */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
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
          </Card>

          <Card>
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
          </Card>

          <Card>
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
          </Card>
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
            {jornadas.map((jornada, index) => {
              const status = getJornadaStatus(jornada)
              const inicio = jornada.hora_inicio || jornada.inicio || jornada.hora_entrada || jornada.entrada
              const fin = jornada.hora_fin || jornada.fin || jornada.hora_salida || jornada.salida
              const pausas = jornada.pausa_total_minutos || jornada.pausas_minutos || jornada.pausas || 0
              // Calcular duración: total_horas (decimal) * 60 para convertir a minutos
              const duracion = jornada.total_horas 
                ? Math.round(jornada.total_horas * 60) 
                : (jornada.duracion_minutos || jornada.duracion || jornada.total_minutos || 0)
              
              return (
                <div key={jornada.id || `jornada-${index}`} className="jornada-item">
                  {/* Columna de fecha e icono */}
                  <div className="jornada-date-col">
                    <div className="jornada-icon">
                      <CalendarDaysIcon className="h-5 w-5" />
                    </div>
                    <div className="jornada-date">
                      <div className="jornada-day">
                        {new Date(jornada.fecha).toLocaleDateString('es-ES', {
                          weekday: 'short'
                        })}
                      </div>
                      <div className="jornada-date-number">
                        {new Date(jornada.fecha).getDate()}
                      </div>
                      <div className="jornada-month">
                        {new Date(jornada.fecha).toLocaleDateString('es-ES', {
                          month: 'short'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Columna de horarios */}
                  <div className="jornada-times-col">
                    <div className="jornada-time-item">
                      <PlayIcon className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="jornada-time-label">Inicio</div>
                        <div className="jornada-time-value">{formatTimeOnly(inicio)}</div>
                      </div>
                    </div>
                    <div className="jornada-time-divider">→</div>
                    <div className="jornada-time-item">
                      <StopIcon className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="jornada-time-label">Fin</div>
                        <div className="jornada-time-value">{formatTimeOnly(fin)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Columna de pausas y duración */}
                  <div className="jornada-stats-col">
                    {pausas > 0 && (
                      <div className="jornada-stat">
                        <PauseIcon className="h-4 w-4 text-yellow-600" />
                        <div>
                          <div className="jornada-stat-label">Pausas</div>
                          <div className="jornada-stat-value">{formatTime(pausas)}</div>
                        </div>
                      </div>
                    )}
                    <div className="jornada-stat">
                      <ClockIcon className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="jornada-stat-label">Duración</div>
                        <div className="jornada-stat-value">{formatTime(duracion)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Columna de estado y acciones */}
                  <div className="jornada-actions-col">
                    <span className={`jornada-badge jornada-badge-${status.class}`}>
                      {status.label}
                    </span>
                    <button
                      onClick={() => handleOpenResumen(jornada)}
                      className="btn-resumen"
                      title="Ver resumen detallado"
                    >
                      <DocumentChartBarIcon className="h-4 w-4" />
                      <span>Resumen</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de resumen */}
      {showModal && selectedJornada && (
        <JornadaResumenModal
          jornada={selectedJornada}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
