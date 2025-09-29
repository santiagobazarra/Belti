import { useEffect, useState } from 'react'
import { createRole, listRoles } from '../../services/admin'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import {
  ShieldCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import api from '../../lib/api'

export default function Roles() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: ''
  })

  const load = async () => {
    try {
      setLoading(true)
      const d = await listRoles()
      setItems(d?.data || d || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedItem) {
        await api.put(`/roles/${selectedItem.id}`, form)
      } else {
        await createRole(form)
      }

      setForm({ nombre: '', descripcion: '' })
      setSelectedItem(null)
      setShowModal(false)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  const openModal = (item = null) => {
    if (item) {
      setSelectedItem(item)
      setForm({
        nombre: item.nombre,
        descripcion: item.descripcion || ''
      })
    } else {
      setSelectedItem(null)
      setForm({ nombre: '', descripcion: '' })
    }
    setShowModal(true)
  }

  const handleDelete = (item) => {
    setItemToDelete(item)
    setShowConfirmDelete(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      await api.delete(`/roles/${itemToDelete.id}`)
      load()
    } catch (error) {
      console.error('Error al eliminar rol:', error)
    } finally {
      setItemToDelete(null)
    }
  }

  return (
    <div id="main-content" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Roles
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los roles y permisos del sistema
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Rol
        </button>
      </div>

      {/* Lista de roles con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          Roles y Permisos del Sistema
        </div>

        {loading ? (
          <div className="list-empty">
            <div className="list-empty-icon">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="list-empty-title">Cargando roles...</div>
            <div className="list-empty-message">Obteniendo configuración de permisos</div>
          </div>
        ) : items.length === 0 ? (
          <div className="list-empty">
            <ShieldCheckIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin roles configurados</div>
            <div className="list-empty-message">Crea el primer rol para gestionar permisos</div>
            <button
              onClick={() => openModal()}
              className="btn btn-primary btn-sm mt-3"
            >
              <PlusIcon className="icon-left" />
              Nuevo Rol
            </button>
          </div>
        ) : (
          <div className="list-scrollable">
            {items.map((rol) => (
              <div key={rol.id} className="list-item">
                <div className="list-item-icon">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>

                <div className="list-item-content">
                  <div className="list-item-title">
                    {rol.nombre}
                  </div>
                  <div className="list-item-subtitle">
                    {rol.descripcion || 'Sin descripción'}
                  </div>
                  <div className="list-item-meta">
                    {rol.slug ? `Slug: ${rol.slug}` : 'Configuración de permisos'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`list-item-badge ${
                    rol.nombre?.toLowerCase() === 'administrador' ? 'danger' :
                    rol.nombre?.toLowerCase() === 'supervisor' ? 'warning' : 'info'
                  }`}>
                    {rol.nombre?.toLowerCase() === 'administrador' ? 'Admin' :
                     rol.nombre?.toLowerCase() === 'supervisor' ? 'Supervisor' : 'Usuario'}
                  </span>

                  <div className="list-item-actions">
                    <button
                      onClick={() => openModal(rol)}
                      className="btn btn-xs btn-secondary"
                      title="Editar rol"
                    >
                      <PencilIcon className="icon-left" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(rol)}
                      className="btn btn-xs btn-danger"
                      title="Eliminar rol"
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

      {/* Modal para Rol */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedItem ? 'Editar Rol' : 'Nuevo Rol'}
        size="md"
        animationType="fade-scale"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Nombre del rol"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Descripción opcional del rol"
            />
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
              {selectedItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación para Eliminación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false)
          setItemToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="¿Eliminar rol?"
        message={`¿Estás seguro de que deseas eliminar el rol "${itemToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        animationOrigin="center"
      />
    </div>
  )
}
