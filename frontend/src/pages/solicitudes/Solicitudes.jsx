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
  ClockIcon
} from '@heroicons/react/24/outline'
import Modal from '../../components/Modal'

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

export default function Solicitudes() {
  const { user } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState(null)
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
    try {
      if (selectedSolicitud) {
        await api.patch(`/solicitudes/${selectedSolicitud.id}`, formData)
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

  const handleAprobar = async (solicitudId) => {
    const comentario = prompt('Comentario de aprobación (opcional):')
    try {
      await api.patch(`/solicitudes/${solicitudId}`, {
        estado: 'aprobada',
        comentario_resolucion: comentario || ''
      })
      loadSolicitudes()
    } catch (error) {
      console.error('Error al aprobar solicitud:', error)
      alert('Error al aprobar la solicitud')
    }
  }

  const handleRechazar = async (solicitudId) => {
    const comentario = prompt('Comentario de rechazo (opcional):')
    if (comentario === null) return // Usuario canceló

    try {
      await api.patch(`/solicitudes/${solicitudId}`, {
        estado: 'rechazada',
        comentario_resolucion: comentario || ''
      })
      loadSolicitudes()
    } catch (error) {
      console.error('Error al rechazar solicitud:', error)
      alert('Error al rechazar la solicitud')
    }
  }

  const openModal = (solicitud = null) => {
    if (solicitud) {
      setSelectedSolicitud(solicitud)
      setFormData({
        fecha_inicio: solicitud.fecha_inicio,
        fecha_fin: solicitud.fecha_fin,
        tipo: solicitud.tipo,
        motivo: solicitud.motivo || ''
      })
    } else {
      setFormData({
        fecha_inicio: '',
        fecha_fin: '',
        tipo: 'vacaciones',
        motivo: ''
      })
    }
    setShowModal(true)
  }

  const calculateDays = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    const diffTime = Math.abs(fin - inicio)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
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
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="w-full">
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
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.tipo}
                onChange={(e) => setFilters(prev => ({...prev, tipo: e.target.value}))}
                className="form-input"
              >
                <option value="">Todos los tipos</option>
                {TIPOS_SOLICITUD.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
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
            <div className="w-full">
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

      {/* Lista de solicitudes con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          {isAdmin ? 'Todas las Solicitudes' : 'Mis Solicitudes'}
        </div>

        {loading ? (
          <div className="list-empty">
            <div className="list-empty-icon">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="list-empty-title">Cargando solicitudes...</div>
            <div className="list-empty-message">Obteniendo datos del servidor</div>
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
              <div key={solicitud.id} className="list-item">
                <div className="list-item-icon">
                  <EnvelopeIcon className="h-5 w-5" />
                </div>

                <div className="list-item-content">
                  <div className="list-item-title">
                    {TIPOS_SOLICITUD.find(t => t.value === solicitud.tipo)?.label}
                    {isAdmin && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {solicitud.usuario?.nombre} {solicitud.usuario?.apellidos}
                      </span>
                    )}
                    <span className="text-sm font-medium text-blue-600 ml-2">
                      ({calculateDays(solicitud.fecha_inicio, solicitud.fecha_fin)} días)
                    </span>
                  </div>
                  <div className="list-item-subtitle">
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                      {new Date(solicitud.fecha_inicio).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })} - {new Date(solicitud.fecha_fin).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="list-item-meta">
                    {solicitud.motivo ? `Motivo: ${solicitud.motivo}` : 'Sin motivo especificado'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`list-item-badge ${
                    solicitud.estado === 'aprobada' ? 'success' :
                    solicitud.estado === 'rechazada' ? 'danger' :
                    solicitud.estado === 'cancelada' ? 'info' : 'warning'
                  }`}>
                    {ESTADOS.find(e => e.value === solicitud.estado)?.label}
                  </span>

                  <div className="list-item-actions">
                    {solicitud.estado === 'pendiente' && !isAdmin && (
                      <button
                        onClick={() => openModal(solicitud)}
                        className="btn btn-xs btn-secondary"
                      >
                        <EyeIcon className="icon-left" />
                        Editar
                      </button>
                    )}
                    {solicitud.estado === 'pendiente' && isAdmin && (
                      <>
                        <button
                          onClick={() => handleAprobar(solicitud.id)}
                          className="btn btn-xs btn-success"
                          title="Aprobar solicitud"
                        >
                          <CheckIcon className="icon-left" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(solicitud.id)}
                          className="btn btn-xs btn-danger"
                          title="Rechazar solicitud"
                        >
                          <XMarkIcon className="icon-left" />
                          Rechazar
                        </button>
                      </>
                    )}
                    {solicitud.estado !== 'pendiente' && (
                      <button
                        onClick={() => openModal(solicitud)}
                        className="btn btn-xs btn-ghost"
                      >
                        <EyeIcon className="icon-left" />
                        Ver detalles
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal premium para crear/editar solicitud */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedSolicitud(null)
        }}
        title={selectedSolicitud ? 'Editar Solicitud' : 'Nueva Solicitud'}
        size="md"
        variant="default"
        animationType="fade-scale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Solicitud *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({...prev, tipo: e.target.value}))}
              required
            >
              {TIPOS_SOLICITUD.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-grid cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio *
              </label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData(prev => ({...prev, fecha_inicio: e.target.value}))}
                required
                className="w-full"
                name="fecha_inicio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin *
              </label>
              <input
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData(prev => ({...prev, fecha_fin: e.target.value}))}
                required
                className="w-full"
                name="fecha_fin"
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
              Motivo de la Solicitud *
            </label>
            <textarea
              rows="4"
              required
              value={formData.motivo}
              onChange={(e) => setFormData(prev => ({...prev, motivo: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Describe el motivo detallado de tu solicitud..."
            />
            <div className="modal-field-help">
              Explica claramente el motivo de tu solicitud para facilitar la aprobación
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => {
                setShowModal(false)
                setSelectedSolicitud(null)
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {selectedSolicitud ? 'Actualizar Solicitud' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
