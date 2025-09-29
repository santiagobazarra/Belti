import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import {
  Cog6ToothIcon,
  ClockIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PauseIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function Configuracion() {
  const { user } = useAuth()
  const [config, setConfig] = useState({
    horas_jornada_estandar: '',
    horas_max_diarias: '',
    minutos_min_pausa: '',
    max_pausas_no_computables: '',
    politica_horas_extra: '',
    zona_horaria: 'Europe/Madrid'
  })
  const [tiposPausa, setTiposPausa] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showModalTipoPausa, setShowModalTipoPausa] = useState(false)
  const [selectedTipoPausa, setSelectedTipoPausa] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [tipoPausaToDelete, setTipoPausaToDelete] = useState(null)
  const [formTipoPausa, setFormTipoPausa] = useState({
    nombre: '',
    descripcion: '',
    es_computable: true,
    minutos_computable_maximo: '',
    max_usos_dia: '',
    orden: 0
  })
  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  // Cargas iniciales
  useEffect(() => {
    loadConfig()
    loadTiposPausa()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/configuracion')
      setConfig(prevConfig => ({
        ...prevConfig,
        ...data
      }))
    } catch (error) {
      console.error('Error al cargar configuración:', error)
      setMessage({ type: 'error', text: 'Error al cargar la configuración' })
    } finally {
      setLoading(false)
    }
  }

  const loadTiposPausa = async () => {
    try {
      const { data } = await api.get('/tipos-pausa')
      setTiposPausa(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar tipos de pausa:', error)
      setMessage({ type: 'error', text: 'Error al cargar los tipos de pausa' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)

      // Preparar los datos para enviar, convirtiendo strings vacíos a null
      const payload = Object.entries(config).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null) {
          acc[key] = value
        }
        return acc
      }, {})

      await api.put('/configuracion', payload)
      setMessage({ type: 'success', text: 'Configuración actualizada correctamente' })

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      setMessage({ type: 'error', text: 'Error al guardar la configuración' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitTipoPausa = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)

      const payload = {
        nombre: formTipoPausa.nombre,
        descripcion: formTipoPausa.descripcion || null,
        es_computable: formTipoPausa.es_computable === true || formTipoPausa.es_computable === 'true',
        minutos_computable_maximo: formTipoPausa.minutos_computable_maximo !== '' ? parseInt(formTipoPausa.minutos_computable_maximo) : null,
        max_usos_dia: formTipoPausa.max_usos_dia !== '' ? parseInt(formTipoPausa.max_usos_dia) : null,
        orden: parseInt(formTipoPausa.orden) || 0,
        activo: true
      }

      if (selectedTipoPausa) {
        // Editar tipo de pausa existente
        await api.put(`/tipos-pausa/${selectedTipoPausa.id}`, payload)
        setMessage({ type: 'success', text: 'Tipo de pausa actualizado correctamente' })
      } else {
        // Crear nuevo tipo de pausa
        await api.post('/tipos-pausa', payload)
        setMessage({ type: 'success', text: 'Tipo de pausa creado correctamente' })
      }

      // Recargar tipos de pausa
      await loadTiposPausa()

      // Cerrar modal
      setShowModalTipoPausa(false)
      setSelectedTipoPausa(null)
      setFormTipoPausa({
        nombre: '',
        descripcion: '',
        es_computable: true,
        minutos_computable_maximo: '',
        max_usos_dia: '',
        orden: 0
      })

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error al guardar tipo de pausa:', error)
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0]
        setMessage({ type: 'error', text: firstError })
      } else {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Error al guardar el tipo de pausa' })
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleEditTipoPausa = (tipoPausa) => {
    setSelectedTipoPausa(tipoPausa)
    setFormTipoPausa({
      nombre: tipoPausa.nombre,
      descripcion: tipoPausa.descripcion,
      es_computable: tipoPausa.es_computable ? 'true' : 'false',
      minutos_computable_maximo: tipoPausa.minutos_computable_maximo !== null ? tipoPausa.minutos_computable_maximo : '',
      max_usos_dia: tipoPausa.max_usos_dia !== null ? tipoPausa.max_usos_dia : '',
      orden: tipoPausa.orden
    })
    setShowModalTipoPausa(true)
  }

  const handleDeleteTipoPausa = (tipoPausa) => {
    setTipoPausaToDelete(tipoPausa)
    setShowConfirmDelete(true)
  }

  const confirmDeleteTipoPausa = async () => {
    if (!tipoPausaToDelete) return

    try {
      await api.delete(`/tipos-pausa/${tipoPausaToDelete.id}`)
      setMessage({ type: 'success', text: 'Tipo de pausa eliminado correctamente' })
      loadTiposPausa()
    } catch (error) {
      console.error('Error al eliminar tipo de pausa:', error)
      setMessage({ type: 'error', text: 'Error al eliminar el tipo de pausa' })
    } finally {
      setTipoPausaToDelete(null)
    }
  }

  const openModalTipoPausa = (tipoPausa = null) => {
    if (tipoPausa) {
      setSelectedTipoPausa(tipoPausa)
      setFormTipoPausa({
        nombre: tipoPausa.nombre,
        descripcion: tipoPausa.descripcion,
        es_computable: tipoPausa.es_computable ? 'true' : 'false',
        minutos_computable_maximo: tipoPausa.minutos_computable_maximo !== null ? tipoPausa.minutos_computable_maximo : '',
        max_usos_dia: tipoPausa.max_usos_dia !== null ? tipoPausa.max_usos_dia : '',
        orden: tipoPausa.orden
      })
    } else {
      setSelectedTipoPausa(null)
      setFormTipoPausa({
        nombre: '',
        descripcion: '',
        es_computable: true,
        minutos_computable_maximo: '',
        max_usos_dia: '',
        orden: 0
      })
    }
    setShowModalTipoPausa(true)
  }

  // Verificar permisos después de hooks para no romper las reglas de hooks
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No tienes permisos para acceder a esta sección</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div id="main-content" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Configura los parámetros globales del sistema de control horario
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckIcon className={`h-5 w-5 ${
                message.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cards de configuración lado a lado - más compactos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Configuración de Jornadas - Card compacto */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <h3 className="card-title text-base">Configuración de Jornadas</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas de jornada estándar
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={config.horas_jornada_estandar}
                    onChange={(e) => handleInputChange('horas_jornada_estandar', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="8"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Horas que debe trabajar un empleado en una jornada completa
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horas máximas diarias
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={config.horas_max_diarias}
                    onChange={(e) => handleInputChange('horas_max_diarias', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Límite máximo de horas que se pueden trabajar en un día
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración General - Card compacto */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="h-5 w-5 text-purple-600" />
                <h3 className="card-title text-base">Configuración General</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zona horaria
                  </label>
                  <select
                    value={config.zona_horaria}
                    onChange={(e) => handleInputChange('zona_horaria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Europe/Madrid">Europa/Madrid (CET)</option>
                    <option value="Europe/London">Europa/Londres (GMT)</option>
                    <option value="America/New_York">América/Nueva York (EST)</option>
                    <option value="America/Los_Angeles">América/Los Angeles (PST)</option>
                    <option value="Asia/Tokyo">Asia/Tokio (JST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Zona horaria para interpretar y mostrar las horas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Política de horas extra
                  </label>
                  <textarea
                    rows="3"
                    value={config.politica_horas_extra}
                    onChange={(e) => handleInputChange('politica_horas_extra', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Describe la política de la empresa para las horas extra..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Política interna sobre horas extraordinarias
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de guardar cambios centrado */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5 mr-2" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>

      {/* Gestión de Tipos de Pausa con diseño premium */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PauseIcon className="h-5 w-5 text-orange-600" />
              <h3 className="card-title">Tipos de Pausa</h3>
            </div>
            <button
              type="button"
              onClick={() => openModalTipoPausa()}
              className="btn btn-primary btn-sm"
            >
              <PlusIcon className="icon-left" />
              Nuevo Tipo
            </button>
          </div>
        </div>

        <div className="list">
          {tiposPausa.length === 0 ? (
            <div className="list-empty">
              <PauseIcon className="list-empty-icon" />
              <div className="list-empty-title">Sin tipos de pausa configurados</div>
              <div className="list-empty-message">Crea el primer tipo de pausa para el sistema</div>
              <button
                type="button"
                onClick={() => openModalTipoPausa()}
                className="btn btn-primary btn-sm mt-3"
              >
                <PlusIcon className="icon-left" />
                Nuevo Tipo de Pausa
              </button>
            </div>
          ) : (
            <div className="list-scrollable">
              {tiposPausa
                .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                .map((tipoPausa) => (
                <div key={tipoPausa.id} className="list-item">
                  <div className="list-item-icon">
                    <PauseIcon className="h-5 w-5" />
                  </div>

                  <div className="list-item-content">
                    <div className="list-item-title">
                      {tipoPausa.nombre}
                    </div>
                    <div className="list-item-subtitle">
                      {tipoPausa.descripcion || 'Sin descripción'}
                    </div>
                    <div className="list-item-meta">
                      {tipoPausa.es_computable ? 'Computable' : 'No computable'}
                      {tipoPausa.minutos_computable_maximo && ` • Max: ${tipoPausa.minutos_computable_maximo} min`}
                      {tipoPausa.max_usos_dia && ` • Usos/día: ${tipoPausa.max_usos_dia}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`list-item-badge ${tipoPausa.es_computable ? 'success' : 'warning'}`}>
                      {tipoPausa.es_computable ? 'Computable' : 'No computable'}
                    </span>

                    <span className="list-item-badge info">
                      Orden: {tipoPausa.orden || 0}
                    </span>

                    <div className="list-item-actions">
                      <button
                        type="button"
                        onClick={() => handleEditTipoPausa(tipoPausa)}
                        className="btn btn-xs btn-secondary"
                        title="Editar tipo de pausa"
                      >
                        <PencilIcon className="icon-left" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTipoPausa(tipoPausa)}
                        className="btn btn-xs btn-danger"
                        title="Eliminar tipo de pausa"
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
      </div>

      {/* Modal para Tipos de Pausa */}
      <Modal
        isOpen={showModalTipoPausa}
        onClose={() => setShowModalTipoPausa(false)}
        title={selectedTipoPausa ? 'Editar Tipo de Pausa' : 'Nuevo Tipo de Pausa'}
        size="md"
        animationOrigin="top"
      >
        <form onSubmit={handleSubmitTipoPausa} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formTipoPausa.nombre}
              onChange={(e) => setFormTipoPausa(prev => ({...prev, nombre: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Ej: Pausa para el café"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formTipoPausa.descripcion}
              onChange={(e) => setFormTipoPausa(prev => ({...prev, descripcion: e.target.value}))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Descripción opcional del tipo de pausa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Es computable en jornada?
            </label>
            <select
              value={formTipoPausa.es_computable}
              onChange={(e) => setFormTipoPausa(prev => ({...prev, es_computable: e.target.value}))}
              className="form-input"
            >
              <option value="true">Sí, se descuenta de la jornada</option>
              <option value="false">No, no se descuenta</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo minutos computables
              </label>
              <input
                type="number"
                min="0"
                value={formTipoPausa.minutos_computable_maximo}
                onChange={(e) => setFormTipoPausa(prev => ({...prev, minutos_computable_maximo: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo usos por día
              </label>
              <input
                type="number"
                min="0"
                value={formTipoPausa.max_usos_dia}
                onChange={(e) => setFormTipoPausa(prev => ({...prev, max_usos_dia: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Ilimitado"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden de visualización
            </label>
            <input
              type="number"
              min="0"
              value={formTipoPausa.orden}
              onChange={(e) => setFormTipoPausa(prev => ({...prev, orden: parseInt(e.target.value) || 0}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModalTipoPausa(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? 'Guardando...' : (selectedTipoPausa ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación para Eliminación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false)
          setTipoPausaToDelete(null)
        }}
        onConfirm={confirmDeleteTipoPausa}
        title="¿Eliminar tipo de pausa?"
        message={`¿Estás seguro de que deseas eliminar el tipo de pausa "${tipoPausaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        animationOrigin="center"
      />
    </div>
  )
}
