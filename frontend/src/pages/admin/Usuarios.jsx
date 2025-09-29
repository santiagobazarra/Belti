import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function Usuarios() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [usuarioToDelete, setUsuarioToDelete] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    id_rol: '',
    id_departamento: ''
  })
  const [filters, setFilters] = useState({
    departamento_id: '',
    rol_id: ''
  })

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  useEffect(() => {
    if (isAdmin) {
      loadUsuarios()
      loadRoles()
      loadDepartamentos()
    }
  }, [filters, isAdmin])

  // Verificar permisos - solo administradores pueden acceder
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No tienes permisos para acceder a esta sección</p>
      </div>
    )
  }

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const { data } = await api.get(`/usuarios?${params}`)
      setUsuarios(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const { data } = await api.get('/roles')
      setRoles(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar roles:', error)
    }
  }

  const loadDepartamentos = async () => {
    try {
      const { data } = await api.get('/departamentos')
      setDepartamentos(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar departamentos:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formData }

      // No enviar password vacía en edición
      if (selectedUsuario && !payload.password) {
        delete payload.password
      }

      if (selectedUsuario) {
        await api.put(`/usuarios/${selectedUsuario.id}`, payload)
      } else {
        await api.post('/usuarios', payload)
      }

      setShowModal(false)
      setSelectedUsuario(null)
      setFormData({
        nombre: '',
        apellidos: '',
        email: '',
        password: '',
        id_rol: '',
        id_departamento: ''
      })
      loadUsuarios()
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      alert('Error al guardar el usuario')
    }
  }

  const handleDelete = (usuario) => {
    setUsuarioToDelete(usuario)
    setShowConfirmDelete(true)
  }

  const confirmDeleteUsuario = async () => {
    if (!usuarioToDelete) return

    try {
      await api.delete(`/usuarios/${usuarioToDelete.id}`)
      loadUsuarios()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      alert('Error al eliminar el usuario')
    } finally {
      setUsuarioToDelete(null)
    }
  }

  const openModal = (usuario = null) => {
    if (usuario) {
      setSelectedUsuario(usuario)
      setFormData({
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        password: '',
        id_rol: usuario.id_rol || '',
        id_departamento: usuario.id_departamento || ''
      })
    } else {
      setSelectedUsuario(null)
      setFormData({
        nombre: '',
        apellidos: '',
        email: '',
        password: '',
        id_rol: '',
        id_departamento: ''
      })
    }
    setShowModal(true)
  }

  return (
    <div id="main-content" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <select
                value={filters.departamento_id}
                onChange={(e) => setFilters(prev => ({...prev, departamento_id: e.target.value}))}
                className="w-full"
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept?.id || ''}>
                    {dept?.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <select
                value={filters.rol_id}
                onChange={(e) => setFilters(prev => ({...prev, rol_id: e.target.value}))}
                className="w-full"
              >
                <option value="">Todos los roles</option>
                {roles.map(rol => (
                  <option key={rol.id} value={rol?.id || ''}>
                    {rol?.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de usuarios con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          Gestión de Usuarios
        </div>

        {loading ? (
          <div className="list-empty">
            <div className="list-empty-icon">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="list-empty-title">Cargando usuarios...</div>
            <div className="list-empty-message">Obteniendo información de usuarios</div>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="list-empty">
            <UserGroupIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin usuarios registrados</div>
            <div className="list-empty-message">No se encontraron usuarios con los filtros seleccionados</div>
            <button
              onClick={() => openModal(null)}
              className="btn btn-primary btn-sm mt-3"
            >
              <PlusIcon className="icon-left" />
              Nuevo Usuario
            </button>
          </div>
        ) : (
          <div className="list-scrollable">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="list-item">
                <div className="list-item-avatar">
                  {`${usuario.nombre?.[0] || ''}${usuario.apellidos?.[0] || ''}`.toUpperCase()}
                </div>

                <div className="list-item-content">
                  <div className="list-item-title">
                    {usuario.nombre} {usuario.apellidos}
                  </div>
                  <div className="list-item-subtitle">
                    {usuario.email}
                  </div>
                  <div className="list-item-meta">
                    {usuario.departamento?.nombre || 'Sin departamento'} • {usuario.role?.nombre || usuario.rol?.nombre || 'Sin rol'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`list-item-badge ${
                    usuario.email_verified_at ? 'success' : 'warning'
                  }`}>
                    {usuario.email_verified_at ? 'Activo' : 'Pendiente'}
                  </span>

                  <span className={`list-item-badge info`}>
                    {usuario.role?.nombre || usuario.rol?.nombre || 'Sin rol'}
                  </span>

                  <div className="list-item-actions">
                    <button
                      onClick={() => openModal(usuario)}
                      className="btn btn-xs btn-secondary"
                      title="Editar usuario"
                    >
                      <PencilIcon className="icon-left" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(usuario)}
                      className="btn btn-xs btn-danger"
                      title="Eliminar usuario"
                    >
                      <TrashIcon className="icon-left" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Usuario */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
        animationType="fade-scale"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({...prev, nombre: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Nombre del usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                required
                value={formData.apellidos}
                onChange={(e) => setFormData(prev => ({...prev, apellidos: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Apellidos del usuario"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="email@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {selectedUsuario ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              required={!selectedUsuario}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder={selectedUsuario ? "Dejar vacío para no cambiar" : "Contraseña"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select
                value={formData.id_rol}
                onChange={(e) => setFormData(prev => ({...prev, id_rol: e.target.value}))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Seleccionar rol</option>
                {roles.map(rol => (
                  <option key={rol.id} value={rol?.id || ''}>
                    {rol?.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                value={formData.id_departamento}
                onChange={(e) => setFormData(prev => ({...prev, id_departamento: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="">Sin departamento</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept?.id || ''}>
                    {dept?.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {selectedUsuario ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación para Eliminación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false)
          setUsuarioToDelete(null)
        }}
        onConfirm={confirmDeleteUsuario}
        title="¿Eliminar usuario?"
        message={`¿Estás seguro de que deseas eliminar al usuario "${usuarioToDelete?.nombre} ${usuarioToDelete?.apellidos}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        animationOrigin="center"
      />
    </div>
  )
}
