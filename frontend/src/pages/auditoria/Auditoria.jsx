import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import Modal from '../../components/Modal'
import {
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const ACCIONES = [
  { value: '', label: 'Todas las acciones' },
  { value: 'created', label: 'Creación' },
  { value: 'updated', label: 'Actualización' },
  { value: 'deleted', label: 'Eliminación' }
]

const MODELOS = [
  { value: '', label: 'Todos los modelos' },
  { value: 'Incidencia', label: 'Incidencias' },
  { value: 'Solicitud', label: 'Solicitudes' },
  { value: 'Jornada', label: 'Jornadas' },
  { value: 'User', label: 'Usuarios' },
  { value: 'Festivo', label: 'Festivos' }
]

export default function Auditoria() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    model: '',
    usuario_id: '',
    accion: '',
    desde: '',
    hasta: ''
  })
  const [selectedLog, setSelectedLog] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  useEffect(() => {
    if (isAdmin) {
      loadLogs()
      loadUsuarios()
    }
  }, [filters, isAdmin])

  // Verificar permisos - solo administradores pueden acceder
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No tienes permisos para acceder a esta sección</p>
      </div>
    )
  }

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const { data } = await api.get(`/audit-logs?${params}`)
      setLogs(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar logs de auditoría:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsuarios = async () => {
    try {
      const { data } = await api.get('/usuarios')
      setUsuarios(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getAccionColor = (accion) => {
    switch (accion?.toLowerCase()) {
      case 'created': return 'bg-green-100 text-green-800'
      case 'updated': return 'bg-blue-100 text-blue-800'
      case 'deleted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openModal = (log) => {
    setSelectedLog(log)
    setShowModal(true)
  }

  const formatChanges = (changes) => {
    if (!changes || typeof changes !== 'object') return 'Sin cambios'

    return Object.entries(changes).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}: ${JSON.stringify(value, null, 2)}`
      }
      return `${key}: ${value}`
    }).join('\n')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Auditoría del Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Consulta el registro de actividades del sistema
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                value={filters.model}
                onChange={(e) => setFilters(prev => ({...prev, model: e.target.value}))}
                className="form-input"
              >
                {MODELOS.map(modelo => (
                  <option key={modelo.value} value={modelo.value}>
                    {modelo.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <select
                value={filters.usuario_id}
                onChange={(e) => setFilters(prev => ({...prev, usuario_id: e.target.value}))}
                className="form-input"
              >
                <option value="">Todos los usuarios</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario?.nombre && usuario?.apellidos ? `${usuario.nombre} ${usuario.apellidos}` : 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acción
              </label>
              <select
                value={filters.accion}
                onChange={(e) => setFilters(prev => ({...prev, accion: e.target.value}))}
                className="form-input"
              >
                {ACCIONES.map(accion => (
                  <option key={accion.value} value={accion.value}>
                    {accion.label}
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

      {/* Lista de logs de auditoría con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          Registro de Actividades del Sistema
        </div>

        {loading ? (
          <div className="list-empty">
            <div className="list-empty-icon">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="list-empty-title">Cargando logs de auditoría...</div>
            <div className="list-empty-message">Obteniendo registro de actividades</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="list-empty">
            <ShieldCheckIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin registros de auditoría</div>
            <div className="list-empty-message">No se encontraron registros con los filtros seleccionados</div>
          </div>
        ) : (
          <div className="list-scrollable">
            {logs.map((log) => (
              <div key={log.id} className="list-item">
                <div className="list-item-icon">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>

                <div className="list-item-content">
                  <div className="list-item-title">
                    {log.model || log.auditable_type?.split('\\').pop()} #{log.auditable_id || log.model_id}
                    <span className="text-sm text-gray-500 ml-2">
                      - {log.usuario?.nombre} {log.usuario?.apellidos}
                    </span>
                  </div>
                  <div className="list-item-subtitle">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-500" />
                      {formatDateTime(log.created_at || log.timestamp)}
                    </div>
                  </div>
                  <div className="list-item-meta">
                    Actividad del sistema • Usuario ID: {log.user_id}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`list-item-badge ${
                    (log.accion || log.event) === 'created' ? 'success' :
                    (log.accion || log.event) === 'updated' ? 'info' :
                    (log.accion || log.event) === 'deleted' ? 'danger' : 'warning'
                  }`}>
                    {log.accion || log.event}
                  </span>

                  <div className="list-item-actions">
                    <button
                      onClick={() => openModal(log)}
                      className="btn btn-xs btn-ghost"
                      title="Ver detalles completos"
                    >
                      <EyeIcon className="icon-left" />
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para ver detalles del log */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Detalles del Log de Auditoría
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha/Hora
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDateTime(selectedLog.created_at || selectedLog.timestamp)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.usuario?.nombre} {selectedLog.usuario?.apellidos}
                    {selectedLog.usuario?.email && ` (${selectedLog.usuario.email})`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acción
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccionColor(selectedLog.accion || selectedLog.event)}`}>
                    {selectedLog.accion || selectedLog.event}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLog.model || selectedLog.auditable_type?.split('\\').pop()} #{selectedLog.auditable_id || selectedLog.model_id}
                  </p>
                </div>
              </div>

              {selectedLog.cambios && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cambios Realizados
                  </label>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                    {formatChanges(selectedLog.cambios)}
                  </pre>
                </div>
              )}

              {selectedLog.old_values && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valores Anteriores
                  </label>
                  <pre className="bg-red-50 p-3 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valores Nuevos
                  </label>
                  <pre className="bg-green-50 p-3 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.ip_address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección IP
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.ip_address}</p>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Navegador
                  </label>
                  <p className="text-sm text-gray-600">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
