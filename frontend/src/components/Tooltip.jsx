import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

const Tooltip = ({ 
  children, 
  content, 
  delay = 1000,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, arrowLeft: 0, position: 'top' })
  const [showTimeout, setShowTimeout] = useState(null)
  const triggerRef = useRef(null)

  const calculatePosition = (rect) => {
    const margin = 12
    const tooltipWidth = 280
    const tooltipHeight = 60
    
    // Posición centrada horizontalmente sobre el icono
    let top = rect.top - tooltipHeight - margin
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2)
    
    // Ajustar la flecha para que apunte al centro del icono
    const arrowLeft = rect.left + (rect.width / 2) - left
    
    // Asegurar que no se salga de la pantalla horizontalmente
    if (left < 10) {
      left = 10
    } else if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10
    }
    
    // Si se sale por arriba, mostrar abajo
    if (top < 10) {
      top = rect.bottom + margin
      return { top, left, arrowLeft, position: 'bottom' }
    }
    
    return { top, left, arrowLeft, position: 'top' }
  }

  const showTooltip = () => {
    if (showTimeout) return
    
    const timeout = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const position = calculatePosition(rect)
        setTooltipPosition(position)
        setIsVisible(true)
      }
    }, delay)
    
    setShowTimeout(timeout)
  }

  const hideTooltip = () => {
    if (showTimeout) {
      clearTimeout(showTimeout)
      setShowTimeout(null)
    }
    setIsVisible(false)
  }

  if (!content) {
    return children
  }

  return (
    <div className="tooltip-container">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="tooltip-trigger"
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            zIndex: 99999,
            backgroundColor: '#1f2937',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: '1.5',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '280px',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            pointerEvents: 'none',
            opacity: 0,
            transform: 'translateY(8px) scale(0.95)',
            animation: 'tooltipFadeIn 0.3s ease-out forwards'
          }}
        >
          {content}
          {/* Flecha que apunta exactamente al icono */}
          <div 
            style={{
              position: 'absolute',
              top: tooltipPosition.position === 'top' ? '100%' : '-16px',
              left: `${tooltipPosition.arrowLeft}px`,
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              border: '8px solid transparent',
              [tooltipPosition.position === 'top' ? 'borderTopColor' : 'borderBottomColor']: '#1f2937'
            }}
          />
        </div>,
        document.body
      )}
    </div>
  )
}

export default Tooltip
