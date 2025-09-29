import { useEffect, useRef } from 'react'
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import Modal from './Modal'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false,
  variant = 'default'
}) {
  const dialogRef = useRef()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        dialogRef.current?.focus()
      }, 50)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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

  const icons = {
    warning: ExclamationTriangleIcon,
    danger: XCircleIcon,
    info: InformationCircleIcon,
    success: CheckCircleIcon
  }

  const iconClasses = {
    warning: 'modal-confirm-icon warning',
    danger: 'modal-confirm-icon danger',
    info: 'modal-confirm-icon info',
    success: 'modal-confirm-icon success'
  }

  const buttonVariants = {
    warning: 'warning',
    danger: 'danger',
    info: 'primary',
    success: 'success'
  }

  const IconComponent = icons[type]

  const handleConfirm = () => {
    onConfirm()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="modal-backdrop animate-backdrop-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="modal-container">
        <div
          ref={dialogRef}
          className={`modal-content max-w-md modal-${variant} modal-confirm animate-modal-fade-scale`}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-body">
            {/* Icono central */}
            <div className={iconClasses[type]}>
              <IconComponent className="w-8 h-8" />
            </div>

            {/* Título */}
            <h3 id="confirm-title" className="modal-confirm-title">
              {title}
            </h3>

            {/* Mensaje */}
            <p className="modal-confirm-message">
              {message}
            </p>

            {/* Botones de acción */}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={`btn btn-${buttonVariants[type]} ${isLoading ? 'btn-loading' : ''}`}
              >
                {isLoading ? 'Procesando...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
