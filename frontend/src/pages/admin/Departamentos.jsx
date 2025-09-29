import { useEffect, useState } from 'react'
import { createDepartamento, listDepartamentos } from '../../services/admin'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import api from '../../lib/api'

export default function Departamentos() {
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
      const d = await listDepartamentos()
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
        // Actualizar departamento existente
        await api.put(`/departamentos/${selectedItem.id}`, form)
      } else {
        // Crear nuevo departamento
        await createDepartamento(form)
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
      await api.delete(`/departamentos/${itemToDelete.id}`)
      load()
    } catch (error) {
      console.error('Error al eliminar departamento:', error)
    } finally {
      setItemToDelete(null)
    }
  }

  return (
    <div id="main-content" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Departamentos
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los departamentos de la empresa
          </p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Departamento
        </button>
      </div>

      {/* Lista de departamentos con nuevo diseño premium */}
      <div className="list">
        <div className="list-header">
          Departamentos de la Empresa
        </div>
        
        {loading ? (
          <div className="list-empty">
            <div className="list-empty-icon">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="list-empty-title">Cargando departamentos...</div>
            <div className="list-empty-message">Obteniendo estructura organizacional</div>
          </div>
        ) : items.length === 0 ? (
          <div className="list-empty">
            <BuildingOfficeIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin departamentos creados</div>
            <div className="list-empty-message">Crea el primer departamento de tu empresa</div>
            <button 
              onClick={() => openModal(null)}
              className="btn btn-primary btn-sm mt-3"
            >
              <PlusIcon className="icon-left" />
              Nuevo Departamento
            </button>
          </div>
        ) : (
          <div className="list-scrollable">
            {items.map((departamento) => (
              <div key={departamento.id} className="list-item">
                <div className="list-item-icon">
                  <BuildingOfficeIcon className="h-5 w-5" />
                </div>
                
                <div className="list-item-content">
                  <div className="list-item-title">
                    {departamento.nombre}
                  </div>
                  <div className="list-item-subtitle">
                    {departamento.descripcion || 'Sin descripción'}
                  </div>
                  <div className="list-item-meta">
                    Departamento organizacional
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="list-item-badge info">
                    Activo
                  </span>
                  
                  <div className="list-item-actions">
                    <button
                      onClick={() => openModal(departamento)}
                      className="btn btn-xs btn-secondary"
                      title="Editar departamento"
                    >
                      <PencilIcon className="icon-left" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(departamento)}
                      className="btn btn-xs btn-danger"
                      title="Eliminar departamento"
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

      {/* Modal para Departamento */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedItem ? 'Editar Departamento' : 'Nuevo Departamento'}
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
              placeholder="Nombre del departamento"
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
              placeholder="Descripción opcional del departamento"
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
        title="¿Eliminar departamento?"
        message={`¿Estás seguro de que deseas eliminar el departamento "${itemToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        animationOrigin="center"
      />
    </div>
  )
}
