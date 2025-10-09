import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
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
  const icons = {
    warning: ExclamationTriangleIcon,
    danger: TrashIcon,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      variant={variant}
      animationType="fade-scale"
      showHeader={false}
    >
      <div className="modal-confirm-content">
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
    </Modal>
  )
}
