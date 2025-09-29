import React from 'react'

export default function ModalFooter({
  children,
  align = 'right',
  className = '',
  variant = 'default'
}) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  }

  const variantClasses = {
    default: 'modal-footer',
    clean: 'modal-footer-clean',
    minimal: 'modal-footer-minimal'
  }

  return (
    <div className={`${variantClasses[variant]} ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}

// Componente para botones específicos de modal
export function ModalActions({
  onCancel,
  onConfirm,
  cancelText = 'Cancelar',
  confirmText = 'Guardar',
  confirmVariant = 'primary',
  isLoading = false,
  disabled = false
}) {
  return (
    <div className="modal-footer">
      <button
        type="button"
        onClick={onCancel}
        className="btn btn-secondary"
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        type="submit"
        onClick={onConfirm}
        disabled={disabled || isLoading}
        className={`btn btn-${confirmVariant} ${isLoading ? 'btn-loading' : ''}`}
      >
        {isLoading ? 'Procesando...' : confirmText}
      </button>
    </div>
  )
}
