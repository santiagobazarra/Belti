import { forwardRef } from 'react'
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
    <div className={`datepicker-wrapper ${className}`}>
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
          ref={ref}
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
          selectsStart={false}
          selectsEnd={false}
          highlightDates={[]}
          monthsShown={1}
          popperPlacement="bottom-start"
          popperClassName="datepicker-popper"
          popperContainer={({ children }) => {
            // Renderizar el popper en un contenedor con z-index garantizado
            return (
              <div style={{ 
                position: 'fixed', 
                zIndex: 2147483647,
                isolation: 'isolate'
              }}>
                {children}
              </div>
            )
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
