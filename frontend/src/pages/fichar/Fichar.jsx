import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import LiveClock from '../../components/LiveClock'
import Modal from '../../components/Modal'
import ModalFooter from '../../components/ModalFooter'
import {
  ClockIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function Fichar() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [jornadaActual, setJornadaActual] = useState(null)
  const [pausaActiva, setPausaActiva] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingPausa, setLoadingPausa] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showModalPausa, setShowModalPausa] = useState(false)
  const [tiposPausa, setTiposPausa] = useState([])
  const [selectedTipoPausa, setSelectedTipoPausa] = useState('')

  // Actualizar reloj cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Cargar estado inicial
  useEffect(() => {
    loadJornadaActual()
    loadTiposPausa()
  }, [])

  const loadJornadaActual = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      const { data } = await api.get(`/jornadas?desde=${hoy}&hasta=${hoy}`)
      const jornadas = data.data || data || []
      const jornadaHoy = jornadas[0] || null
      setJornadaActual(jornadaHoy)

      // Verificar si hay pausa activa (lógica simplificada)
      setPausaActiva(false) // Se puede mejorar con endpoint específico
    } catch (error) {
      console.error('Error al cargar jornada actual:', error)
    }
  }

  const loadTiposPausa = async () => {
    try {
      const { data } = await api.get('/tipos-pausa/disponibles')
      setTiposPausa(data.data || [])
    } catch (error) {
      console.error('Error al cargar tipos de pausa:', error)
    }
  }

  const handleFicharJornada = async () => {
    try {
      setLoading(true)
      const { data } = await api.post('/fichaje/jornada')

      if (data.status === 'iniciada') {
        setMessage({
          type: 'success',
          text: `¡Jornada iniciada! Hora de entrada: ${formatTime(new Date())}`
        })
      } else {
        setMessage({
          type: 'success',
          text: `¡Jornada finalizada! Hora de salida: ${formatTime(new Date())}`
        })
      }

      // Recargar estado
      setTimeout(() => {
        loadJornadaActual()
        setMessage({ type: '', text: '' })
      }, 3000)

    } catch (error) {
      console.error('Error al fichar jornada:', error)
      setMessage({
        type: 'error',
        text: 'Error al registrar el fichaje. Inténtalo de nuevo.'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Limpiar funciones no utilizadas actualmente
  // const handleFicharPausa = async () => {
  //   // Esta función se mantendrá comentada hasta su implementación completa
  // }

  const handleOpenModalPausa = () => {
    setShowModalPausa(true)
  }

  const handleCloseModalPausa = () => {
    setShowModalPausa(false)
    setSelectedTipoPausa('')
  }

  const handleSelectTipoPausa = (tipo) => {
    setSelectedTipoPausa(tipo)
  }

  const handleConfirmPausa = async () => {
    if (!selectedTipoPausa) return

    try {
      setLoadingPausa(true)

      if (pausaActiva) {
        // Finalizar pausa activa
        const { data } = await api.post('/fichaje/pausa')
        setPausaActiva(false)
        setMessage({
          type: 'success',
          text: `¡Pausa finalizada! Duración: ${data.duracion_minutos} minutos`
        })
      } else {
        // Iniciar nueva pausa con tipo seleccionado
        await api.post('/fichaje/pausa', {
          id_tipo_pausa: selectedTipoPausa.id
        })
        setPausaActiva(true)
        setMessage({
          type: 'success',
          text: `¡Pausa "${selectedTipoPausa.nombre}" iniciada! Hora: ${formatTime(new Date())}`
        })
      }

      setTimeout(() => {
        setMessage({ type: '', text: '' })
        loadJornadaActual()
        loadTiposPausa() // Recargar para actualizar límites de uso
        handleCloseModalPausa()
      }, 3000)

    } catch (error) {
      console.error('Error al registrar pausa:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al registrar la pausa. Inténtalo de nuevo.'
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setLoadingPausa(false)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m'
    const hours = Math.floor(Math.abs(minutes) / 60)
    const mins = Math.abs(minutes) % 60
    return `${hours}h ${mins}m`
  }

  const getCurrentDate = () => {
    return currentTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const jornadaEnCurso = jornadaActual && !jornadaActual.hora_fin
  const jornadaFinalizada = jornadaActual && jornadaActual.hora_fin

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Control de Fichaje
        </h1>
        <p className="text-gray-600">
          {getCurrentDate()}
        </p>
      </div>

      {/* Mensaje de estado */}
      {message.text && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primera fila: Reloj (ancho) + Acciones (estrecho) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reloj principal minimalista - 2 columnas */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="card-content py-2">
              <LiveClock />
            </div>
          </div>
        </div>

        {/* Acciones - 1 columna */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <div className="card-header py-2">
              <h3 className="card-title">Acciones</h3>
            </div>
            <div className="card-content flex flex-col justify-center py-2">
              <div className="space-y-4">
                {/* Botón de jornada */}
                <button
                  onClick={handleFicharJornada}
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-white transition-all ${
                    !jornadaActual || jornadaFinalizada
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      {!jornadaActual || jornadaFinalizada ? (
                        <>
                          <PlayIcon className="h-5 w-5" />
                          Iniciar Jornada
                        </>
                      ) : (
                        <>
                          <StopIcon className="h-5 w-5" />
                          Finalizar Jornada
                        </>
                      )}
                    </>
                  )}
                </button>

                {/* Botón de pausa - solo si hay jornada en curso */}
                {jornadaEnCurso && (
                  <button
                    onClick={handleOpenModalPausa}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all ${
                      pausaActiva
                        ? 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <PauseIcon className="h-4 w-4" />
                    {pausaActiva ? 'Finalizar Pausa' : 'Iniciar Pausa'}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila: Estado de la jornada + Tu información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de la jornada */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5" />
              Estado de la Jornada
            </h3>
          </div>
          <div className="card-content">
            {!jornadaActual ? (
              <div className="text-center py-6">
                <div className="bg-gray-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-gray-500" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  Jornada no iniciada
                </h4>
                <p className="text-sm text-gray-600">
                  Pulsa el botón "Iniciar Jornada" para comenzar tu día laboral
                </p>
              </div>
            ) : jornadaEnCurso ? (
              <div className="text-center py-6">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <PlayIcon className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-base font-semibold text-green-900 mb-2">
                  Jornada en curso
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Inicio:</strong> {new Date(jornadaActual.hora_inicio).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p>
                    <strong>Tiempo trabajado:</strong> {formatDuration(jornadaActual.duracion_minutos)}
                  </p>
                  {pausaActiva && (
                    <p className="text-yellow-600">
                      <strong>Estado:</strong> En pausa
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <StopIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-base font-semibold text-blue-900 mb-2">
                  Jornada finalizada
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Inicio:</strong> {new Date(jornadaActual.hora_inicio).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p>
                    <strong>Fin:</strong> {new Date(jornadaActual.hora_fin).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p>
                    <strong>Total trabajado:</strong> {formatDuration(jornadaActual.duracion_minutos)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tu información */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Tu Información
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Usuario</p>
                <p className="text-sm font-bold text-gray-900">
                  {user?.nombre} {user?.apellidos}
                </p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Departamento</p>
                <p className="text-sm font-bold text-gray-900">
                  {user?.departamento?.nombre || 'Sin asignar'}
                </p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Rol</p>
                <p className="text-sm font-bold text-gray-900">
                  {user?.role?.nombre || 'Empleado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de selección de pausa con scroll solo en la lista */}
      <Modal
        isOpen={showModalPausa}
        onClose={handleCloseModalPausa}
        title="Seleccionar Tipo de Pausa"
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        {/* Descripción fija */}
        <p className="text-sm text-gray-600 mb-4">
          Elige el tipo de pausa que deseas registrar
        </p>

        {/* Lista con scroll */}
        <div className="max-h-64 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          <div className="space-y-3">
            {tiposPausa.map((tipo) => (
              <div
                key={tipo.id}
                onClick={() => handleSelectTipoPausa(tipo)}
                className={`w-full cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  selectedTipoPausa === tipo
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {tipo.nombre}
                      </h4>
                      {selectedTipoPausa === tipo && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    {tipo.descripcion && (
                      <p className="text-sm text-gray-600 mb-3">
                        {tipo.descripcion}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        tipo.es_computable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tipo.es_computable ? '✓ Computable' : '✗ No computable'}
                      </span>
                      {tipo.minutos_computable_maximo && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                          Máx: {tipo.minutos_computable_maximo}min
                        </span>
                      )}
                      {tipo.max_usos_dia && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                          {tipo.max_usos_dia}/día
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {tiposPausa.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PauseIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay tipos de pausa disponibles
                </h4>
                <p className="text-gray-600">
                  Contacta con el administrador para configurar los tipos de pausa.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botones fijos usando ModalFooter */}
        <ModalFooter align="right" variant="default">
          <button
            onClick={handleCloseModalPausa}
            className="btn btn-secondary"
            disabled={loadingPausa}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmPausa}
            disabled={loadingPausa || !selectedTipoPausa}
            className={`btn ${loadingPausa || !selectedTipoPausa ? 'btn-primary-disabled' : 'btn-primary'}`}
          >
            {loadingPausa ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                Procesando...
              </>
            ) : (
              'Confirmar Pausa'
            )}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
