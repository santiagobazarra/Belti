import { useEffect, useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  animationType = 'fade-scale',
  variant = 'default',
  showHeader = true,
  showCloseButton = true
}) {
  const modalRef = useRef()
  const backdropRef = useRef()
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Manejar el montaje y desmontaje con animación
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
    } else if (shouldRender) {
      // Iniciar animación de cierre
      setIsClosing(true)
      // Esperar a que termine la animación antes de desmontar
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsClosing(false)
      }, 350) // Duración de la animación de salida
      return () => clearTimeout(timer)
    }
  }, [isOpen, shouldRender])

  // Manejar el scroll del body
  useEffect(() => {
    if (shouldRender && !isClosing) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        modalRef.current?.focus()
      }, 50)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [shouldRender, isClosing])

  // Manejar ESC key
  useEffect(() => {
    if (!shouldRender || isClosing) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [shouldRender, isClosing, onClose])

  if (!shouldRender) return null

  const sizeClasses = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  const variantClasses = {
    default: 'modal-default',
    clean: 'modal-clean',
    elegant: 'modal-elegant',
    minimal: 'modal-minimal'
  }

  // Elegir animación según estado
  const animationClass = isClosing
    ? (animationType === 'fade-scale' ? 'animate-modal-fade-scale-out' : 'animate-modal-fade-out')
    : (animationType === 'fade-scale' ? 'animate-modal-fade-scale' : 'animate-modal-fade-in')

  const backdropAnimationClass = isClosing ? 'animate-backdrop-fade-out' : 'animate-backdrop-fade-in'

  const handleBackdropClick = (e) => {
    // Cerrar solo si se hace click directamente en el backdrop o en el container
    if (closeOnBackdrop && !isClosing) {
      const isBackdrop = e.target === backdropRef.current
      const isContainer = e.target.classList.contains('modal-container')
      
      if (isBackdrop || isContainer) {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
  }

  const handleCloseClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isClosing) {
      onClose()
    }
  }

  return (
    <div
      ref={backdropRef}
      className={`modal-backdrop ${backdropAnimationClass}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-container" onClick={handleBackdropClick}>
        <div
          ref={modalRef}
          className={`
            modal-content ${sizeClasses[size]} ${variantClasses[variant]}
            ${animationClass}
          `}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Premium */}
          {showHeader && (
            <div className="modal-header">
              <div className="modal-title-section">
                <h3 id="modal-title" className="modal-title">
                  {title}
                </h3>
              </div>

              {showCloseButton && (
                <button
                  onClick={handleCloseClick}
                  className="modal-close-btn"
                  aria-label="Cerrar modal"
                  disabled={isClosing}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content con scroll personalizado */}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
