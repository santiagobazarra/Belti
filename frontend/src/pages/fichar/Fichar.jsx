  import { useState, useEffect, useCallback } from 'react'
  import { useAuth } from '../../context/AuthContext'
  import api from '../../lib/api'
  import LiveClock from '../../components/LiveClock'
  import Modal from '../../components/Modal'
  import Toast from '../../components/Toast'
  import { Link } from 'react-router-dom'
  import ModalFooter from '../../components/ModalFooter'
  import {
    ClockIcon,
    PlayIcon,
    StopIcon,
    PauseIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    XMarkIcon,
    LockClosedIcon
  } from '@heroicons/react/24/outline'

  export default function Fichar() {
    const { user } = useAuth()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [jornadaActual, setJornadaActual] = useState(null)
  // El estado de pausa activa se toma siempre del backend (estadoFichaje.en_pausa)
    const [estadoFichaje, setEstadoFichaje] = useState({
      puede_iniciar_jornada: true,
      jornada_activa: false,
      ya_fichado: false,
      en_pausa: false
    })
    const [loading, setLoading] = useState(false)
    const [loadingPausa, setLoadingPausa] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true) // Loading inicial
    const [message, setMessage] = useState({ type: '', text: '' })
    const [showModalPausa, setShowModalPausa] = useState(false)
    const [tiposPausa, setTiposPausa] = useState([])
    const [selectedTipoPausa, setSelectedTipoPausa] = useState('')
    const [horasResumen, setHorasResumen] = useState({
      trabajadas: 0,
      pausas: 0
    })

    // Función auxiliar para extraer mensajes de error del backend
    const extractErrorMessage = (error, defaultMessage) => {
      let msg = defaultMessage;
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.response?.data?.error) {
        msg = error.response.data.error;
      } else if (error.message) {
        msg = error.message;
      }
      // Si el mensaje es un objeto, lo convertimos a string legible
      if (typeof msg === 'object') {
        msg = JSON.stringify(msg);
      }
      return msg;
    }

    const loadJornadaActual = useCallback(async () => {
      try {
        const { data } = await api.get('/fichaje/estado')
        setJornadaActual(data.jornada)
  // No actualizar pausaActiva local, solo confiar en estadoFichaje.en_pausa
        const nuevoEstado = {
          puede_iniciar_jornada: data.puede_iniciar_jornada,
          jornada_activa: data.jornada_activa,
          en_pausa: data.en_pausa,
          ya_fichado: data.ya_fichado
        }
        
        setEstadoFichaje(nuevoEstado)

        // Calcular resumen de horas si hay jornada activa
        if (data.jornada && data.jornada_activa) {
          const trabajadas = data.jornada.duracion_minutos || 0
          // Calcular pausas de la jornada actual
          const pausas = data.jornada.pausas?.reduce((total, pausa) => {
            if (pausa.hora_fin) {
              const inicio = new Date(pausa.hora_inicio)
              const fin = new Date(pausa.hora_fin)
              return total + ((fin - inicio) / (1000 * 60)) // minutos
            }
            return total
          }, 0) || 0

          setHorasResumen({
            trabajadas: trabajadas,
            pausas: pausas
          })
        } else {
          setHorasResumen({ trabajadas: 0, pausas: 0 })
        }
      } catch (error) {
        console.error('Error al cargar estado actual:', error)
        
        // Solo mostrar error si no es un problema de autenticación
        if (error.response?.status !== 401) {
          const errorMessage = extractErrorMessage(error, 'Error al cargar el estado del fichaje.')
          
          setMessage({
            type: 'error',
            text: errorMessage
          })
          setTimeout(() => setMessage({ type: '', text: '' }), 5000)
        }
      }
    }, [])

    // Actualizar reloj cada segundo
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(interval)
    }, [])

    // Cargar estado inicial y auto-refresh
    useEffect(() => {
      const initialize = async () => {
        setInitialLoading(true)
        await Promise.all([
          loadJornadaActual(),
          loadTiposPausa()
        ])
        setInitialLoading(false)
      }
      
      initialize()

      // Auto-refresh cada 30 segundos para actualizar horas trabajadas
      const interval = setInterval(() => {
        loadJornadaActual()
      }, 30000) // 30 segundos

      return () => clearInterval(interval)
    }, [loadJornadaActual])

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

        // Actualizar estado INMEDIATAMENTE
        await loadJornadaActual()
        
        // Solo ocultar el mensaje después de 5 segundos
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 5000)

      } catch (error) {
        console.error('Error al fichar jornada:', error)
        
        const errorMessage = extractErrorMessage(error, 'Error al registrar el fichaje. Inténtalo de nuevo.')
        
        setMessage({
          type: 'error',
          text: errorMessage
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
      try {
        setLoadingPausa(true)

        if (estadoFichaje.en_pausa) {
          // Finalizar pausa activa
          const { data } = await api.post('/fichaje/pausa')
          setMessage({
            type: 'success',
            text: `¡Pausa finalizada! Duración: ${data.duracion_minutos} minutos`
          })
          handleCloseModalPausa()
        } else {
          if (!selectedTipoPausa) return
          // Iniciar nueva pausa con tipo seleccionado
          await api.post('/fichaje/pausa', {
            id_tipo_pausa: selectedTipoPausa.id
          })
          setMessage({
            type: 'success',
            text: `¡Pausa "${selectedTipoPausa.nombre}" iniciada! Hora: ${formatTime(new Date())}`
          })
          handleCloseModalPausa()
        }

        // Actualizar estado INMEDIATAMENTE
        await loadJornadaActual()
        await loadTiposPausa() // Recargar para actualizar límites de uso
        
        // Solo ocultar el mensaje después de 5 segundos
        setTimeout(() => {
          setMessage({ type: '', text: '' })
        }, 5000)

      } catch (error) {
        console.error('Error al registrar pausa:', error)
        
        const errorMessage = extractErrorMessage(error, 'Error al registrar la pausa. Inténtalo de nuevo.')
        
        setMessage({
          type: 'error',
          text: errorMessage
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
      const totalMinutes = Math.floor(Math.abs(minutes)) // Redondear hacia abajo para evitar decimales
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      return `${hours}h ${mins}m`
    }

    const formatDateSafely = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getCurrentDate = () => {
      return currentTime.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Usar el estado del backend en lugar de calcular localmente
    const jornadaEnCurso = estadoFichaje.jornada_activa
    const yaFichado = estadoFichaje.ya_fichado

    // Mostrar loading inicial mientras carga los datos
    if (initialLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando información...</p>
          </div>
        </div>
      )
    }

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

        {/* Toast Notification Component */}
        <Toast
          type={message.type}
          message={message.text}
          isVisible={!!message.text}
          onClose={() => setMessage({ type: '', text: '' })}
          duration={5000}
          position="bottom-right"
        />

        {/* Primera fila: Reloj (ancho) + Acciones (estrecho) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reloj principal minimalista - 2 columnas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card h-full">
              <div className="card-content py-2 h-full flex flex-col">
                <LiveClock />
                {/* Cards adicionales cuando hay jornada activa - debajo del LiveClock */}
                {jornadaEnCurso && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {/* Card de Horas Trabajadas */}
                    <div className="card card-hover">
                      <div className="card-header">
                        <h3 className="card-title flex items-center gap-2">
                          <ClockIcon className="h-5 w-5 text-green-600" />
                          Horas Trabajadas
                        </h3>
                      </div>
                      <div className="card-content">
                        <div className="text-center py-4">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {formatDuration(horasResumen.trabajadas)}
                          </div>
                          <p className="text-sm text-gray-500">Tiempo neto hoy</p>
                        </div>
                      </div>
                    </div>

                    {/* Card de Pausas */}
                    <div className="card card-hover">
                      <div className="card-header">
                        <h3 className="card-title flex items-center gap-2">
                          <PauseIcon className="h-5 w-5 text-yellow-600" />
                          Tiempo en Pausas
                        </h3>
                      </div>
                      <div className="card-content">
                        <div className="text-center py-4">
                          <div className="text-3xl font-bold text-yellow-600 mb-1">
                            {formatDuration(horasResumen.pausas)}
                          </div>
                          <p className="text-sm text-gray-500">Pausas acumuladas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones - 1 columna */}
          <div className="lg:col-span-1">
            <div className="card h-full flex flex-col">
              <div className="card-header py-2">
                <h3 className="card-title">Acciones</h3>
              </div>
              <div className="card-content py-2 flex-1 flex flex-col">
                {/* Botones principales - altura fija */}
                <div className="space-y-3 mb-4">
                  {/* Botón de jornada */}
                  <button
                    onClick={yaFichado ? null : handleFicharJornada}
                    disabled={loading || yaFichado}
                    style={yaFichado ? {
                      backgroundImage: 'repeating-linear-gradient(45deg, #f3f4f6 0px, #f3f4f6 10px, #e5e7eb 10px, #e5e7eb 20px)'
                    } : {}}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold transition-all relative overflow-hidden ${
                      yaFichado
                        ? 'text-gray-500 cursor-not-allowed border-2 border-gray-300'
                        : jornadaEnCurso
                        ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md'
                        : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm hover:shadow-md'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:shadow-none`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Procesando...</span>
                      </>
                    ) : yaFichado ? (
                      <>
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200">
                          <LockClosedIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <span>Jornada Completada</span>
                      </>
                    ) : jornadaEnCurso ? (
                      <>
                        <StopIcon className="h-5 w-5" />
                        <span>Finalizar Jornada</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-5 w-5" />
                        <span>Iniciar Jornada</span>
                      </>
                    )}
                  </button>

                  {/* Botón de pausa - solo si hay jornada en curso */}
                  {jornadaEnCurso && estadoFichaje.en_pausa === true && (
                    <button
                      onClick={handleConfirmPausa}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold bg-orange-400 hover:bg-orange-600 text-white focus:ring-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loadingPausa}
                    >
                      <PauseIcon className="h-4 w-4" />
                      Finalizar Pausa
                    </button>
                  )}
                  {jornadaEnCurso && !estadoFichaje.en_pausa && (
                    <button
                      onClick={handleOpenModalPausa}
                      className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loadingPausa}
                    >
                      <PauseIcon className="h-4 w-4" />
                      Iniciar Pausa
                    </button>
                  )}
                </div>

                {/* Información contextual - flex-grow para llenar el espacio restante */}
                <div className="flex-grow flex items-start">
                  {loading ? (
                    <div className="w-full bg-gradient-to-br from-blue-50/30 to-slate-50/50 rounded-xl p-3.5 border border-blue-100/50 shadow-sm">
                      <div className="flex items-center gap-2.5 text-xs text-slate-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-blue-500"></div>
                        <span className="font-medium">Procesando tu solicitud...</span>
                      </div>
                    </div>
                  ) : yaFichado ? (
                    <div className="w-full bg-gradient-to-br from-amber-50/40 to-orange-50/30 rounded-xl p-3.5 border border-amber-100/60 shadow-sm">
                      <div className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 text-xs text-amber-900/80 leading-relaxed">
                          <p>Ya has completado tu jornada de hoy. Si necesitas registrar una nueva, créala como <Link to="/incidencias" className="font-semibold text-amber-700 hover:text-amber-800 underline decoration-dotted underline-offset-2 transition-colors">incidencia</Link>.</p>
                        </div>
                      </div>
                    </div>
                  ) : jornadaEnCurso ? (
                    <div className="w-full bg-gradient-to-br from-slate-50/60 to-gray-50/40 rounded-xl p-4 border border-slate-200/60 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Guía Rápida</h4>
                      </div>
                      
                      <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 w-1 h-1 bg-blue-400/60 rounded-full mt-1.5"></div>
                          <p><span className="font-semibold text-slate-700">Iniciar Pausa:</span> Para descansos y pausas permitidas</p>
                        </div>
                        
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 w-1 h-1 bg-blue-400/60 rounded-full mt-1.5"></div>
                          <p><span className="font-semibold text-slate-700">Finalizar Jornada:</span> Cuando termines tu día laboral</p>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 w-1 h-1 bg-blue-400/60 rounded-full mt-1.5"></div>
                          <p>El tiempo se actualiza automáticamente cada 30 segundos</p>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-200/50">
                          <div className="flex items-start gap-2">
                            <span className="text-xs">💡</span>
                            <p className="text-xs text-slate-500 italic leading-relaxed">
                              Revisa tu historial completo en la pestaña "Jornadas"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-gradient-to-br from-green-50/30 to-emerald-50/20 rounded-xl p-3.5 border border-green-100/50 shadow-sm">
                      <div className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 text-xs text-green-900/80 leading-relaxed">
                          <p>Pulsa <span className="font-semibold text-green-700">"Iniciar Jornada"</span> cuando llegues para comenzar el registro de tu día laboral.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila: Estado de la jornada + Tu información */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Estado de la jornada */}
          <div className="card h-full">
            <div className="card-header bg-gradient-to-r from-gray-50 to-white">
              <h3 className="card-title flex items-center gap-2 text-gray-800">
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
                Estado de la Jornada
              </h3>
            </div>
            <div className="card-content">
              {!jornadaActual ? (
                <div className="py-6 px-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-50 p-4 rounded-2xl mb-4 shadow-sm">
                      <ClockIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Jornada no iniciada
                    </h4>
                    <p className="text-sm text-gray-600 max-w-sm">
                      Pulsa <span className="font-semibold text-gray-900">"Iniciar Jornada"</span> para comenzar tu día laboral
                    </p>
                  </div>
                </div>
              ) : jornadaEnCurso ? (
                <div className="py-4">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-xl shadow-sm flex-shrink-0">
                      <PlayIcon className="h-7 w-7 text-green-600" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="text-lg font-bold text-green-900 mb-1 flex items-center gap-2">
                        Jornada en curso
                        <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                      </h4>
                      <p className="text-sm text-gray-600">Tu jornada está activa</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3.5 border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wide">Hora de Inicio</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatDateSafely(jornadaActual.hora_entrada)}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-3.5 border border-green-100">
                      <p className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">Tiempo Trabajado</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatDuration(jornadaActual.duracion_minutos || (jornadaActual.total_horas ? parseFloat(jornadaActual.total_horas) * 60 : 0))}
                      </p>
                    </div>
                    
                    {estadoFichaje.en_pausa && (
                      <div className="sm:col-span-2 bg-gradient-to-br from-yellow-50 to-white rounded-lg p-3.5 border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <PauseIcon className="h-5 w-5 text-yellow-600" />
                          <p className="text-sm font-semibold text-yellow-900">
                            En pausa actualmente
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-xl shadow-sm flex-shrink-0">
                      <CheckCircleIcon className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="text-lg font-bold text-blue-900 mb-1">
                        Jornada finalizada
                      </h4>
                      <p className="text-sm text-gray-600">Has completado tu jornada de hoy</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">Inicio</p>
                      <p className="text-base font-bold text-gray-900">
                        {formatDateSafely(jornadaActual.hora_entrada)}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-white rounded-lg p-3 border border-red-100">
                      <p className="text-xs font-medium text-red-600 mb-1 uppercase tracking-wide">Fin</p>
                      <p className="text-base font-bold text-gray-900">
                        {formatDateSafely(jornadaActual.hora_salida)}
                      </p>
                    </div>
                    
                    <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-medium text-blue-600 mb-1 uppercase tracking-wide">Total Trabajado</p>
                      <p className="text-base font-bold text-gray-900">
                        {formatDuration(jornadaActual.duracion_minutos || (jornadaActual.total_horas ? parseFloat(jornadaActual.total_horas) * 60 : 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tu información */}
          <div className="card h-full">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2 text-gray-800">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                Tu Información
              </h3>
            </div>
            <div className="card-content">
              <div className="space-y-3 py-2">
                {/* Usuario */}
                <div className="bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-base font-bold">
                        {user?.nombre?.charAt(0)}{user?.apellidos?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                        Usuario
                      </p>
                      <p className="text-base font-bold text-gray-900 truncate">
                        {user?.nombre} {user?.apellidos}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Departamento y Rol - En grid responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Departamento */}
                  <div className="bg-gradient-to-r from-purple-50 via-purple-50/50 to-transparent rounded-xl p-4 border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center shadow-sm">
                        <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-0.5">
                          Departamento
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.departamento?.nombre || 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rol */}
                  <div className="bg-gradient-to-r from-green-50 via-green-50/50 to-transparent rounded-xl p-4 border border-green-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">
                          Rol
                        </p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.role?.nombre || 'Empleado'}
                        </p>
                      </div>
                    </div>
                  </div>
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
