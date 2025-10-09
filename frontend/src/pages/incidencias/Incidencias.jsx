import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import {
  ExclamationTriangleIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  EyeIcon,
  CalendarDaysIcon,
  UserIcon,
  DocumentTextIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import Modal from '../../components/Modal'
import Select from 'react-select'
import DatePicker from '../../components/DatePicker'
import TimePicker from '../../components/TimePicker'
import Card from '../../components/Card'
import Toast from '../../components/Toast'
import List from '../../components/List'
import { IncidenciaItem } from '../../components/ListItems'
import './css/Incidencias.css'
import '../../components/css-components/modal-styles.css'
import '../../components/css-components/List.css'

const TIPOS_INCIDENCIA = [
  { value: 'falta', label: 'Falta' },
  { value: 'retraso', label: 'Retraso' },
  { value: 'ausencia_parcial', label: 'Ausencia parcial' },
  { value: 'anomalia_horas', label: 'Anomalía en horas' },
  { value: 'otra', label: 'Otra' }
]

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'aprobada', label: 'Aprobada', color: 'green' },
  { value: 'rechazada', label: 'Rechazada', color: 'red' }
]

// Componente personalizado para el indicador (flecha) del Select
const DropdownIndicator = (props) => {
  return (
    <div style={{ 
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      transform: props.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      color: props.isFocused ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)'
    }}>
      <ChevronDownIcon style={{ width: '1.25rem', height: '1.25rem' }} />
    </div>
  )
}

// Estilos personalizados para React Select - Diseño mejorado y limpio
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '44px',
    borderRadius: '12px',
    borderColor: state.isFocused ? 'rgb(59, 130, 246)' : 'rgb(209, 213, 219)',
    borderWidth: '1px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
    backgroundColor: 'white',
    '&:hover': {
      borderColor: state.isFocused ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)'
    },
    transition: 'all 0.2s',
    cursor: 'pointer',
    padding: '0 4px'
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 12px'
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: 'transparent',
    caretColor: 'transparent'
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
    fontSize: '0.875rem'
  }),
  singleValue: (base) => ({
    ...base,
    color: 'rgb(17, 24, 39)',
    fontSize: '0.875rem',
    fontWeight: '500'
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  dropdownIndicator: () => ({
    // Estilos manejados por el componente personalizado
    padding: 0,
    display: 'flex'
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
    padding: '8px',
    cursor: 'pointer',
    '&:hover': {
      color: 'rgb(239, 68, 68)'
    }
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgb(229, 231, 235)',
    overflow: 'hidden',
    marginTop: '8px',
    zIndex: 40 // Menor que modal (z-index: 50) pero mayor que card (z-index: 1)
  }),
  menuList: (base) => ({
    ...base,
    padding: '8px',
    maxHeight: '300px'
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '8px',
    padding: '10px 12px',
    margin: '2px 0',
    backgroundColor: state.isSelected 
      ? 'rgb(59, 130, 246)' 
      : state.isFocused 
      ? 'rgb(239, 246, 255)' 
      : 'transparent',
    color: state.isSelected ? 'white' : 'rgb(17, 24, 39)',
    fontSize: '0.875rem',
    fontWeight: state.isSelected ? '600' : '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    '&:active': {
      backgroundColor: state.isSelected ? 'rgb(37, 99, 235)' : 'rgb(219, 234, 254)'
    }
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 40 // Menor que modal (z-index: 50) pero mayor que card (z-index: 1)
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
    fontSize: '0.875rem',
    padding: '12px'
  })
}

