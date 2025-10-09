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
  const [isMobile, setIsMobile] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Resetear estados al montar el componente
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
    } else {
      setShouldRender(false)
      setIsClosing(false)
    }
  }, []) // Solo al montar

  // Manejar el estado del modal y animaciones (solo para móvil)
  useEffect(() => {
    if (isOpen) {
      // Abrir modal
      setShouldRender(true)
      setIsClosing(false)
      document.body.style.overflow = 'hidden'
      document.body.classList.add('modal-open')
    } else if (shouldRender) {
      // Cerrar modal
      if (isMobile) {
        // En móvil: animación de salida
        setIsClosing(true)
        document.body.style.overflow = ''
        document.body.classList.remove('modal-open')
        
        const timer = setTimeout(() => {
          setShouldRender(false)
          setIsClosing(false)
        }, 350)
        
        return () => clearTimeout(timer)
      } else {
        // En desktop: cierre instantáneo
        setShouldRender(false)
        setIsClosing(false)
        document.body.style.overflow = ''
        document.body.classList.remove('modal-open')
      }
    }

    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
    }
  }, [isOpen, isMobile])

  // Resetear estados cuando cambia de móvil a desktop durante animación
  useEffect(() => {
    if (!isMobile && isClosing) {
      // Si cambiamos a desktop durante una animación de cierre, resetear inmediatamente
      setShouldRender(false)
      setIsClosing(false)
    }
  }, [isMobile, isClosing])

  // Manejar ESC key - SIMPLIFICADO
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

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

  // Animaciones solo para móvil
  const getAnimationClasses = () => {
    if (!isMobile) {
      // Sin animaciones en desktop
      return { modalAnimationClass: '', backdropAnimationClass: '' }
    }
    
    if (isClosing) {
      // Animaciones de salida para móvil
      return { 
        modalAnimationClass: 'animate-modal-fade-scale-out', 
        backdropAnimationClass: 'animate-backdrop-fade-out' 
      }
    } else {
      // Animaciones de entrada para móvil
      return { 
        modalAnimationClass: 'animate-modal-fade-scale', 
        backdropAnimationClass: 'animate-backdrop-fade-in' 
      }
    }
  }

  const { modalAnimationClass, backdropAnimationClass } = getAnimationClasses()

  const handleClose = () => {
    if (!isClosing) {
      onClose()
    }
  }

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && !isClosing) {
      // Cerrar si se hace click en el backdrop o en el container
      if (e.target === backdropRef.current || e.target.classList.contains('modal-container')) {
        e.preventDefault()
        e.stopPropagation()
        handleClose()
      }
    }
  }

  const handleCloseClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleClose()
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
      <div className="modal-container">
        <div
          ref={modalRef}
          className={`
            modal-content ${sizeClasses[size]} ${variantClasses[variant]}
            ${modalAnimationClass}
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
