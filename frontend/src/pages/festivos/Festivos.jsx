import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const TIPOS_FESTIVO = [
  { value: 'nacional', label: 'Nacional' },
  { value: 'regional', label: 'Regional' },
  { value: 'local', label: 'Local' },
  { value: 'empresa', label: 'Empresa' }
]

export default function Festivos() {
  const { user } = useAuth()
  const [festivos, setFestivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
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
        await api.put(`/festivos/${selectedFestivo.id}`, formData)
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
      await api.delete(`/festivos/${festivoToDelete.id}`)
      loadFestivos()
    } catch (error) {
      console.error('Error al eliminar festivo:', error)
      alert('Error al eliminar el festivo')
    } finally {
      setFestivoToDelete(null)
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
          Calendario de Festivos
        </div>

        {loading ? (
          <div className="list-empty">
            <div className="list-empty-icon">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="list-empty-title">Cargando festivos...</div>
            <div className="list-empty-message">Obteniendo calendario de festivos</div>
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
              <div key={festivo.id} className="list-item">
                <div className="list-item-icon">
                  <CalendarDaysIcon className="h-5 w-5" />
                </div>

                <div className="list-item-content">
                  <div className="list-item-title">
                    {festivo.descripcion}
                  </div>
                  <div className="list-item-subtitle">
                    {formatFecha(festivo.fecha)}
                  </div>
                  <div className="list-item-meta">
                    {new Date(festivo.fecha) > new Date()
                      ? `Próximo festivo`
                      : new Date(festivo.fecha).getFullYear() === new Date().getFullYear()
                        ? `Este año`
                        : `Año ${new Date(festivo.fecha).getFullYear()}`
                    }
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`list-item-badge ${
                    festivo.tipo === 'nacional' ? 'danger' :
                    festivo.tipo === 'regional' ? 'info' :
                    festivo.tipo === 'local' ? 'success' : 'warning'
                  }`}>
                    {TIPOS_FESTIVO.find(t => t.value === festivo.tipo)?.label || festivo.tipo}
                  </span>

                  {isAdmin && (
                    <div className="list-item-actions">
                      <button
                        onClick={() => openModal(festivo)}
                        className="btn btn-xs btn-secondary"
                        title="Editar festivo"
                      >
                        <PencilIcon className="icon-left" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(festivo)}
                        className="btn btn-xs btn-danger"
                        title="Eliminar festivo"
                      >
                        <TrashIcon className="icon-left" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar festivo */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedFestivo(null)
        }}
        title={selectedFestivo ? 'Editar Festivo' : 'Nuevo Festivo'}
        size="md"
        variant="default"
        animationType="fade-scale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              rows="3"
              required
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({...prev, descripcion: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Describe el festivo o celebración..."
            />
            <div className="modal-field-help">
              Proporciona una descripción clara del festivo para identificarlo fácilmente
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({...prev, tipo: e.target.value}))}
              required
              className="form-input"
            >
              {TIPOS_FESTIVO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({...prev, fecha: e.target.value}))}
              required
              className="form-input"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => {
                setShowModal(false)
                setSelectedFestivo(null)
              }}
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
        animationOrigin="center"
      />
    </div>
  )
}
