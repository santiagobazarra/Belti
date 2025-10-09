import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import {
  EnvelopeIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import Modal from '../../components/Modal'
import Card from '../../components/Card'
import DatePicker from '../../components/DatePicker'
import Select from 'react-select'
import List from '../../components/List'
import { SolicitudItem } from '../../components/ListItems'
import './css/Solicitudes.css'
import '../../components/css-components/modal-styles.css'
import '../../components/css-components/List.css'

const TIPOS_SOLICITUD = [
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'permiso', label: 'Permiso' },
  { value: 'baja_medica', label: 'Baja médica' },
  { value: 'otro', label: 'Otro' }
]

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'aprobada', label: 'Aprobada', color: 'green' },
  { value: 'rechazada', label: 'Rechazada', color: 'red' },
  { value: 'cancelada', label: 'Cancelada', color: 'gray' }
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
    caretColor: 'transparent',
    pointerEvents: 'none'
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

export default function Solicitudes() {
  const { user } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAprobarModal, setShowAprobarModal] = useState(false)
  const [showRechazarModal, setShowRechazarModal] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState(null)
  const [isResumenMode, setIsResumenMode] = useState(false)
  const [comentarioResolucion, setComentarioResolucion] = useState('')
  const [formData, setFormData] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo: 'vacaciones',
    motivo: ''
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
    setIsResumenMode(false)
    setSelectedSolicitud(null)
  }

  const handleAprobarModalClose = () => {
    setShowAprobarModal(false)
    setSelectedSolicitud(null)
    setComentarioResolucion('')
  }

  const handleRechazarModalClose = () => {
    setShowRechazarModal(false)
    setSelectedSolicitud(null)
    setComentarioResolucion('')
  }

  useEffect(() => {
    loadSolicitudes()
  }, [filters])

  const loadSolicitudes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const { data } = await api.get(`/solicitudes?${params}`)
      setSolicitudes(data.data || data)
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.tipo || !formData.fecha_inicio || !formData.fecha_fin || !formData.motivo) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    // Validar que fecha_fin sea posterior a fecha_inicio
    if (formData.fecha_inicio && formData.fecha_fin && formData.fecha_inicio > formData.fecha_fin) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    // Solo permitir editar solicitudes pendientes
    if (selectedSolicitud && selectedSolicitud.estado !== 'pendiente') {
      alert('Solo se pueden editar solicitudes pendientes')
      return
    }

    try {
      if (selectedSolicitud) {
        // El backend usa id_solicitud, no id
        const solicitudId = selectedSolicitud.id_solicitud || selectedSolicitud.id
        await api.patch(`/solicitudes/${solicitudId}`, formData)
      } else {
        await api.post('/solicitudes', formData)
      }

      setShowModal(false)
      setSelectedSolicitud(null)
      setFormData({
        fecha_inicio: '',
        fecha_fin: '',
        tipo: 'vacaciones',
        motivo: ''
      })
      loadSolicitudes()
    } catch (error) {
      console.error('Error al guardar solicitud:', error)
      alert('Error al guardar la solicitud')
    }
  }

  const handleAprobar = async () => {
    if (!selectedSolicitud) {
      console.error('❌ No hay solicitud seleccionada')
      return
    }

    try {
      // El backend usa id_solicitud, no id
      const solicitudId = selectedSolicitud.id_solicitud || selectedSolicitud.id
      await api.patch(`/solicitudes/${solicitudId}`, {
        estado: 'aprobada',
        comentario_resolucion: comentarioResolucion || ''
      })
      setShowAprobarModal(false)
      setSelectedSolicitud(null)
      setComentarioResolucion('')
      loadSolicitudes()
    } catch (error) {
      console.error('Error al aprobar solicitud:', error)
      alert('Error al aprobar la solicitud')
    }
  }

  const handleRechazar = async () => {
    if (!selectedSolicitud) {
      console.error('No hay solicitud seleccionada')
      return
    }

    try {
      // El backend usa id_solicitud, no id
      const solicitudId = selectedSolicitud.id_solicitud || selectedSolicitud.id
      await api.patch(`/solicitudes/${solicitudId}`, {
        estado: 'rechazada',
        comentario_resolucion: comentarioResolucion || ''
      })
      setShowRechazarModal(false)
      setSelectedSolicitud(null)
      setComentarioResolucion('')
      loadSolicitudes()
    } catch (error) {
      console.error('Error al rechazar solicitud:', error)
      alert('Error al rechazar la solicitud')
    }
  }

  const openAprobarModal = (solicitud) => {
    setSelectedSolicitud(solicitud)
    setComentarioResolucion('')
    setShowAprobarModal(true)
  }

  const openRechazarModal = (solicitud) => {
    setSelectedSolicitud(solicitud)
    setComentarioResolucion('')
    setShowRechazarModal(true)
  }

  const openModal = (solicitud = null) => {
    setIsResumenMode(false) // Modo edición
    if (solicitud) {
      setSelectedSolicitud(solicitud)
      // Inicializar formData siempre para evitar errores en DatePicker
      setFormData({
        fecha_inicio: solicitud.fecha_inicio || '',
        fecha_fin: solicitud.fecha_fin || '',
        tipo: solicitud.tipo || '',
        motivo: solicitud.motivo || ''
      });
    } else {
      setSelectedSolicitud(null)
      setFormData({
        fecha_inicio: '',
        fecha_fin: '',
        tipo: 'vacaciones',
        motivo: ''
      })
    }
    setShowModal(true)
  }

  const openDetalleModal = (solicitud) => {
    setIsResumenMode(true) // Modo resumen
    setSelectedSolicitud(solicitud)
    // Para el modal de detalles, inicializar formData para evitar errores en DatePicker
    setFormData({
      fecha_inicio: solicitud.fecha_inicio || '',
      fecha_fin: solicitud.fecha_fin || '',
      tipo: solicitud.tipo || '',
      motivo: solicitud.motivo || ''
    })
    setShowModal(true)
  }

  const calculateDays = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    const diffTime = Math.abs(fin - inicio)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const formatDateSafe = (dateString) => {
    if (!dateString || dateString === '') return '-'
    
    try {
      // Intentar crear la fecha directamente
      let date = new Date(dateString)
      
      // Si la fecha es inválida, intentar con formato YYYY-MM-DD
      if (isNaN(date.getTime())) {
        date = new Date(dateString + 'T00:00:00')
      }
      
      // Si sigue siendo inválida, devolver string original
      if (isNaN(date.getTime())) {
        return dateString
      }
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch (error) {
      return dateString || '-'
    }
  }

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
            {isAdmin ? 'Gestión de Solicitudes' : 'Mis Solicitudes'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Revisa y gestiona las solicitudes del personal' : 'Gestiona tus solicitudes de vacaciones y permisos'}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Solicitud
        </button>
      </div>

      {/* Filtros */}
      <Card variant="outlined" className="overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <Select
              components={{ DropdownIndicator }}
              styles={customSelectStyles}
              value={filters.estado ? { value: filters.estado, label: ESTADOS.find(e => e.value === filters.estado)?.label } : null}
              onChange={(option) => setFilters(prev => ({...prev, estado: option?.value || ''}))}
              options={ESTADOS.map(estado => ({ value: estado.value, label: estado.label }))}
              isClearable
              placeholder="Todos los estados"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <Select
              components={{ DropdownIndicator }}
              styles={customSelectStyles}
              value={filters.tipo ? { value: filters.tipo, label: TIPOS_SOLICITUD.find(t => t.value === filters.tipo)?.label } : null}
              onChange={(option) => setFilters(prev => ({...prev, tipo: option?.value || ''}))}
              options={TIPOS_SOLICITUD.map(tipo => ({ value: tipo.value, label: tipo.label }))}
              isClearable
              placeholder="Todos los tipos"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
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
                  setFilters(prev => ({...prev, desde: `${year}-${month}-${day}`}))
                } else {
                  setFilters(prev => ({...prev, desde: ''}))
                }
              }}
              placeholder="Fecha inicio"
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
                  setFilters(prev => ({...prev, hasta: `${year}-${month}-${day}`}))
                } else {
                  setFilters(prev => ({...prev, hasta: ''}))
                }
              }}
              placeholder="Fecha fin"
            />
          </div>
        </div>
      </Card>

      {/* Lista de solicitudes con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          <h3 className="list-title">{isAdmin ? 'Todas las Solicitudes' : 'Mis Solicitudes'}</h3>
          <span className="list-count">
            {loading ? (
              <div className="list-count-spinner">
                <div className="animate-spin"></div>
              </div>
            ) : (
              solicitudes.length
            )}
          </span>
        </div>

        {loading ? (
          <div className="list-loading">
            <div className="list-loading-icon">
              <div className="animate-spin"></div>
            </div>
            <div className="list-loading-title">Cargando solicitudes...</div>
            <div className="list-loading-message">Obteniendo datos del servidor</div>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="list-empty">
            <EnvelopeIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin solicitudes registradas</div>
            <div className="list-empty-message">No se encontraron solicitudes con los filtros seleccionados</div>
            <button
              onClick={() => openModal()}
              className="btn btn-primary btn-sm mt-3"
            >
              <PlusIcon className="icon-left" />
              Nueva Solicitud
            </button>
          </div>
        ) : (
          <div className="list-scrollable">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id_solicitud} className="list-item list-item-solicitud">
                <SolicitudItem
                  solicitud={solicitud}
                  isAdmin={isAdmin}
                  onAprobar={openAprobarModal}
                  onRechazar={openRechazarModal}
                  onEditar={openModal}
                  onVerDetalles={openDetalleModal}
                  TIPOS_SOLICITUD={TIPOS_SOLICITUD}
                  ESTADOS={ESTADOS}
                  calculateDays={calculateDays}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal premium para crear/editar solicitud */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={
          selectedSolicitud 
            ? (isResumenMode ? 'Resumen de Solicitud' : 'Editar Solicitud')
            : 'Nueva Solicitud'
        }
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        {selectedSolicitud && isResumenMode ? (
          /* Vista de resumen - estilo Incidencias */
          <div className="space-y-5">
            {/* Header con tipo y badge */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {TIPOS_SOLICITUD.find(t => t.value === selectedSolicitud.tipo)?.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDateSafe(selectedSolicitud.fecha_inicio)} - {formatDateSafe(selectedSolicitud.fecha_fin)}
                </p>
              </div>
              <span className={`solicitud-badge ${
                selectedSolicitud.estado === 'aprobada' ? 'success' :
                selectedSolicitud.estado === 'rechazada' ? 'danger' :
                selectedSolicitud.estado === 'cancelada' ? 'info' : 'warning'
              }`}>
                {ESTADOS.find(e => e.value === selectedSolicitud.estado)?.label}
              </span>
            </div>

            {/* Información estructurada */}
            <div className="space-y-0">
              {/* Usuario (solo si es admin) */}
              {isAdmin && selectedSolicitud.usuario && (
                <div className="modal-info-row">
                  <div className="modal-info-label">
                    <UserIcon />
                    Empleado
                  </div>
                  <div className="modal-info-value">
                    {selectedSolicitud.usuario.nombre} {selectedSolicitud.usuario.apellidos}
                  </div>
                </div>
              )}

              {/* Período */}
              <div className="modal-info-row">
                <div className="modal-info-label">
                  <CalendarDaysIcon />
                  Período
                </div>
                <div className="modal-info-value">
                  {formatDateSafe(selectedSolicitud.fecha_inicio)} - {formatDateSafe(selectedSolicitud.fecha_fin)}
                  {selectedSolicitud.fecha_inicio && selectedSolicitud.fecha_fin && (
                    <span className="text-blue-600 font-semibold ml-2">
                      ({calculateDays(selectedSolicitud.fecha_inicio, selectedSolicitud.fecha_fin)} días)
                    </span>
                  )}
                </div>
              </div>

              {/* Motivo */}
              {selectedSolicitud.motivo && (
                <div className="modal-info-row">
                  <div className="modal-info-label">
                    <DocumentTextIcon />
                    Motivo
                  </div>
                  <div className="modal-info-value">
                    {selectedSolicitud.motivo}
                  </div>
                </div>
              )}

              {/* Fecha de creación */}
              <div className="modal-info-row">
                <div className="modal-info-label">
                  <ClockIcon />
                  Creada
                </div>
                <div className="modal-info-value">
                  {selectedSolicitud.created_at ? 
                    formatDateSafe(selectedSolicitud.created_at) :
                    'Fecha no disponible'
                  }
                </div>
              </div>
            </div>

            {/* Comentario de resolución (destacado) */}
            {selectedSolicitud.comentario_resolucion && selectedSolicitud.estado === 'rechazada' && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XMarkIcon className="h-5 w-5 text-red-600" />
                  <span className="text-xs font-bold text-red-900 uppercase tracking-wide">
                    Motivo del Rechazo
                  </span>
                </div>
                <p className="text-sm text-red-900 leading-relaxed font-medium">
                  {selectedSolicitud.comentario_resolucion}
                </p>
              </div>
            )}

            {selectedSolicitud.comentario_resolucion && selectedSolicitud.estado === 'aprobada' && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-bold text-green-900 uppercase tracking-wide">
                    Comentario de Aprobación
                  </span>
                </div>
                <p className="text-sm text-green-900 leading-relaxed font-medium">
                  {selectedSolicitud.comentario_resolucion}
                </p>
              </div>
            )}

            {selectedSolicitud.estado === 'pendiente' && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="h-5 w-5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Estado de la Solicitud
                  </span>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                  Esta solicitud está pendiente de revisión y aprobación por parte del administrador.
                </p>
              </div>
            )}

            {/* Resolutor y fecha */}
            {selectedSolicitud.aprobador && selectedSolicitud.fecha_resolucion && (
              <div className="pt-4 pb-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserIcon className="h-4 w-4" />
                    <span>{selectedSolicitud.estado === 'aprobada' ? 'Aprobada por:' : 'Rechazada por:'}</span>
                    <span className="font-semibold text-gray-900">
                      {selectedSolicitud.aprobador.nombre} {selectedSolicitud.aprobador.apellidos}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {formatDateSafe(selectedSolicitud.fecha_resolucion)}
                  </span>
                </div>
              </div>
            )}

            {/* Botones de acción - Solo para solicitudes pendientes */}
            {selectedSolicitud.estado === 'pendiente' && (
              <div className="modal-footer">
                {!isAdmin && (
                  <button
                    type="button"
                    onClick={() => openModal(selectedSolicitud)}
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
                      onClick={() => openAprobarModal(selectedSolicitud)}
                      className="btn btn-success"
                    >
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => openRechazarModal(selectedSolicitud)}
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
        ) : selectedSolicitud && selectedSolicitud.estado !== 'pendiente' ? (
          /* Vista de detalles para solicitudes procesadas */
          <div className="modal-elegant">
            {/* Header con Estado */}
            <div className="detail-header">
              <h3 className="detail-title">Detalles de la Solicitud</h3>
              <span className={`solicitud-badge ${
                selectedSolicitud.estado === 'aprobada' ? 'success' :
                selectedSolicitud.estado === 'rechazada' ? 'danger' :
                selectedSolicitud.estado === 'cancelada' ? 'info' : 'warning'
              }`}>
                {ESTADOS.find(e => e.value === selectedSolicitud.estado)?.label}
              </span>
            </div>

            {/* Información Principal */}
            <div className="detail-info">
              {/* Tipo y Duración */}
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Tipo</span>
                  <span className="detail-value">
                    {TIPOS_SOLICITUD.find(t => t.value === selectedSolicitud.tipo)?.label}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duración</span>
                  <span className="detail-value">
                    {calculateDays(selectedSolicitud.fecha_inicio, selectedSolicitud.fecha_fin)} días
                  </span>
                </div>
              </div>

              {/* Fechas */}
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-label">Fecha Inicio</span>
                  <span className="detail-value">
                    {new Date(selectedSolicitud.fecha_inicio).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fecha Fin</span>
                  <span className="detail-value">
                    {new Date(selectedSolicitud.fecha_fin).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Solicitante (Admin) */}
              {isAdmin && selectedSolicitud.usuario && (
                <div className="detail-row single">
                  <div className="detail-item">
                    <span className="detail-label">Solicitante</span>
                    <span className="detail-value">
                      {selectedSolicitud.usuario.nombre} {selectedSolicitud.usuario.apellidos}
                    </span>
                  </div>
                </div>
              )}

              {/* Motivo */}
              <div className="detail-row single">
                <div className="detail-item full">
                  <span className="detail-label">Motivo</span>
                  <p className="detail-text">
                    {selectedSolicitud.motivo || 'Sin motivo especificado'}
                  </p>
                </div>
              </div>

              {/* Resolución */}
              {selectedSolicitud.estado !== 'pendiente' && selectedSolicitud.estado !== 'cancelada' && (
                <div className={`detail-resolution ${selectedSolicitud.estado}`}>
                  <div className="resolution-header">
                    <span className="resolution-label">
                      {selectedSolicitud.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
                      {selectedSolicitud.fecha_resolucion && (
                        <span className="resolution-date">
                          {' · '}{new Date(selectedSolicitud.fecha_resolucion).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </span>
                  </div>

                  {selectedSolicitud.comentario_resolucion && (
                    <div className="resolution-comment">
                      <p>{selectedSolicitud.comentario_resolucion}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Resolutor y fecha - Similar a incidencias */}
              {selectedSolicitud.estado !== 'pendiente' && selectedSolicitud.estado !== 'cancelada' && (
                <div className="pt-4 pb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserIcon className="h-4 w-4" />
                      <span>{selectedSolicitud.estado === 'aprobada' ? 'Aprobada por:' : 'Rechazada por:'}</span>
                      <span className="font-semibold text-gray-900">
                        {selectedSolicitud.aprobador ? 
                          `${selectedSolicitud.aprobador.nombre} ${selectedSolicitud.aprobador.apellidos}` :
                          'Usuario no disponible'
                        }
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {selectedSolicitud.fecha_resolucion ? 
                        new Date(selectedSolicitud.fecha_resolucion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) :
                        'Fecha no disponible'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Formulario de creación/edición */
          <form onSubmit={handleSubmit} className="modal-elegant">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Solicitud <span className="required">*</span>
                </label>
                <Select
                  components={{ DropdownIndicator }}
                  styles={customSelectStyles}
                  value={TIPOS_SOLICITUD.find(t => t.value === formData.tipo) ? { value: formData.tipo, label: TIPOS_SOLICITUD.find(t => t.value === formData.tipo)?.label } : null}
                  onChange={(option) => setFormData(prev => ({...prev, tipo: option.value}))}
                  options={TIPOS_SOLICITUD.map(tipo => ({ value: tipo.value, label: tipo.label }))}
                  placeholder="Selecciona un tipo"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable={false}
                />
              </div>

              <div className="modal-form-grid cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio <span className="required">*</span>
                  </label>
                  <DatePicker
                    selected={createDateFromString(formData.fecha_inicio)}
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setFormData(prev => ({...prev, fecha_inicio: `${year}-${month}-${day}`}))
                      } else {
                        setFormData(prev => ({...prev, fecha_inicio: ''}))
                      }
                    }}
                    placeholder="Selecciona fecha"
                    required
                    popperPlacement="bottom-start"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin <span className="required">*</span>
                  </label>
                  <DatePicker
                    selected={createDateFromString(formData.fecha_fin)}
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setFormData(prev => ({...prev, fecha_fin: `${year}-${month}-${day}`}))
                      } else {
                        setFormData(prev => ({...prev, fecha_fin: ''}))
                      }
                    }}
                    placeholder="Selecciona fecha"
                    required
                    popperClassName="custom-popper-right"
                    popperPlacement="bottom-end"
                  />
                </div>
              </div>

              {formData.fecha_inicio && formData.fecha_fin && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        Duración calculada
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {calculateDays(formData.fecha_inicio, formData.fecha_fin)} días
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de la Solicitud <span className="required">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData(prev => ({...prev, motivo: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Describe el motivo detallado de tu solicitud..."
                />
                <div className="modal-field-help" style={{ marginBottom: '1.5rem' }}>
                  Explica claramente el motivo de tu solicitud para facilitar la aprobación
                </div>
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
                {selectedSolicitud ? 'Actualizar Solicitud' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal de confirmación para APROBAR */}
      <Modal
        isOpen={showAprobarModal}
        onClose={handleAprobarModalClose}
        title="Aprobar Solicitud"
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        <div className="modal-elegant">
          <div className="modal-confirm-approve">
            <div className="flex gap-4">
              <div className="modal-confirm-icon">
                <CheckIcon />
              </div>
              <div className="flex-1">
                <h3>¿Aprobar esta solicitud?</h3>
                <p>
                  Estás a punto de aprobar la solicitud de{' '}
                  <strong>{selectedSolicitud?.usuario?.nombre} {selectedSolicitud?.usuario?.apellidos}</strong>
                  {' para '}<strong>{TIPOS_SOLICITUD.find(t => t.value === selectedSolicitud?.tipo)?.label}</strong>
                  {' del '}
                  <strong>
                    {selectedSolicitud && new Date(selectedSolicitud.fecha_inicio).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </strong>
                  {' al '}
                  <strong>
                    {selectedSolicitud && new Date(selectedSolicitud.fecha_fin).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </strong>
                  {' ('}
                  <strong>
                    {selectedSolicitud && calculateDays(selectedSolicitud.fecha_inicio, selectedSolicitud.fecha_fin)} días
                  </strong>
                  {').'}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario de aprobación (opcional)
              </label>
              <textarea
                rows="3"
                value={comentarioResolucion}
                onChange={(e) => setComentarioResolucion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Añade un comentario para el empleado (opcional)..."
              />
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
              Aprobar Solicitud
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación para RECHAZAR */}
      <Modal
        isOpen={showRechazarModal}
        onClose={handleRechazarModalClose}
        title="Rechazar Solicitud"
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        <div className="modal-elegant">
          <div className="modal-confirm-reject">
            <div className="flex gap-4">
              <div className="modal-confirm-icon">
                <XMarkIcon />
              </div>
              <div className="flex-1">
                <h3>¿Rechazar esta solicitud?</h3>
                <p>
                  Estás a punto de rechazar la solicitud de{' '}
                  <strong>{selectedSolicitud?.usuario?.nombre} {selectedSolicitud?.usuario?.apellidos}</strong>
                  {' para '}<strong>{TIPOS_SOLICITUD.find(t => t.value === selectedSolicitud?.tipo)?.label}</strong>
                  {' del '}
                  <strong>
                    {selectedSolicitud && new Date(selectedSolicitud.fecha_inicio).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </strong>
                  {' al '}
                  <strong>
                    {selectedSolicitud && new Date(selectedSolicitud.fecha_fin).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </strong>
                  {' ('}
                  <strong>
                    {selectedSolicitud && calculateDays(selectedSolicitud.fecha_inicio, selectedSolicitud.fecha_fin)} días
                  </strong>
                  {').'}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo (opcional)
              </label>
              <textarea
                rows="3"
                value={comentarioResolucion}
                onChange={(e) => setComentarioResolucion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Explica el motivo del rechazo (opcional pero recomendado)..."
              />
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
              Rechazar Solicitud
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
