import './css-components/Card.css'

/**
 * Card Component
 * 
 * Componente reutilizable para crear tarjetas con diseño glassmorphism.
 * Optimizado para evitar conflictos de z-index con calendarios y modales.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del card
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.hover - Si debe tener efecto hover (default: false)
 * @param {boolean} props.noPadding - Si debe remover el padding interno (default: false)
 * @param {Function} props.onClick - Función al hacer click (opcional)
 */
export default function Card({ 
  children, 
  className = '', 
  hover = false,
  noPadding = false,
  onClick,
  ...props 
}) {
  const cardClasses = [
    'card',
    hover && 'card-hover',
    noPadding && 'card-no-padding',
    className
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {noPadding ? children : (
        <div className="card-content">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Card.Header - Componente para el encabezado del card
 */
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  )
}

/**
 * Card.Body - Componente para el cuerpo del card
 */
Card.Body = function CardBody({ children, className = '' }) {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  )
}

/**
 * Card.Footer - Componente para el pie del card
 */
Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  )
}
