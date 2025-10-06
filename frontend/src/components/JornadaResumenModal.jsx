import { useEffect, useState } from 'react'
import { XMarkIcon, PlayIcon, StopIcon, PauseIcon, ClockIcon } from '@heroicons/react/24/outline'
import './css-components/JornadaResumenModal.css'

export default function JornadaResumenModal({ jornada, onClose }) {
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  // Manejar cierre con animación
  const handleClose = () => {
    if (isClosing) return // Prevenir múltiples llamadas
    
    setIsClosing(true)
    setTimeout(() => {
      setShouldRender(false)
      onClose()
    }, 350) // Duración de la animación CSS
  }

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !isClosing) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isClosing])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Prevenir cierre durante animación
  const handleOverlayClick = (e) => {
    // Solo cerrar si se hace click en el overlay, no en sus hijos
    if (e.target === e.currentTarget && !isClosing) {
      handleClose()
    }
  }

  if (!shouldRender) return null

  // Formatear tiempo
  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return '0h 0m'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatTimeOnly = (dateString) => {
    if (!dateString) return '--:--'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '--:--'
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return '--:--'
    }
  }

  // Extraer datos con fallbacks
  const fecha = jornada.fecha
  const inicio = jornada.hora_inicio || jornada.inicio || jornada.hora_entrada || jornada.entrada
  const fin = jornada.hora_fin || jornada.fin || jornada.hora_salida || jornada.salida
  
  // Manejar pausas - puede venir como array de objetos o como total de minutos
  let pausasList = []
  let pausasTotalMinutos = 0
  
  if (Array.isArray(jornada.pausas) && jornada.pausas.length > 0) {
    pausasList = jornada.pausas
    pausasTotalMinutos = jornada.pausas.reduce((acc, p) => {
      const duracion = p.duracion_minutos || p.duracion || 0
      return acc + duracion
    }, 0)
  } else {
    pausasTotalMinutos = jornada.pausa_total_minutos || jornada.pausas_minutos || 0
  }
  
  // Calcular duración: total_horas (decimal) * 60 para convertir a minutos
  const duracion = jornada.total_horas 
    ? Math.round(jornada.total_horas * 60) 
    : (jornada.duracion_minutos || jornada.duracion || jornada.total_minutos || 0)
  
  console.log('📊 Datos del modal:', {
    fecha,
    inicio,
    fin,
    pausasList,
    pausasTotalMinutos,
    duracion,
    total_horas: jornada.total_horas,
    duracion_minutos: jornada.duracion_minutos,
    jornada_completa: jornada
  })

  // Calcular segmentos para la timeline con posición real de cada pausa
  const calcularSegmentosTimeline = () => {
    if (!inicio) return []
    
    const inicioTime = new Date(inicio).getTime()
    const finTime = fin ? new Date(fin).getTime() : Date.now()
    const totalMs = finTime - inicioTime
    
    if (totalMs <= 0) return []
    
    const segmentos = []
    let tiempoActual = inicioTime
    let trabajoCounter = 0
    
    // Si hay pausas con hora_inicio y hora_fin, las ordenamos por tiempo
    if (pausasList.length > 0) {
      const pausasOrdenadas = [...pausasList]
        .filter(p => {
          const pInicio = p.hora_inicio || p.inicio
          const pFin = p.hora_fin || p.fin
          return pInicio && pFin
        })
        .sort((a, b) => {
          const aTime = new Date(a.hora_inicio || a.inicio).getTime()
          const bTime = new Date(b.hora_inicio || b.inicio).getTime()
          return aTime - bTime
        })
      
      pausasOrdenadas.forEach((pausa, index) => {
        const pausaInicio = new Date(pausa.hora_inicio || pausa.inicio).getTime()
        const pausaFin = new Date(pausa.hora_fin || pausa.fin).getTime()
        
        // Segmento de trabajo antes de la pausa
        if (pausaInicio > tiempoActual) {
          const trabajoMs = pausaInicio - tiempoActual
          segmentos.push({
            tipo: 'trabajo',
            porcentaje: (trabajoMs / totalMs) * 100,
            duracionMs: trabajoMs,
            trabajoIndex: trabajoCounter++
          })
        }
        
        // Segmento de pausa
        const pausaMs = pausaFin - pausaInicio
        segmentos.push({
          tipo: 'pausa',
          porcentaje: (pausaMs / totalMs) * 100,
          duracionMs: pausaMs,
          pausaIndex: index,
          pausa: pausa
        })
        
        tiempoActual = pausaFin
      })
      
      // Trabajo final después de la última pausa
      if (tiempoActual < finTime) {
        const trabajoMs = finTime - tiempoActual
        segmentos.push({
          tipo: 'trabajo',
          porcentaje: (trabajoMs / totalMs) * 100,
          duracionMs: trabajoMs,
          trabajoIndex: trabajoCounter++
        })
      }
    } else {
      // Si no hay pausas, todo es trabajo
      segmentos.push({
        tipo: 'trabajo',
        porcentaje: 100,
        duracionMs: totalMs,
        trabajoIndex: 0
      })
    }
    
    return segmentos
  }

  const segmentosTimeline = calcularSegmentosTimeline()
  
  // Estado para el hover y el click
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const [hoveredPausaIndex, setHoveredPausaIndex] = useState(null)
  const [hoveredTrabajoIndex, setHoveredTrabajoIndex] = useState(null)
  const [clickedSegment, setClickedSegment] = useState(null)

  // Crear lista intercalada de trabajo y pausas para mostrar cronológicamente
  const crearListaIntercalada = () => {
    const lista = []
    let tiempoActual = inicio ? new Date(inicio).getTime() : 0
    let trabajoCounter = 0
    
    if (!inicio) return lista

    // Si hay pausas con horarios específicos
    if (pausasList.length > 0) {
      const pausasOrdenadas = [...pausasList]
        .filter(p => {
          const pInicio = p.hora_inicio || p.inicio
          const pFin = p.hora_fin || p.fin
          return pInicio && pFin
        })
        .sort((a, b) => {
          const aTime = new Date(a.hora_inicio || a.inicio).getTime()
          const bTime = new Date(b.hora_inicio || b.inicio).getTime()
          return aTime - bTime
        })

      pausasOrdenadas.forEach((pausa, index) => {
        const pausaInicio = new Date(pausa.hora_inicio || pausa.inicio).getTime()
        const pausaFin = new Date(pausa.hora_fin || pausa.fin).getTime()

        // Agregar período de trabajo antes de la pausa
        if (pausaInicio > tiempoActual) {
          const duracionMs = pausaInicio - tiempoActual
          lista.push({
            tipo: 'trabajo',
            inicio: new Date(tiempoActual),
            fin: new Date(pausaInicio),
            duracion_minutos: Math.round(duracionMs / 60000),
            trabajoIndex: trabajoCounter++,
            index: lista.length
          })
        }

        // Agregar la pausa
        const duracionMs = pausaFin - pausaInicio
        lista.push({
          tipo: 'pausa',
          inicio: new Date(pausaInicio),
          fin: new Date(pausaFin),
          duracion_minutos: Math.round(duracionMs / 60000),
          pausaIndex: index,
          tipoPausa: pausa.tipo_pausa?.nombre || pausa.tipo_nombre || pausa.tipo || 'Pausa',
          index: lista.length
        })

        tiempoActual = pausaFin
      })

      // Agregar trabajo final si hay hora de fin
      if (fin) {
        const finTime = new Date(fin).getTime()
        if (finTime > tiempoActual) {
          const duracionMs = finTime - tiempoActual
          lista.push({
            tipo: 'trabajo',
            inicio: new Date(tiempoActual),
            fin: new Date(finTime),
            duracion_minutos: Math.round(duracionMs / 60000),
            trabajoIndex: trabajoCounter++,
            index: lista.length
          })
        }
      }
    } else {
      // Si no hay pausas, es todo trabajo
      if (fin) {
        const finTime = new Date(fin).getTime()
        const duracionMs = finTime - tiempoActual
        lista.push({
          tipo: 'trabajo',
          inicio: new Date(tiempoActual),
          fin: new Date(finTime),
          duracion_minutos: Math.round(duracionMs / 60000),
          trabajoIndex: trabajoCounter++,
          index: lista.length
        })
      }
    }

    return lista
  }

  const listaIntercalada = crearListaIntercalada()

  // Función para hacer scroll a un elemento específico y destacarlo
  const handleSegmentClick = (segmento, index) => {
    // Encontrar el elemento correspondiente en la lista
    let targetIndex = -1
    
    if (segmento.tipo === 'pausa') {
      targetIndex = listaIntercalada.findIndex(
        item => item.tipo === 'pausa' && item.pausaIndex === segmento.pausaIndex
      )
    } else if (segmento.tipo === 'trabajo') {
      targetIndex = listaIntercalada.findIndex(
        item => item.tipo === 'trabajo' && item.trabajoIndex === segmento.trabajoIndex
      )
    }

    if (targetIndex !== -1) {
      // Hacer scroll al elemento
      const elementId = `actividad-item-${targetIndex}`
      const element = document.getElementById(elementId)
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Iluminar temporalmente
        setClickedSegment(index)
        if (segmento.tipo === 'pausa') {
          setHoveredPausaIndex(segmento.pausaIndex)
        } else if (segmento.tipo === 'trabajo') {
          setHoveredTrabajoIndex(segmento.trabajoIndex)
        }
        
        // Quitar la iluminación después de 1.5 segundos
        setTimeout(() => {
          setClickedSegment(null)
          setHoveredPausaIndex(null)
          setHoveredTrabajoIndex(null)
        }, 1500)
      }
    }
  }

  return (
    <div 
      className={`jornada-modal-overlay ${isClosing ? 'closing' : ''}`} 
      onClick={handleOverlayClick}
    >
      <div 
        className={`jornada-modal-content ${isClosing ? 'closing' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="jornada-modal-header">
          <div className="jornada-modal-header-content">
            <h2 className="jornada-modal-title">Resumen de Jornada</h2>
            <p className="jornada-modal-date">
              {new Date(fecha).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="jornada-modal-close-btn"
            disabled={isClosing}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Timeline fijo - fuera del header y del scroll */}
        <div className="jornada-timeline-section">
          <div className="timeline-header">
            <h3 className="timeline-title">Timeline de la Jornada</h3>
            <div className="timeline-legend">
              <div className="legend-item">
                <div className="legend-color legend-trabajo"></div>
                <span>Trabajo</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-pausas"></div>
                <span>Pausas</span>
              </div>
            </div>
          </div>
          
          <div className="timeline-bar-container">
            <div className="timeline-bar-wrapper">
              {segmentosTimeline.map((segmento, index) => {
                const isHovered = hoveredSegment === index
                const isPausaHovered = segmento.tipo === 'pausa' && hoveredPausaIndex === segmento.pausaIndex
                const isTrabajoHovered = segmento.tipo === 'trabajo' && hoveredTrabajoIndex === segmento.trabajoIndex
                const isClicked = clickedSegment === index
                
                return (
                  <div
                    key={index}
                    className={`timeline-segment segment-${segmento.tipo} ${isHovered || isPausaHovered || isTrabajoHovered || isClicked ? 'segment-hovered' : ''}`}
                    style={{ width: `${segmento.porcentaje}%`, cursor: 'pointer' }}
                    onMouseEnter={() => {
                      if (clickedSegment === null) {
                        setHoveredSegment(index)
                        if (segmento.tipo === 'pausa') {
                          setHoveredPausaIndex(segmento.pausaIndex)
                        } else if (segmento.tipo === 'trabajo') {
                          setHoveredTrabajoIndex(segmento.trabajoIndex)
                        }
                      }
                    }}
                    onMouseLeave={() => {
                      if (clickedSegment === null) {
                        setHoveredSegment(null)
                        setHoveredPausaIndex(null)
                        setHoveredTrabajoIndex(null)
                      }
                    }}
                    onClick={() => handleSegmentClick(segmento, index)}
                    title={segmento.tipo === 'pausa' 
                      ? `Pausa ${segmento.pausaIndex + 1}: ${formatTime(Math.round(segmento.duracionMs / 60000))} (Click para ver)`
                      : `Trabajo: ${formatTime(Math.round(segmento.duracionMs / 60000))} (Click para ver)`
                    }
                  >
                    {segmento.porcentaje > 8 && (
                      <span className="segment-label">
                        {segmento.tipo === 'pausa' 
                          ? `P${segmento.pausaIndex + 1}`
                          : formatTime(Math.round(segmento.duracionMs / 60000))
                        }
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="timeline-times">
              <div className="timeline-time timeline-time-start">
                <PlayIcon className="h-3 w-3" />
                <span>{formatTimeOnly(inicio)}</span>
              </div>
              {fin && (
                <div className="timeline-time timeline-time-end">
                  <span>{formatTimeOnly(fin)}</span>
                  <StopIcon className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body con scroll */}
        <div className="jornada-modal-body">
          <div className="stats-grid">
            <div className="stat-card stat-entrada">
              <div className="stat-card-icon-wrapper">
                <div className="stat-card-icon">
                  <PlayIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-card-content">
                <span className="stat-card-label">Entrada</span>
                <span className="stat-card-value">{formatTimeOnly(inicio)}</span>
              </div>
            </div>

            <div className="stat-card stat-salida">
              <div className="stat-card-icon-wrapper">
                <div className="stat-card-icon">
                  <StopIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-card-content">
                <span className="stat-card-label">Salida</span>
                <span className="stat-card-value">{fin ? formatTimeOnly(fin) : 'En curso'}</span>
              </div>
            </div>

            <div 
              className={`stat-card stat-duracion ${hoveredTrabajoIndex !== null ? 'stat-card-highlighted' : ''}`}
            >
              <div className="stat-card-icon-wrapper">
                <div className="stat-card-icon">
                  <ClockIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="stat-card-content">
                <span className="stat-card-label">Duración</span>
                <span className="stat-card-value">{formatTime(duracion)}</span>
              </div>
            </div>

            {pausasTotalMinutos > 0 && (
              <div 
                className={`stat-card stat-pausas ${hoveredPausaIndex !== null ? 'stat-card-highlighted' : ''}`}
              >
                <div className="stat-card-icon-wrapper">
                  <div className="stat-card-icon">
                    <PauseIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="stat-card-content">
                  <span className="stat-card-label">Pausas</span>
                  <span className="stat-card-value">{formatTime(pausasTotalMinutos)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Detalle cronológico de trabajo y pausas */}
          {listaIntercalada.length > 0 && (
            <div className="actividad-section">
              <div className="actividad-header">
                <ClockIcon className="h-4 w-4" />
                <h3 className="actividad-title">Detalle Cronológico</h3>
                <div className="actividad-counts">
                  <span className="actividad-count actividad-count-pausas">{pausasList.length}</span>
                  <span className="actividad-count actividad-count-total">{listaIntercalada.length}</span>
                </div>
              </div>
              <div className="actividad-list">
                {listaIntercalada.map((item) => {
                  const isPausaHighlighted = item.tipo === 'pausa' && hoveredPausaIndex === item.pausaIndex
                  const isTrabajoHighlighted = item.tipo === 'trabajo' && hoveredTrabajoIndex === item.trabajoIndex
                  
                  return (
                    <div 
                      key={item.index}
                      id={`actividad-item-${item.index}`}
                      className={`actividad-item actividad-item-${item.tipo} ${isPausaHighlighted || isTrabajoHighlighted ? 'actividad-item-highlighted' : ''}`}
                      onMouseEnter={() => {
                        if (item.tipo === 'pausa') {
                          setHoveredPausaIndex(item.pausaIndex)
                        } else if (item.tipo === 'trabajo') {
                          setHoveredTrabajoIndex(item.trabajoIndex)
                        }
                      }}
                      onMouseLeave={() => {
                        if (item.tipo === 'pausa') {
                          setHoveredPausaIndex(null)
                        } else if (item.tipo === 'trabajo') {
                          setHoveredTrabajoIndex(null)
                        }
                      }}
                    >
                      <div className="actividad-icon-wrapper">
                        {item.tipo === 'trabajo' ? (
                          <div className="actividad-icon actividad-icon-trabajo">
                            <ClockIcon className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="actividad-icon actividad-icon-pausa">
                            <PauseIcon className="h-4 w-4" />
                          </div>
                        )}
                        {item.index < listaIntercalada.length - 1 && (
                          <div className="actividad-connector"></div>
                        )}
                      </div>
                      
                      <div className="actividad-content">
                        <div className="actividad-header-row">
                          <div className="actividad-tipo">
                            {item.tipo === 'trabajo' ? (
                              <span className="actividad-tipo-badge actividad-tipo-trabajo">
                                Trabajo
                              </span>
                            ) : (
                              <span className="actividad-tipo-badge actividad-tipo-pausa">
                                {item.tipoPausa}
                              </span>
                            )}
                          </div>
                          <div className="actividad-duracion-badge">
                            {formatTime(item.duracion_minutos)}
                          </div>
                        </div>
                        <div className="actividad-times">
                          <span className="actividad-time-start">{formatTimeOnly(item.inicio)}</span>
                          <span className="actividad-separator">→</span>
                          <span className="actividad-time-end">{formatTimeOnly(item.fin)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Mensaje si no hay actividad */}
          {listaIntercalada.length === 0 && (
            <div className="no-pausas-message">
              <ClockIcon className="h-8 w-8 text-gray-300" />
              <p>No hay información detallada disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
