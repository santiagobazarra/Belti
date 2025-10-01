import { useEffect } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

/**
 * Componente Toast - Notificación tipo toast moderna
 * 
 * @param {Object} props
 * @param {string} props.type - Tipo de notificación: 'success' | 'error'
 * @param {string} props.message - Mensaje a mostrar
 * @param {boolean} props.isVisible - Controla la visibilidad del toast
 * @param {function} props.onClose - Función callback al cerrar el toast
 * @param {number} props.duration - Duración en milisegundos antes de auto-cerrar (default: 5000)
 * @param {string} props.position - Posición del toast: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' (default: 'bottom-right')
 */
export default function Toast({ 
  type = 'success', 
  message = '', 
  isVisible = false, 
  onClose,
  duration = 5000,
  position = 'bottom-right'
}) {
  
  useEffect(() => {
    if (isVisible && onClose && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible || !message) return null

  // Configuración de posición
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const animationClasses = {
    'bottom-right': 'animate-slideInRight',
    'bottom-left': 'animate-slideInLeft',
    'top-right': 'animate-slideInRight',
    'top-left': 'animate-slideInLeft'
  }

  // Configuración de colores según tipo
  const colors = {
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-300',
      iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
      titleColor: 'text-green-900',
      textColor: 'text-green-700',
      hoverBg: 'hover:bg-green-200',
      hoverText: 'text-green-700',
      progressBar: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: CheckCircleIcon
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-300',
      iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
      hoverBg: 'hover:bg-red-200',
      hoverText: 'text-red-700',
      progressBar: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: ExclamationCircleIcon
    }
  }

  const config = colors[type] || colors.success
  const Icon = config.icon

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${animationClasses[position]}`}>
      <div className={`
        relative overflow-hidden rounded-xl shadow-2xl max-w-md w-full
        backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105
        ${config.bg} ${config.border}
      `}>
        {/* Contenido principal */}
        <div className="p-4 pr-12">
          <div className="flex items-start gap-3">
            {/* Icono con animación */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              ${config.iconBg}
              shadow-lg
            `}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            {/* Mensaje */}
            <div className="flex-1 pt-1">
              <h4 className={`text-sm font-bold mb-1 ${config.titleColor}`}>
                {type === 'success' ? '¡Éxito!' : '¡Error!'}
              </h4>
              <p className={`text-sm leading-relaxed ${config.textColor}`}>
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className={`
            absolute top-3 right-3 w-8 h-8 rounded-full 
            flex items-center justify-center transition-all
            hover:scale-110 active:scale-95
            ${config.hoverBg} ${config.hoverText}
          `}
          aria-label="Cerrar notificación"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Barra de progreso animada */}
        {duration > 0 && (
          <div 
            className={`
              absolute bottom-0 left-0 h-1 animate-shrinkWidth
              ${config.progressBar}
              shadow-lg
            `} 
            style={{ animationDuration: `${duration}ms` }} 
          />
        )}
      </div>
    </div>
  )
}