export default function Incidencias() {
  const { user } = useAuth()
  const [incidencias, setIncidencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAprobarModal, setShowAprobarModal] = useState(false)
  const [showRechazarModal, setShowRechazarModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [selectedIncidencia, setSelectedIncidencia] = useState(null)
  const [isResumenMode, setIsResumenMode] = useState(false)
  const [comentarioRechazo, setComentarioRechazo] = useState('')
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' })
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'falta',
    descripcion: '',
    hora_inicio: '',
    hora_fin: ''
  })
  const [filters, setFilters] = useState({
    estado: '',
    tipo: '',
    desde: '',
    hasta: ''
  })

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'


  // Funciones de cierre simples
  const handleModalClose = () => {
    setShowModal(false)
    setSelectedIncidencia(null)
  }

  const handleDetalleModalClose = () => {
    setShowDetalleModal(false)
    setIsResumenMode(false)
    setSelectedIncidencia(null)
  }

  const handleAprobarModalClose = () => {
    setShowAprobarModal(false)
    setSelectedIncidencia(null)
    setComentarioRechazo('')
  }

  const handleRechazarModalClose = () => {
    setShowRechazarModal(false)
    setSelectedIncidencia(null)
    setComentarioRechazo('')
  }

  useEffect(() => {
    loadIncidencias()
  }, [filters])

  const loadIncidencias = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const { data } = await api.get(`/incidencias?${params}`)
      setIncidencias(data.data || data)
    } catch (error) {
      console.error('Error al cargar incidencias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar que las horas estén presentes (obligatorias para aprobar)
    if (!formData.hora_inicio || !formData.hora_fin) {
      setToast({
        show: true,
        type: 'error',
        message: 'El rango horario es obligatorio para que la incidencia pueda ser aprobada.'
      })
      return
    }

    // Validar que hora_fin sea posterior a hora_inicio
    if (formData.hora_inicio >= formData.hora_fin) {
      setToast({
        show: true,
        type: 'error',
        message: 'La hora de fin debe ser posterior a la hora de inicio.'
      })
      return
    }

    try {
      const payload = { ...formData }
      const isEditing = !!selectedIncidencia

      if (isEditing) {
        await api.patch(`/incidencias/${selectedIncidencia.id_incidencia}`, payload)
      } else {
        await api.post('/incidencias', payload)
      }

      setShowModal(false)
      setSelectedIncidencia(null)
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'falta',
        descripcion: '',
        hora_inicio: '',
        hora_fin: ''
      })

      setToast({
        show: true,
        type: 'success',
        message: isEditing ? 'Incidencia actualizada correctamente' : 'Incidencia creada correctamente'
      })

      loadIncidencias()
    } catch (error) {
      console.error('Error al guardar incidencia:', error)
      setToast({
        show: true,
        type: 'error',
        message: 'Error al guardar la incidencia. Inténtalo de nuevo.'
      })
    }
  }

  const handleAprobar = async () => {
    try {
      await api.patch(`/incidencias/${selectedIncidencia.id_incidencia}/aprobar`)
      setShowAprobarModal(false)
      setSelectedIncidencia(null)
      setToast({
        show: true,
        type: 'success',
        message: 'Incidencia aprobada correctamente'
      })
      loadIncidencias()
    } catch (error) {
      console.error('Error al aprobar incidencia:', error)
      
      // Extraer mensaje de error específico del servidor
      let errorMessage = 'Error al aprobar la incidencia. Inténtalo de nuevo.'
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      setToast({
        show: true,
        type: 'error',
        message: errorMessage
      })
    }
  }

  const handleRechazar = async () => {
    try {
      await api.patch(`/incidencias/${selectedIncidencia.id_incidencia}`, {
        estado: 'rechazada',
        comentario_revision: comentarioRechazo || ''
      })
      setShowRechazarModal(false)
      setSelectedIncidencia(null)
      setComentarioRechazo('')
      setToast({
        show: true,
        type: 'success',
        message: 'Incidencia rechazada correctamente'
      })
      loadIncidencias()
    } catch (error) {
      console.error('Error al rechazar incidencia:', error)
      
      // Extraer mensaje de error específico del servidor
      let errorMessage = 'Error al rechazar la incidencia. Inténtalo de nuevo.'
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      setToast({
        show: true,
        type: 'error',
        message: errorMessage
      })
    }
  }

  const openAprobarModal = (incidencia) => {
    setSelectedIncidencia(incidencia)
    setShowAprobarModal(true)
  }

  const openRechazarModal = (incidencia) => {
    setSelectedIncidencia(incidencia)
    setComentarioRechazo('')
    setShowRechazarModal(true)
  }

  const openDetalleModal = (incidencia) => {
    setIsResumenMode(true) // Modo resumen
    setSelectedIncidencia(incidencia)
    setShowDetalleModal(true)
  }

  const openModal = (incidencia = null) => {
    setIsResumenMode(false) // Modo edición
    if (incidencia) {
      setSelectedIncidencia(incidencia)
      setFormData({
        fecha: incidencia.fecha || '',
        tipo: incidencia.tipo || 'falta',
        descripcion: incidencia.descripcion || '',
        hora_inicio: incidencia.hora_inicio?.slice(11, 16) || '',
        hora_fin: incidencia.hora_fin?.slice(11, 16) || ''
      })
    } else {
      setSelectedIncidencia(null)
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'falta',
        descripcion: '',
        hora_inicio: '',
        hora_fin: ''
      })
    }
    setShowModal(true)
  }

  // Todos los tipos de incidencia requieren rango horario para poder ser aprobadas
  // ya que al aprobar se registran como horas trabajadas en la jornada
  const requiresHours = true // Siempre true para cumplir normativa

  const createDateFromString = (dateString) => {
    if (!dateString || dateString === '') return null
    
    try {
      // Si ya es formato ISO completo, usarlo directamente
      let dateStr = dateString;
      
      // Si es solo YYYY-MM-DD, agregar T00:00:00
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        dateStr = dateString + 'T00:00:00';
      }
      
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) ? date : null;
    } catch (error) {
      return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gestión de Incidencias' : 'Mis Incidencias'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Revisa y gestiona las incidencias del personal' : 'Gestiona tus incidencias laborales'}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Incidencia
        </button>
      </div>

      {/* Filtros con componentes mejorados */}
      <Card className="card-interactive overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <Select
              value={ESTADOS.find(e => e.value === filters.estado) || null}
              onChange={(option) => setFilters(prev => ({...prev, estado: option?.value || ''}))}
              options={ESTADOS}
              isClearable
              isSearchable={false}
              placeholder="Todos los estados"
              styles={customSelectStyles}
              components={{ DropdownIndicator }}
              noOptionsMessage={() => 'No hay opciones'}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <Select
              value={TIPOS_INCIDENCIA.find(t => t.value === filters.tipo) || null}
              onChange={(option) => setFilters(prev => ({...prev, tipo: option?.value || ''}))}
              options={TIPOS_INCIDENCIA}
              isClearable
              isSearchable={false}
              placeholder="Todos los tipos"
              styles={customSelectStyles}
              components={{ DropdownIndicator }}
              noOptionsMessage={() => 'No hay opciones'}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde
            </label>
            <DatePicker
              selected={createDateFromString(filters.desde)}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  setFilters(prev => ({
                    ...prev, 
                    desde: `${year}-${month}-${day}`
                  }))
                } else {
                  setFilters(prev => ({...prev, desde: ''}))
                }
              }}
              placeholder="Seleccionar fecha"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta
            </label>
            <DatePicker
              selected={createDateFromString(filters.hasta)}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  setFilters(prev => ({
                    ...prev, 
                    hasta: `${year}-${month}-${day}`
                  }))
                } else {
                  setFilters(prev => ({...prev, hasta: ''}))
                }
              }}
              placeholder="Seleccionar fecha"
            />
          </div>
        </div>
      </Card>

      {/* Lista de incidencias - Diseño limpio y profesional */}
      <div className="list">
        <div className="list-header">
          <h3 className="list-title">{isAdmin ? 'Todas las Incidencias' : 'Mis Incidencias'}</h3>
          <span className="list-count">
            {loading ? (
              <div className="list-count-spinner">
                <div className="animate-spin"></div>
              </div>
            ) : (
              incidencias.length
            )}
          </span>
        </div>

        {loading ? (
          <div className="list-loading">
            <div className="list-loading-icon">
              <div className="animate-spin"></div>
            </div>
            <div className="list-loading-title">Cargando incidencias...</div>
            <div className="list-loading-message">Obteniendo datos del servidor</div>
          </div>
        ) : incidencias.length === 0 ? (
          <div className="list-empty">
            <ExclamationTriangleIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin incidencias registradas</div>
            <div className="list-empty-message">No se encontraron incidencias con los filtros seleccionados</div>
            <button
              onClick={() => openModal()}
              className="btn btn-primary btn-sm mt-3"
            >
              <PlusIcon className="icon-left" />
              Nueva Incidencia
            </button>
          </div>
        ) : (
          <div className="list-scrollable">
            {incidencias.map((incidencia) => (
              <div key={incidencia.id_incidencia} className="list-item list-item-incidencia">
                <IncidenciaItem
                  incidencia={incidencia}
                  isAdmin={isAdmin}
                  onAprobar={openAprobarModal}
                  onRechazar={openRechazarModal}
                  onEditar={openModal}
                  onVerDetalles={openDetalleModal}
                  TIPOS_INCIDENCIA={TIPOS_INCIDENCIA}
                  ESTADOS={ESTADOS}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal premium para crear/editar incidencia */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedIncidencia ? 'Editar Incidencia' : 'Nueva Incidencia'}
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>
              Fecha <span className="required">*</span>
            </label>
            <DatePicker
              selected={createDateFromString(formData.fecha)}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  setFormData(prev => ({
                    ...prev, 
                    fecha: `${year}-${month}-${day}`
                  }))
                }
              }}
              placeholder="Seleccionar fecha"
            />
          </div>

          <div>
            <label>
              Tipo de Incidencia <span className="required">*</span>
            </label>
            <Select
              value={TIPOS_INCIDENCIA.find(t => t.value === formData.tipo)}
              onChange={(option) => setFormData(prev => ({...prev, tipo: option.value}))}
              options={TIPOS_INCIDENCIA}
              isSearchable={false}
              styles={customSelectStyles}
              components={{ DropdownIndicator }}
              placeholder="Seleccionar tipo"
              noOptionsMessage={() => 'No hay opciones'}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          {requiresHours && (
            <>
              <div className="modal-form-grid cols-2">
                <div>
                  <TimePicker
                    label="Hora Inicio"
                    value={formData.hora_inicio}
                    onChange={(value) => setFormData(prev => ({...prev, hora_inicio: value || ''}))}
                    required={requiresHours}
                  />
                </div>
                <div>
                  <TimePicker
                    label="Hora Fin"
                    value={formData.hora_fin}
                    onChange={(value) => setFormData(prev => ({...prev, hora_fin: value || ''}))}
                    required={requiresHours}
                  />
                </div>
              </div>
              <div className="modal-field-help" style={{ marginTop: '-0.75rem' }}>
                ⚠️ El rango horario es obligatorio para que la incidencia pueda ser aprobada y registrada como tiempo trabajado según normativa.
              </div>
            </>
          )}

          <div>
            <label>Descripción</label>
            <textarea
              rows="4"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({...prev, descripcion: e.target.value}))}
              placeholder="Describe los detalles de la incidencia..."
            />
            <div className="modal-field-help">
              Proporciona detalles adicionales que ayuden en la revisión de la incidencia
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleModalClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedIncidencia ? 'Actualizar' : 'Crear Incidencia'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación para aprobar */}
      <Modal
        isOpen={showAprobarModal}
        onClose={handleAprobarModalClose}
        title="Aprobar Incidencia"
        size="sm"
        variant="elegant"
        animationType="fade-scale"
      >
        <div className="modal-confirm-approve space-y-4">
          <div className="flex items-start gap-4">
            <div className="modal-confirm-icon">
              <CheckIcon />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                ¿Confirmar aprobación?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Vas a aprobar la incidencia de tipo{' '}
                <strong>
                  {selectedIncidencia && TIPOS_INCIDENCIA.find(t => t.value === selectedIncidencia.tipo)?.label}
                </strong>
                {selectedIncidencia?.usuario && (
                  <> de{' '}
                    <strong>
                      {selectedIncidencia.usuario.nombre} {selectedIncidencia.usuario.apellidos}
                    </strong>
                  </>
                )} del día{' '}
                <strong>
                  {selectedIncidencia && new Date(selectedIncidencia.fecha).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </strong>.
              </p>
              {selectedIncidencia?.hora_inicio && selectedIncidencia?.hora_fin && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    📋 Registro en jornada:
                  </p>
                  <p className="text-sm text-blue-800">
                    Se registrarán las horas de{' '}
                    <strong>{selectedIncidencia.hora_inicio.slice(11, 16)}</strong>
                    {' '}a{' '}
                    <strong>{selectedIncidencia.hora_fin.slice(11, 16)}</strong>
                    {' '}como tiempo trabajado según normativa.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleAprobarModalClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAprobar}
              className="btn btn-success"
            >
              <CheckIcon className="h-5 w-5 mr-2" />
              Aprobar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación para rechazar */}
      <Modal
        isOpen={showRechazarModal}
        onClose={handleRechazarModalClose}
        title="Rechazar Incidencia"
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        <div className="modal-confirm-reject space-y-4">
          <div className="flex items-start gap-4">
            <div className="modal-confirm-icon">
              <XMarkIcon />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                ¿Confirmar rechazo?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Vas a rechazar la incidencia de tipo{' '}
                <strong>
                  {selectedIncidencia && TIPOS_INCIDENCIA.find(t => t.value === selectedIncidencia.tipo)?.label}
                </strong>
                {selectedIncidencia?.usuario && (
                  <> de{' '}
                    <strong>
                      {selectedIncidencia.usuario.nombre} {selectedIncidencia.usuario.apellidos}
                    </strong>
                  </>
                )} del día{' '}
                <strong>
                  {selectedIncidencia && new Date(selectedIncidencia.fecha).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </strong>.
              </p>
            </div>
          </div>

          <div>
            <label>Motivo del Rechazo</label>
            <textarea
              rows="4"
              value={comentarioRechazo}
              onChange={(e) => setComentarioRechazo(e.target.value)}
              placeholder="Explica el motivo del rechazo..."
            />
            <div className="modal-field-help">
              Proporciona una explicación clara para ayudar al empleado a comprender el motivo
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleRechazarModalClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleRechazar}
              className="btn btn-danger"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              Rechazar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de detalles de incidencia */}
      <Modal
        isOpen={showDetalleModal}
        onClose={handleDetalleModalClose}
        title={isResumenMode ? 'Resumen de la Incidencia' : 'Detalles de la Incidencia'}
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        {selectedIncidencia && (
          <div className="space-y-5">
            {/* Header con tipo y badge */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {TIPOS_INCIDENCIA.find(t => t.value === selectedIncidencia.tipo)?.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedIncidencia.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <span className={`incidencia-badge ${
                selectedIncidencia.estado === 'aprobada' ? 'success' :
                selectedIncidencia.estado === 'rechazada' ? 'danger' : 'warning'
              }`}>
                {ESTADOS.find(e => e.value === selectedIncidencia.estado)?.label}
              </span>
            </div>

            {/* Información estructurada */}
            <div className="space-y-0">
              {/* Usuario */}
              {selectedIncidencia.usuario && (
                <div className="modal-info-row" >
                  <div className="modal-info-label">
                    <UserIcon />
                    Empleado
                  </div>
                  <div className="modal-info-value">
                    {selectedIncidencia.usuario.nombre} {selectedIncidencia.usuario.apellidos}
                  </div>
                </div>
              )}

              {/* Horario (si aplica) */}
              {(selectedIncidencia.hora_inicio || selectedIncidencia.hora_fin) && (
                <div className="modal-info-row">
                  <div className="modal-info-label">
                    <ClockIcon />
                    Horario
                  </div>
                  <div className="modal-info-value">
                    {selectedIncidencia.hora_inicio?.slice(11, 16)} - {selectedIncidencia.hora_fin?.slice(11, 16)}
                  </div>
                </div>
              )}

              {/* Descripción */}
              {selectedIncidencia.descripcion && (
                <div className="modal-info-row">
                  <div className="modal-info-label">
                    <DocumentTextIcon />
                    Descripción
                  </div>
                  <div className="modal-info-value">
                    {selectedIncidencia.descripcion}
                  </div>
                </div>
              )}
            </div>

            {/* Comentario de revisión o Motivo de rechazo (destacado) */}
            {selectedIncidencia.comentario_revision && selectedIncidencia.estado === 'rechazada' && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XMarkIcon className="h-5 w-5 text-red-600" />
                  <span className="text-xs font-bold text-red-900 uppercase tracking-wide">
                    Motivo del Rechazo
                  </span>
                </div>
                <p className="text-sm text-red-900 leading-relaxed font-medium">
                  {selectedIncidencia.comentario_revision}
                </p>
              </div>
            )}

            {selectedIncidencia.comentario_revision && selectedIncidencia.estado === 'aprobada' && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-bold text-green-900 uppercase tracking-wide">
                    Comentario de Aprobación
                  </span>
                </div>
                <p className="text-sm text-green-900 leading-relaxed font-medium">
                  {selectedIncidencia.comentario_revision}
                </p>
              </div>
            )}

            {selectedIncidencia.comentario_revision && selectedIncidencia.estado === 'pendiente' && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Comentario de Revisión
                  </span>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                  {selectedIncidencia.comentario_revision}
                </p>
              </div>
            )}

            {/* Estado pendiente sin comentario */}
            {!selectedIncidencia.comentario_revision && selectedIncidencia.estado === 'pendiente' && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="h-5 w-5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Estado de la Incidencia
                  </span>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                  Esta incidencia está pendiente de revisión y aprobación por parte del administrador.
                </p>
              </div>
            )}

            {/* Estado aprobado sin comentario */}
            {!selectedIncidencia.comentario_revision && selectedIncidencia.estado === 'aprobada' && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-bold text-green-900 uppercase tracking-wide">
                    Incidencia Aprobada
                  </span>
                </div>
                <p className="text-sm text-green-900 leading-relaxed font-medium">
                  Esta incidencia ha sido aprobada por el administrador.
                </p>
              </div>
            )}

            {/* Revisor y fecha */}
            {selectedIncidencia.revisor && selectedIncidencia.fecha_revision && (
              <div className="pt-4 pb-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserIcon className="h-4 w-4" />
                    <span>Revisado por:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedIncidencia.revisor.nombre} {selectedIncidencia.revisor.apellidos}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(selectedIncidencia.fecha_revision).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Botones de acción - Solo para incidencias pendientes */}
            {selectedIncidencia.estado === 'pendiente' && (
              <div className="modal-footer">
                {!isAdmin && (
                    <button
                      type="button"
                      onClick={() => openModal(selectedIncidencia)}
                      className="btn btn-primary"
                    >
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Editar
                    </button>
                )}
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => openAprobarModal(selectedIncidencia)}
                      className="btn btn-success"
                    >
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => openRechazarModal(selectedIncidencia)}
                      className="btn btn-danger"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Toast de notificación */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={4000}
        position="bottom-right"
      />
    </div>
  )
}
