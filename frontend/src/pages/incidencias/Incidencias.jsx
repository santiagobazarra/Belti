import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import {
  ExclamationTriangleIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Modal from '../../components/Modal'

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

export default function Incidencias() {
  const { user } = useAuth()
  const [incidencias, setIncidencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedIncidencia, setSelectedIncidencia] = useState(null)
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
    try {
      const payload = { ...formData }

      // Solo enviar horas si es necesario según el tipo
      if (!['anomalia_horas', 'ausencia_parcial'].includes(payload.tipo)) {
        delete payload.hora_inicio
        delete payload.hora_fin
      }

      if (selectedIncidencia) {
        await api.patch(`/incidencias/${selectedIncidencia.id}`, payload)
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
      loadIncidencias()
    } catch (error) {
      console.error('Error al guardar incidencia:', error)
      alert('Error al guardar la incidencia')
    }
  }

  const handleAprobar = async (incidenciaId) => {
    try {
      await api.patch(`/incidencias/${incidenciaId}/aprobar`)
      loadIncidencias()
    } catch (error) {
      console.error('Error al aprobar incidencia:', error)
      alert('Error al aprobar la incidencia')
    }
  }

  const handleRechazar = async (incidenciaId) => {
    const comentario = prompt('Comentario de rechazo (opcional):')
    try {
      await api.patch(`/incidencias/${incidenciaId}`, {
        estado: 'rechazada',
        comentario_revision: comentario || ''
      })
      loadIncidencias()
    } catch (error) {
      console.error('Error al rechazar incidencia:', error)
      alert('Error al rechazar la incidencia')
    }
  }

  const openModal = (incidencia = null) => {
    if (incidencia) {
      setSelectedIncidencia(incidencia)
      setFormData({
        fecha: incidencia.fecha,
        tipo: incidencia.tipo,
        descripcion: incidencia.descripcion || '',
        hora_inicio: incidencia.hora_inicio?.slice(11, 16) || '',
        hora_fin: incidencia.hora_fin?.slice(11, 16) || ''
      })
    }
    setShowModal(true)
  }

  const requiresHours = formData.tipo === 'anomalia_horas' || formData.tipo === 'ausencia_parcial'

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

      {/* Filtros */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="w-full form-input-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({...prev, estado: e.target.value}))}
                className="form-input"
              >
                <option value="">Todos los estados</option>
                {ESTADOS.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full form-input-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.tipo}
                onChange={(e) => setFilters(prev => ({...prev, tipo: e.target.value}))}
                className="form-input"
              >
                <option value="">Todos los tipos</option>
                {TIPOS_INCIDENCIA.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full form-input-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.desde}
                onChange={(e) => setFilters(prev => ({...prev, desde: e.target.value}))}
                className="form-input"
              />
            </div>
            <div className="w-full form-input-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.hasta}
                onChange={(e) => setFilters(prev => ({...prev, hasta: e.target.value}))}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de incidencias con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          {isAdmin ? 'Todas las Incidencias' : 'Mis Incidencias'}
        </div>

        {loading ? (
          <div className="list-empty">
            <div className="list-empty-icon">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="list-empty-title">Cargando incidencias...</div>
            <div className="list-empty-message">Obteniendo datos del servidor</div>
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
              <div key={incidencia.id} className="list-item">
                <div className="list-item-icon">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                </div>

                <div className="list-item-content">
                  <div className="list-item-title">
                    {TIPOS_INCIDENCIA.find(t => t.value === incidencia.tipo)?.label}
                    {isAdmin && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {incidencia.usuario?.nombre} {incidencia.usuario?.apellidos}
                      </span>
                    )}
                  </div>
                  <div className="list-item-subtitle">
                    {incidencia.descripcion || 'Sin descripción'}
                  </div>
                  <div className="list-item-meta">
                    {new Date(incidencia.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`list-item-badge ${
                    incidencia.estado === 'aprobada' ? 'success' :
                    incidencia.estado === 'rechazada' ? 'danger' : 'warning'
                  }`}>
                    {ESTADOS.find(e => e.value === incidencia.estado)?.label}
                  </span>

                  <div className="list-item-actions">
                    {incidencia.estado === 'pendiente' && !isAdmin && (
                      <button
                        onClick={() => openModal(incidencia)}
                        className="btn btn-xs btn-secondary"
                      >
                        <EyeIcon className="icon-left" />
                        Editar
                      </button>
                    )}
                    {incidencia.estado === 'pendiente' && isAdmin && (
                      <>
                        <button
                          onClick={() => handleAprobar(incidencia.id)}
                          className="btn btn-xs btn-success"
                          title="Aprobar incidencia"
                        >
                          <CheckIcon className="icon-left" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(incidencia.id)}
                          className="btn btn-xs btn-danger"
                          title="Rechazar incidencia"
                        >
                          <XMarkIcon className="icon-left" />
                          Rechazar
                        </button>
                      </>
                    )}
                    {incidencia.estado !== 'pendiente' && (
                      <button
                        onClick={() => openModal(incidencia)}
                        className="btn btn-xs btn-ghost"
                      >
                        <EyeIcon className="icon-left" />
                        Ver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal premium para crear/editar incidencia */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedIncidencia(null)
        }}
        title={selectedIncidencia ? 'Editar Incidencia' : 'Nueva Incidencia'}
        size="md"
        variant="default"
        animationType="fade-scale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({...prev, fecha: e.target.value}))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Incidencia *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({...prev, tipo: e.target.value}))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              {TIPOS_INCIDENCIA.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {requiresHours && (
            <div className="modal-form-grid cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  required={requiresHours}
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData(prev => ({...prev, hora_inicio: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  required={requiresHours}
                  value={formData.hora_fin}
                  onChange={(e) => setFormData(prev => ({...prev, hora_fin: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              rows="3"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({...prev, descripcion: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Describe los detalles de la incidencia..."
            />
            <div className="modal-field-help">
              Proporciona detalles adicionales sobre la incidencia que ayuden a su revisión
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => {
                setShowModal(false)
                setSelectedIncidencia(null)
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedIncidencia ? 'Actualizar Incidencia' : 'Crear Incidencia'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
