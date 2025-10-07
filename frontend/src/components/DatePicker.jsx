import { forwardRef, useRef, useEffect, useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { registerLocale } from 'react-datepicker'
import es from 'date-fns/locale/es'
import 'react-datepicker/dist/react-datepicker.css'
import './css-components/DatePicker.css'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'

// Registrar locale español
registerLocale('es', es)

/**
 * DatePicker Component
 * 
 * Un componente de selección de fecha personalizado que integra react-datepicker
 * con el diseño del proyecto. Permite selección manual y mediante calendario.
 * 
 * @param {Object} props
 * @param {Date|string} props.selected - Fecha seleccionada (Date object o string ISO)
 * @param {Function} props.onChange - Callback cuando cambia la fecha (date, event)
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.placeholder - Placeholder del input
 * @param {Date} props.minDate - Fecha mínima seleccionable
 * @param {Date} props.maxDate - Fecha máxima seleccionable
 * @param {boolean} props.disabled - Si el campo está deshabilitado
 * @param {string} props.dateFormat - Formato de fecha (default: 'dd/MM/yyyy')
 * @param {boolean} props.showTimeSelect - Mostrar selector de hora
 * @param {string} props.className - Clases CSS adicionales para el contenedor
 * @param {string} props.error - Mensaje de error
 */
const DatePicker = forwardRef(({ 
  selected,
  onChange,
  label,
  placeholder = 'Selecciona una fecha',
  minDate,
  maxDate,
  disabled = false,
  dateFormat = 'dd/MM/yyyy',
  showTimeSelect = false,
  className = '',
  error,
  ...props
}, ref) => {
  // Convertir string a Date si es necesario
  const selectedDate = selected ? (typeof selected === 'string' ? new Date(selected) : selected) : null

  // Ref interno para el DatePicker
  const internalRef = useRef(null)
  const datePickerRef = ref || internalRef
  
  // Estado para controlar si el calendario está abierto
  const [isOpen, setIsOpen] = useState(false)
  
  // Estado para saber si el usuario abrió el calendario manualmente
  const [wasOpenedByUser, setWasOpenedByUser] = useState(false)
  
  // Ref para el wrapper del input
  const wrapperRef = useRef(null)

  // Hook para cerrar el calendario cuando el input sale del viewport al hacer scroll
  useEffect(() => {
    if (!wasOpenedByUser) return

    const checkVisibility = () => {
      if (!wrapperRef.current) return

      const rect = wrapperRef.current.getBoundingClientRect()
      
      // Obtener el contenedor del modal para calcular límites relativos
      const modalBody = wrapperRef.current.closest('.modal-body')
      
      if (modalBody) {
        const modalRect = modalBody.getBoundingClientRect()
        
        // Verificar si el input está parcialmente oculto
        // Añadimos un margen de 20px para cerrarlo antes de que se oculte completamente
        const threshold = 20
        const isPartiallyHidden = (
          rect.top < modalRect.top + threshold ||
          rect.bottom > modalRect.bottom - threshold
        )

        if (isPartiallyHidden && isOpen) {
          // Cerrar si está oculto y el calendario está abierto
          setIsOpen(false)
        } else if (!isPartiallyHidden && !isOpen) {
          // Reabrir si vuelve a estar visible y el calendario estaba cerrado
          setIsOpen(true)
        }
      } else {
        // Fallback: usar viewport si no hay modal
        const threshold = 20
        const isPartiallyHidden = (
          rect.top < threshold ||
          rect.bottom > (window.innerHeight || document.documentElement.clientHeight) - threshold
        )

        if (isPartiallyHidden && isOpen) {
          setIsOpen(false)
        } else if (!isPartiallyHidden && !isOpen) {
          setIsOpen(true)
        }
      }
    }

    // Buscar el contenedor con scroll (modal-body)
    const findScrollContainer = (element) => {
      if (!element) return null
      
      const style = window.getComputedStyle(element)
      const isScrollable = style.overflow === 'auto' || style.overflow === 'scroll' || 
                          style.overflowY === 'auto' || style.overflowY === 'scroll'
      
      if (isScrollable) return element
      
      return findScrollContainer(element.parentElement)
    }

    const scrollContainer = findScrollContainer(wrapperRef.current)
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkVisibility, { passive: true })
      return () => {
        scrollContainer.removeEventListener('scroll', checkVisibility)
      }
    }
  }, [isOpen, wasOpenedByUser])

  // Función para controlar las clases de cada día
  const getDayClassName = (date) => {
    if (!selectedDate) return ''
    
    // Comparar fecha completa (año, mes, día)
    const isSameDate = 
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    
    // Solo devolver clase custom si es exactamente la misma fecha
    return isSameDate ? 'custom-selected-day' : ''
  }

  return (
    <div className={`datepicker-wrapper ${className}`} ref={wrapperRef}>
      {label && (
        <label className="datepicker-label">
          {label}
        </label>
      )}
      
      <div className="datepicker-input-wrapper">
        <div className="datepicker-icon">
          <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <ReactDatePicker
          ref={datePickerRef}
          selected={selectedDate}
          onChange={onChange}
          dateFormat={dateFormat}
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          showTimeSelect={showTimeSelect}
          timeFormat="HH:mm"
          timeIntervals={15}
          locale="es"
          className={`datepicker-input ${error ? 'datepicker-input-error' : ''}`}
          calendarClassName="datepicker-calendar"
          dayClassName={getDayClassName}
          popperPlacement="bottom-start"
          portalId="datepicker-portal"
          open={isOpen}
          onCalendarOpen={() => {
            setIsOpen(true)
            setWasOpenedByUser(true)
          }}
          onCalendarClose={() => {
            setIsOpen(false)
            setWasOpenedByUser(false)
          }}
          {...props}
        />
      </div>
      
      {error && (
        <p className="datepicker-error-message">
          {error}
        </p>
      )}
    </div>
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker
