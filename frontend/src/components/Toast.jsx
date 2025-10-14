import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Toast = ({ 
  id,
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const [isEntering, setIsEntering] = useState(true)
  
  useEffect(() => {
    // Animación de entrada
    const enterTimer = setTimeout(() => {
      setIsEntering(false)
    }, 300)

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      
      // Barra de progreso que se reduce con el tiempo
      const progressInterval = setInterval(() => {
        if (!isPaused) {
          setProgress(prev => {
            const decrement = 100 / (duration / 50) // Actualizar cada 50ms para mayor suavidad
            const newProgress = prev - decrement
            return newProgress <= 0 ? 0 : newProgress
          })
        }
      }, 50)

      return () => {
        clearTimeout(timer)
        clearTimeout(enterTimer)
        clearInterval(progressInterval)
      }
    }

    return () => {
      clearTimeout(enterTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.(id)
    }, 300) // Tiempo para la animación de salida
  }

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return createPortal(
    <>
      {/* Keyframes CSS para la animación de bounce y estilos responsive */}
      <style>
        {`
          @keyframes toastBounce {
            0% {
              transform: scale(0.3) translateY(-10px);
              opacity: 0;
            }
            50% {
              transform: scale(1.05) translateY(0);
              opacity: 1;
            }
            70% {
              transform: scale(0.95) translateY(0);
            }
            100% {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }

          @keyframes toastBounceMobile {
            0% {
              transform: translateY(-20px) scale(0.9);
              opacity: 0;
            }
            50% {
              transform: translateY(5px) scale(1.02);
              opacity: 1;
            }
            70% {
              transform: translateY(-2px) scale(0.98);
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }

          /* Estilos responsive adicionales */
          @media (max-width: 640px) {
            .toast-mobile {
              left: 16px !important;
              right: 16px !important;
              width: auto !important;
              max-width: none !important;
              transform: none !important;
            }
          }

          @media (max-width: 480px) {
            .toast-mobile {
              left: 12px !important;
              right: 12px !important;
              font-size: 14px;
            }
          }

          @media (max-width: 360px) {
            .toast-mobile {
              left: 8px !important;
              right: 8px !important;
              font-size: 13px;
            }
          }
        `}
      </style>
      
      <div 
        className={`
          fixed z-50 toast-mobile
          top-4 left-4 right-4 w-auto
          sm:top-4 sm:right-4 sm:left-auto sm:max-w-sm
          md:top-4 md:right-4 md:max-w-md
          lg:top-4 lg:right-4 lg:max-w-lg
          xl:top-4 xl:right-4 xl:max-w-xl
          transition-all duration-500 ease-out
          ${isEntering 
            ? 'translate-y-full opacity-0 scale-95 sm:translate-x-full sm:translate-y-0' 
            : isLeaving 
              ? 'translate-y-full opacity-0 scale-95 sm:translate-x-full sm:translate-y-0' 
              : 'translate-y-0 opacity-100 scale-100 sm:translate-x-0'
          }
        `}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
      <div 
        className={`
          rounded-lg border shadow-lg
          p-3 sm:p-4
          transform transition-all duration-300 ease-out
          ${isEntering 
            ? 'translate-y-2 opacity-0' 
            : 'translate-y-0 opacity-100'
          }
          ${getStyles()}
        `}
        style={{
          animation: isEntering ? 'none' : window.innerWidth <= 640 ? 'toastBounceMobile 0.6s ease-out' : 'toastBounce 0.6s ease-out'
        }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
            </div>
          <div className="ml-2 sm:ml-3 flex-1 min-w-0">
            {title && (
              <h4 className="text-xs sm:text-sm font-semibold mb-1 break-words">
                {title}
              </h4>
            )}
            <p className="text-xs sm:text-sm break-words leading-relaxed">
                {message}
              </p>
            </div>
          <div className="ml-2 sm:ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md p-1 sm:p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200/50 rounded-b-lg overflow-hidden">
            <div 
              className={`h-full transition-all duration-75 ease-linear ${getProgressColor()} shadow-sm`}
              style={{ 
                width: `${progress}%`,
                transition: isPaused ? 'none' : 'width 75ms ease-linear'
              }}
            />
          </div>
        )}
      </div>
    </div>
    </>,
    document.body
  )
}

export default Toast