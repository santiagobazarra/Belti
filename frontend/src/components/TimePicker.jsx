import { forwardRef, useState, useRef, useEffect } from 'react'
import { ClockIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import './css-components/TimePicker.css'

/**
 * TimePicker Component - Diseño moderno y premium
 * 
 * Un componente de selección de hora elegante y minimalista.
 * Permite escribir directamente o seleccionar del dropdown.
 * 
 * @param {Object} props
 * @param {string} props.value - Hora seleccionada (formato HH:mm)
 * @param {Function} props.onChange - Callback cuando cambia la hora (value)
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.placeholder - Placeholder del input
 * @param {boolean} props.disabled - Si el campo está deshabilitado
 * @param {boolean} props.required - Si el campo es requerido
 * @param {string} props.className - Clases CSS adicionales para el contenedor
 * @param {string} props.error - Mensaje de error
 */
const TimePicker = forwardRef(({ 
  value,
  onChange,
  label,
  placeholder = 'HH:MM',
  disabled = false,
  required = false,
  className = '',
  error,
  ...props
}, ref) => {
  
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedHour, setSelectedHour] = useState('09')
  const [selectedMinute, setSelectedMinute] = useState('00')
  const dropdownRef = useRef(null)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Parsear el valor inicial
  useEffect(() => {
    if (value) {
      setInputValue(value)
      const [h, m] = value.split(':')
      if (h && m) {
        setSelectedHour(h)
        setSelectedMinute(m)
      }
    } else {
      setInputValue('')
    }
  }, [value])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  const handleInputChange = (e) => {
    let val = e.target.value.replace(/[^\d:]/g, '') // Solo números y :
    
    // Auto-formato mientras escribe
    if (val.length === 2 && !val.includes(':')) {
      val = val + ':'
    }
    
    // Limitar a HH:MM
    if (val.length > 5) {
      val = val.slice(0, 5)
    }
    
    setInputValue(val)
    
    // Validar y actualizar si es una hora completa válida
    if (val.length === 5 && val.includes(':')) {
      const [h, m] = val.split(':')
      const hour = parseInt(h, 10)
      const minute = parseInt(m, 10)
      
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        setSelectedHour(String(hour).padStart(2, '0'))
        setSelectedMinute(String(minute).padStart(2, '0'))
        if (onChange) onChange(val)
      }
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleHourClick = (hour) => {
    setSelectedHour(hour)
    const newValue = `${hour}:${selectedMinute}`
    setInputValue(newValue)
    if (onChange) onChange(newValue)
    // Enfocar en minutos después de seleccionar hora
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleMinuteClick = (minute) => {
    setSelectedMinute(minute)
    const newValue = `${selectedHour}:${minute}`
    setInputValue(newValue)
    if (onChange) onChange(newValue)
    setTimeout(() => {
      setIsOpen(false)
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }, 200)
  }

  const handleChevronClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className={`timepicker-wrapper ${className}`} ref={wrapperRef}>
      {label && (
        <label className="timepicker-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`timepicker-input-wrapper ${isOpen ? 'timepicker-input-wrapper-open' : ''}`}>
        <div className="timepicker-icon">
          <ClockIcon className="h-5 w-5" />
        </div>
        
        <input
          ref={(node) => {
            inputRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          placeholder={placeholder}
          className={`timepicker-input ${error ? 'timepicker-input-error' : ''} ${isOpen ? 'timepicker-input-open' : ''}`}
          maxLength={5}
          {...props}
        />

        <button
          type="button"
          onClick={handleChevronClick}
          tabIndex={-1}
          className="timepicker-chevron-button"
          disabled={disabled}
        >
          <ChevronDownIcon className={`timepicker-chevron ${isOpen ? 'timepicker-chevron-open' : ''}`} />
        </button>

        {isOpen && (
          <div className="timepicker-dropdown" ref={dropdownRef}>
            <div className="timepicker-dropdown-content">
              {/* Columna de Horas */}
              <div className="timepicker-column">
                <div className="timepicker-column-header">Hora</div>
                <div className="timepicker-column-list">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleHourClick(hour)}
                      className={`timepicker-option ${selectedHour === hour ? 'timepicker-option-selected' : ''}`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Separador */}
              <div className="timepicker-separator">:</div>

              {/* Columna de Minutos */}
              <div className="timepicker-column">
                <div className="timepicker-column-header">Min</div>
                <div className="timepicker-column-list">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleMinuteClick(minute)}
                      className={`timepicker-option ${selectedMinute === minute ? 'timepicker-option-selected' : ''}`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="timepicker-error-message">
          {error}
        </p>
      )}
    </div>
  )
})

TimePicker.displayName = 'TimePicker'

export default TimePicker
