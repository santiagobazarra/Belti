import Toast from './Toast'

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onRemove}
        />
      ))}
    </>
  )
}

export default ToastContainer
