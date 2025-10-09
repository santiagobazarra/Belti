import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import DatePicker from '../../components/DatePicker'
import Select from 'react-select'
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import './css/Festivos.css'
import '../../components/css-components/modal-styles.css'
import '../../components/css-components/List.css'

const TIPOS_FESTIVO = [
  { value: 'nacional', label: 'Nacional' },
  { value: 'regional', label: 'Regional' },
  { value: 'local', label: 'Local' },
  { value: 'empresa', label: 'Empresa' }
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
    zIndex: 40
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
    zIndex: 40
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
    fontSize: '0.875rem',
    padding: '12px'
  })
}

// Componente FestivoItem con diseño moderno
const FestivoItem = ({ festivo, isAdmin, onEditar, onEliminar, onVerDetalles, TIPOS_FESTIVO }) => {
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFestivoStatus = (fecha) => {
    const festivoDate = new Date(fecha)
    const today = new Date()
    const currentYear = today.getFullYear()
    
    if (festivoDate > today) {
      return { label: 'Próximo', class: 'info' }
    } else if (festivoDate.getFullYear() === currentYear) {
      return { label: 'Este año', class: 'success' }
    } else {
      return { label: `Año ${festivoDate.getFullYear()}`, class: 'warning' }
    }
  }

  const status = getFestivoStatus(festivo.fecha)

  return (
    <>
      {/* COLUMNA IZQUIERDA: Fecha minimalista con indicador */}
      <div className="list-date-col">
        <div className="list-date">
          <div className="list-day">
            {new Date(festivo.fecha).toLocaleDateString('es-ES', {
              weekday: 'short'
            })}
          </div>
          <div className="list-date-number">
            {new Date(festivo.fecha).getDate()}
          </div>
          <div className="list-month">
            {new Date(festivo.fecha).toLocaleDateString('es-ES', {
              month: 'short'
            })}
          </div>
        </div>
        <div className={`list-status-indicator ${status.class}`}></div>
      </div>

      {/* COLUMNA CENTRAL: Información principal */}
      <div className="list-info-col">
        <div className="list-header-row">
          <h4 className="list-tipo">{festivo.descripcion}</h4>
          <span className={`list-badge list-badge-${status.class}`}>
            {status.label}
          </span>
        </div>

        <div className="list-descripcion">
          {formatFecha(festivo.fecha)}
        </div>
      </div>

      {/* COLUMNA DERECHA: Acciones */}
      <div className="list-actions-col">
        <span className={`festivo-badge ${
          festivo.tipo === 'nacional' ? 'danger' :
          festivo.tipo === 'regional' ? 'info' :
          festivo.tipo === 'local' ? 'success' : 'warning'
        }`}>
          {TIPOS_FESTIVO.find(t => t.value === festivo.tipo)?.label || festivo.tipo}
        </span>

        {isAdmin && (
          <>
            <button
              onClick={() => onEditar(festivo)}
              className="list-btn-icon list-btn-icon-primary"
              title="Editar"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => onEliminar(festivo)}
              className="list-btn-icon list-btn-icon-danger"
              title="Eliminar"
            >
              <TrashIcon />
            </button>
          </>
        )}

        <button
          onClick={() => onVerDetalles(festivo)}
          className="list-btn-resumen"
          title="Ver detalles"
        >
          <EyeIcon />
          <span>Detalles</span>
        </button>
      </div>
    </>
  )
}

