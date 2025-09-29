import { useEffect, useRef } from 'react'
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

  // Manejar el scroll del body
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen])

  // Manejar ESC key
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

  if (!isOpen) return null

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

  const animationClass = animationType === 'fade-scale' ? 'animate-modal-fade-scale' : 'animate-modal-fade-in'

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === backdropRef.current) {
      e.preventDefault()
      onClose()
    }
  }

  const handleCloseClick = (e) => {
    e.preventDefault()
    onClose()
  }

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop animate-backdrop-fade-in"
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