export default function Festivos() {
  const { user } = useAuth()
  const [festivos, setFestivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [selectedFestivo, setSelectedFestivo] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [festivoToDelete, setFestivoToDelete] = useState(null)
  const [formData, setFormData] = useState({
    fecha: '',
    descripcion: '',
    tipo: 'nacional'
  })

  useEffect(() => {
    loadFestivos()
  }, [])

  const loadFestivos = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/festivos')
      setFestivos(data.data || data)
    } catch (error) {
      console.error('Error al cargar festivos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedFestivo) {
        await api.put(`/festivos/${selectedFestivo.id_festivo}`, formData)
      } else {
        await api.post('/festivos', formData)
      }

      setShowModal(false)
      setSelectedFestivo(null)
      setFormData({
        fecha: '',
        descripcion: '',
        tipo: 'nacional'
      })
      loadFestivos()
    } catch (error) {
      console.error('Error al guardar festivo:', error)
      alert('Error al guardar el festivo')
    }
  }

  const handleDelete = (festivo) => {
    setFestivoToDelete(festivo)
    setShowConfirmDelete(true)
  }

  const confirmDeleteFestivo = async () => {
    if (!festivoToDelete) return

    try {
      await api.delete(`/festivos/${festivoToDelete.id_festivo}`)
      loadFestivos()
      setShowConfirmDelete(false)
      setFestivoToDelete(null)
    } catch (error) {
      console.error('Error al eliminar festivo:', error)
      alert('Error al eliminar el festivo')
    }
  }

  const openModal = (festivo = null) => {
    if (festivo) {
      setSelectedFestivo(festivo)
      setFormData({
        fecha: festivo.fecha,
        descripcion: festivo.descripcion,
        tipo: festivo.tipo
      })
    } else {
      setSelectedFestivo(null)
      setFormData({
        fecha: '',
        descripcion: '',
        tipo: 'nacional'
      })
    }
    setShowModal(true)
  }

  const openDetalleModal = (festivo) => {
    setSelectedFestivo(festivo)
    setShowDetalleModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedFestivo(null)
  }

  const handleDetalleModalClose = () => {
    setShowDetalleModal(false)
    setSelectedFestivo(null)
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  return (
    <div id="main-content" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Festivos
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los días festivos del calendario laboral
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal(null)}
            className="btn btn-primary mt-4 sm:mt-0"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Festivo
          </button>
        )}
      </div>

      {/* Lista de festivos con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          <h3 className="list-title">Calendario de Festivos</h3>
          <span className="list-count">
            {loading ? (
              <div className="list-count-spinner">
                <div className="animate-spin"></div>
              </div>
            ) : (
              festivos.length
            )}
          </span>
        </div>

        {loading ? (
          <div className="list-loading">
            <div className="list-loading-icon">
              <div className="animate-spin"></div>
            </div>
            <div className="list-loading-title">Cargando festivos...</div>
            <div className="list-loading-message">Obteniendo calendario de festivos</div>
          </div>
        ) : festivos.length === 0 ? (
          <div className="list-empty">
            <CalendarDaysIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin festivos configurados</div>
            <div className="list-empty-message">No hay festivos en el calendario laboral</div>
            {isAdmin && (
              <button
                onClick={() => openModal(null)}
                className="btn btn-primary btn-sm mt-3"
              >
                <PlusIcon className="icon-left" />
                Nuevo Festivo
              </button>
            )}
          </div>
        ) : (
          <div className="list-scrollable">
            {festivos
              .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
              .map((festivo) => (
              <div key={festivo.id_festivo} className="list-item list-item-festivo">
                <FestivoItem
                  festivo={festivo}
                  isAdmin={isAdmin}
                  onEditar={openModal}
                  onEliminar={handleDelete}
                  onVerDetalles={openDetalleModal}
                  TIPOS_FESTIVO={TIPOS_FESTIVO}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar festivo */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedFestivo ? 'Editar Festivo' : 'Nuevo Festivo'}
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        <form onSubmit={handleSubmit} className="modal-elegant">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="required">*</span>
              </label>
              <DatePicker
                selected={formData.fecha ? new Date(formData.fecha) : null}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    setFormData(prev => ({...prev, fecha: `${year}-${month}-${day}`}))
                  } else {
                    setFormData(prev => ({...prev, fecha: ''}))
                  }
                }}
                placeholder="Selecciona fecha"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span className="required">*</span>
              </label>
              <Select
                components={{ DropdownIndicator }}
                styles={customSelectStyles}
                value={TIPOS_FESTIVO.find(t => t.value === formData.tipo) ? { value: formData.tipo, label: TIPOS_FESTIVO.find(t => t.value === formData.tipo)?.label } : null}
                onChange={(option) => setFormData(prev => ({...prev, tipo: option.value}))}
                options={TIPOS_FESTIVO.map(tipo => ({ value: tipo.value, label: tipo.label }))}
                placeholder="Selecciona un tipo"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isSearchable={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="required">*</span>
              </label>
              <textarea
                rows="3"
                required
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({...prev, descripcion: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Describe el festivo o celebración..."
              />
              <div className="modal-field-help" style={{ marginBottom: '1.5rem' }}>
                Proporciona una descripción clara del festivo para identificarlo fácilmente
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
              {selectedFestivo ? 'Actualizar Festivo' : 'Crear Festivo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de detalles de festivo */}
      <Modal
        isOpen={showDetalleModal}
        onClose={handleDetalleModalClose}
        title="Detalles del Festivo"
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        {selectedFestivo && (
          <div className="space-y-5">
            {/* Header con tipo y badge */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {selectedFestivo.descripcion}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatFecha(selectedFestivo.fecha)}
                </p>
              </div>
              <span className={`festivo-badge ${
                selectedFestivo.tipo === 'nacional' ? 'danger' :
                selectedFestivo.tipo === 'regional' ? 'info' :
                selectedFestivo.tipo === 'local' ? 'success' : 'warning'
              }`}>
                {TIPOS_FESTIVO.find(t => t.value === selectedFestivo.tipo)?.label}
              </span>
            </div>

            {/* Información estructurada */}
            <div className="space-y-0">
              {/* Fecha */}
              <div className="modal-info-row">
                <div className="modal-info-label">
                  <CalendarDaysIcon />
                  Fecha
                </div>
                <div className="modal-info-value">
                  {formatFecha(selectedFestivo.fecha)}
                </div>
              </div>

              {/* Tipo */}
              <div className="modal-info-row">
                <div className="modal-info-label">
                  <span className="text-gray-600">Tipo</span>
                </div>
                <div className="modal-info-value">
                  {TIPOS_FESTIVO.find(t => t.value === selectedFestivo.tipo)?.label}
                </div>
              </div>

              {/* Descripción */}
              <div className="modal-info-row">
                <div className="modal-info-label">
                  <span className="text-gray-600">Descripción</span>
                </div>
                <div className="modal-info-value">
                  {selectedFestivo.descripcion}
                </div>
              </div>
            </div>

            {/* Botones de acción - Solo para admins */}
            {isAdmin && (
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => openModal(selectedFestivo)}
                  className="btn btn-primary"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedFestivo)}
                  className="btn btn-danger"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación para Eliminación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false)
          setFestivoToDelete(null)
        }}
        onConfirm={confirmDeleteFestivo}
        title="¿Eliminar festivo?"
        message={`¿Estás seguro de que deseas eliminar el festivo "${festivoToDelete?.descripcion}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        variant="elegant"
        animationOrigin="center"
      />
    </div>
  )
}
