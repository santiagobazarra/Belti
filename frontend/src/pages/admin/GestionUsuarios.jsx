import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import Card from '../../components/Card'
import Select from 'react-select'
import ToastContainer from '../../components/ToastContainer'
import useToast from '../../hooks/useToast'
import { UsuarioItem, DepartamentoItem } from '../../components/ListItems'
import IconPicker from '../../components/IconPicker'
import { getIconComponent, DEPARTMENT_ICONS } from '../../lib/departmentIcons'
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  EyeIcon,
  EnvelopeIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import './css/GestionUsuarios.css'
import '../../components/css-components/List.css'

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

// Componente personalizado para el botón Clear (X)
const ClearIndicator = (props) => {
  const { innerProps } = props
  return (
    <div 
      {...innerProps}
      style={{ 
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f3f4f6'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
    </div>
  )
}

// Estilos personalizados para React Select
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
    padding: 0
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
    transition: 'all 0.15s'
  })
}

export default function GestionUsuarios() {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('usuarios') // 'usuarios' o 'departamentos'
  
  // Estados para Usuarios
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [showModalUsuario, setShowModalUsuario] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [showConfirmDeleteUsuario, setShowConfirmDeleteUsuario] = useState(false)
  const [usuarioToDelete, setUsuarioToDelete] = useState(null)
  const [showDetallesUsuario, setShowDetallesUsuario] = useState(false)
  const [usuarioDetalles, setUsuarioDetalles] = useState(null)
  const [formDataUsuario, setFormDataUsuario] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    id_rol: '',
    id_departamento: ''
  })
  const [filtersUsuarios, setFiltersUsuarios] = useState({
    departamento_id: '',
    rol_id: ''
  })

  // Estados para Departamentos
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(true)
  const [showModalDepartamento, setShowModalDepartamento] = useState(false)
  const [selectedDepartamento, setSelectedDepartamento] = useState(null)
  const [showConfirmDeleteDepartamento, setShowConfirmDeleteDepartamento] = useState(false)
  const [departamentoToDelete, setDepartamentoToDelete] = useState(null)
  const [showDetallesDepartamento, setShowDetallesDepartamento] = useState(false)
  const [departamentoDetalles, setDepartamentoDetalles] = useState(null)
  const [usuariosDepartamento, setUsuariosDepartamento] = useState([])
  const [showIconPickerModal, setShowIconPickerModal] = useState(false)
  const [formDataDepartamento, setFormDataDepartamento] = useState({
    nombre: '',
    descripcion: '',
    color: '#8b5cf6',
    icono: 'BuildingOfficeIcon'
  })

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  // ============================================
  // FUNCIONES PARA USUARIOS
  // ============================================

  const loadUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true)
      const params = new URLSearchParams()
      
      // Añadir filtros solo si tienen valor
      if (filtersUsuarios.departamento_id) {
        params.append('id_departamento', filtersUsuarios.departamento_id)
      }
      if (filtersUsuarios.rol_id) {
        params.append('id_rol', filtersUsuarios.rol_id)
      }

      const { data } = await api.get(`/usuarios?${params}`)
      setUsuarios(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [filtersUsuarios])

  const loadRoles = useCallback(async () => {
    try {
      const { data } = await api.get('/roles')
      setRoles(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar roles:', error)
    }
  }, [])

  const loadDepartamentos = useCallback(async () => {
    try {
      setLoadingDepartamentos(true)
      const { data } = await api.get('/departamentos')
      setDepartamentos(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar departamentos:', error)
    } finally {
      setLoadingDepartamentos(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadRoles()
      loadDepartamentos()
    }
  }, [isAdmin, loadRoles, loadDepartamentos])

  useEffect(() => {
    if (isAdmin && activeTab === 'usuarios') {
      loadUsuarios()
    }
  }, [isAdmin, activeTab, filtersUsuarios, loadUsuarios])

  const handleSubmitUsuario = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formDataUsuario }

      if (payload.id_rol !== '') payload.id_rol = Number(payload.id_rol)
      if (payload.id_departamento === '') delete payload.id_departamento
      else payload.id_departamento = Number(payload.id_departamento)

      if (selectedUsuario && !payload.password) {
        delete payload.password
      }

      if (selectedUsuario) {
        const userId = selectedUsuario.id_usuario || selectedUsuario.id
        await api.put(`/usuarios/${userId}`, payload)
        toast.success('Usuario actualizado correctamente')
      } else {
        await api.post('/usuarios', payload)
        toast.success('Usuario creado correctamente')
      }

      setShowModalUsuario(false)
      setSelectedUsuario(null)
      setFormDataUsuario({
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
      toast.error(error.response?.data?.message || 'Error al guardar el usuario')
    }
  }

  const handleDeleteUsuario = (usuario) => {
    setUsuarioToDelete(usuario)
    setShowConfirmDeleteUsuario(true)
  }

  const confirmDeleteUsuario = async () => {
    if (!usuarioToDelete) return

    try {
      const userId = usuarioToDelete.id_usuario || usuarioToDelete.id
      await api.delete(`/usuarios/${userId}`)
      toast.success('Usuario eliminado correctamente')
      loadUsuarios()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar el usuario')
    } finally {
      setUsuarioToDelete(null)
      setShowConfirmDeleteUsuario(false)
    }
  }

  const openModalUsuario = (usuario = null) => {
    if (usuario) {
      setSelectedUsuario(usuario)
      setFormDataUsuario({
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        password: '',
        id_rol: usuario.id_rol ? String(usuario.id_rol) : '',
        id_departamento: usuario.id_departamento ? String(usuario.id_departamento) : ''
      })
    } else {
      setSelectedUsuario(null)
      setFormDataUsuario({
        nombre: '',
        apellidos: '',
        email: '',
        password: '',
        id_rol: '',
        id_departamento: ''
      })
    }
    setShowModalUsuario(true)
  }

  const handleVerDetallesUsuario = (usuario) => {
    setUsuarioDetalles(usuario)
    setShowDetallesUsuario(true)
  }

  // ============================================
  // FUNCIONES PARA DEPARTAMENTOS
  // ============================================

  const handleSubmitDepartamento = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formDataDepartamento }

      if (selectedDepartamento) {
        await api.put(`/departamentos/${selectedDepartamento.id_departamento}`, payload)
        toast.success('Departamento actualizado correctamente')
      } else {
        await api.post('/departamentos', payload)
        toast.success('Departamento creado correctamente')
      }

      setShowModalDepartamento(false)
      setSelectedDepartamento(null)
      setFormDataDepartamento({
        nombre: '',
        descripcion: '',
        color: '#8b5cf6',
        icono: 'BuildingOfficeIcon'
      })
      loadDepartamentos()
    } catch (error) {
      console.error('Error al guardar departamento:', error)
      toast.error(error.response?.data?.message || 'Error al guardar el departamento')
    }
  }

  const handleDeleteDepartamento = (departamento) => {
    setDepartamentoToDelete(departamento)
    setShowConfirmDeleteDepartamento(true)
  }

  const confirmDeleteDepartamento = async () => {
    if (!departamentoToDelete) return

    try {
      await api.delete(`/departamentos/${departamentoToDelete.id_departamento}`)
      toast.success('Departamento eliminado correctamente')
      loadDepartamentos()
    } catch (error) {
      console.error('Error al eliminar departamento:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar el departamento. Puede que tenga usuarios asignados.')
    } finally {
      setDepartamentoToDelete(null)
      setShowConfirmDeleteDepartamento(false)
    }
  }

  const openModalDepartamento = (departamento = null) => {
    if (departamento) {
      setSelectedDepartamento(departamento)
      setFormDataDepartamento({
        nombre: departamento.nombre,
        descripcion: departamento.descripcion || '',
        color: departamento.color || '#8b5cf6',
        icono: departamento.icono || 'BuildingOfficeIcon'
      })
    } else {
      setSelectedDepartamento(null)
      setFormDataDepartamento({
        nombre: '',
        descripcion: '',
        color: '#8b5cf6',
        icono: 'BuildingOfficeIcon'
      })
    }
    setShowModalDepartamento(true)
  }

  const handleVerDetallesDepartamento = async (departamento) => {
    try {
      setDepartamentoDetalles(departamento)
      // Cargar usuarios del departamento
      const { data } = await api.get(`/usuarios?id_departamento=${departamento.id_departamento}`)
      setUsuariosDepartamento(data.data || data || [])
      setShowDetallesDepartamento(true)
    } catch (error) {
      console.error('Error al cargar detalles del departamento:', error)
      toast.error('Error al cargar los detalles del departamento')
    }
  }

  // Verificar permisos
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No tienes permisos para acceder a esta sección</p>
      </div>
    )
  }

  // Convertir datos para react-select
  const departamentosOptions = departamentos.map(dept => ({
    value: dept.id_departamento,
    label: dept.nombre
  }))

  const rolesOptions = roles.map(rol => ({
    value: rol.id_rol,
    label: rol.nombre
  }))

  return (
    <div id="main-content" className="gestion-usuarios-container">
      {/* Header */}
      <div className="gestion-header">
        <div>
          <h1 className="gestion-title">
            Gestión de Usuarios y Departamentos
          </h1>
          <p className="gestion-subtitle">
            Administra usuarios, roles y estructura organizativa
          </p>
        </div>
        <button
          onClick={() => activeTab === 'usuarios' ? openModalUsuario(null) : openModalDepartamento(null)}
          className="btn btn-primary"
        >
          <PlusIcon className="icon-left" />
          {activeTab === 'usuarios' ? 'Nuevo Usuario' : 'Nuevo Departamento'}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        {/* Sliding background indicator */}
        <div className={`tabs-slider ${activeTab === 'departamentos' ? 'departamentos' : ''}`}></div>
        
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
        >
          <UserGroupIcon className="tab-icon" />
          <span className="tab-text">Usuarios</span>
          {activeTab === 'usuarios' && <div className="tab-indicator" />}
        </button>
        <button
          onClick={() => setActiveTab('departamentos')}
          className={`tab-button ${activeTab === 'departamentos' ? 'active' : ''}`}
        >
          <BuildingOfficeIcon className="tab-icon" />
          <span className="tab-text">Departamentos</span>
          {activeTab === 'departamentos' && <div className="tab-indicator" />}
        </button>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'usuarios' ? (
        <>
          {/* Filtros de Usuarios */}
          <Card className="filters-card">
            <div className="filters-grid">
              <div className="filter-item">
                <label className="filter-label">
                  <BuildingOfficeIcon className="filter-icon" />
                  Departamento
                </label>
                <Select
                  value={departamentosOptions.find(opt => opt.value === parseInt(filtersUsuarios.departamento_id)) || null}
                  onChange={(selected) => setFiltersUsuarios(prev => ({
                    ...prev, 
                    departamento_id: selected ? String(selected.value) : ''
                  }))}
                  options={departamentosOptions}
                  styles={customSelectStyles}
                  placeholder="Todos los departamentos"
                  isClearable
                  isSearchable={false}
                  components={{ DropdownIndicator, ClearIndicator }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">
                  <UserIcon className="filter-icon" />
                  Rol
                </label>
                <Select
                  value={rolesOptions.find(opt => opt.value === parseInt(filtersUsuarios.rol_id)) || null}
                  onChange={(selected) => setFiltersUsuarios(prev => ({
                    ...prev, 
                    rol_id: selected ? String(selected.value) : ''
                  }))}
                  options={rolesOptions}
                  styles={customSelectStyles}
                  placeholder="Todos los roles"
                  isClearable
                  isSearchable={false}
                  components={{ DropdownIndicator, ClearIndicator }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            </div>
          </Card>

          {/* Lista de Usuarios */}
          <div className="list">
            <div className="list-header">
              <span className="list-header-title">Usuarios</span>
              <span className="list-count">
                {loadingUsuarios ? (
                  <div className="list-count-spinner">
                    <div className="animate-spin"></div>
                  </div>
                ) : (
                  usuarios.length
                )}
              </span>
            </div>

            {loadingUsuarios ? (
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
                  onClick={() => openModalUsuario(null)}
                  className="btn btn-primary btn-sm mt-3"
                >
                  <PlusIcon className="icon-left" />
                  Nuevo Usuario
                </button>
              </div>
            ) : (
              <div className="list-scrollable">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="list-item list-item-solicitud">
                    <UsuarioItem
                      usuario={usuario}
                      isAdmin={isAdmin}
                      onEditar={openModalUsuario}
                      onEliminar={handleDeleteUsuario}
                      onVerDetalles={handleVerDetallesUsuario}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Lista de Departamentos */}
          <div className="list">
            <div className="list-header">
              <span className="list-header-title">Departamentos</span>
              <span className="list-count">
                {loadingDepartamentos ? (
                  <div className="list-count-spinner">
                    <div className="animate-spin"></div>
                  </div>
                ) : (
                  departamentos.length
                )}
              </span>
            </div>

            {loadingDepartamentos ? (
              <div className="list-empty">
                <div className="list-empty-icon">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <div className="list-empty-title">Cargando departamentos...</div>
                <div className="list-empty-message">Obteniendo información de departamentos</div>
              </div>
            ) : departamentos.length === 0 ? (
              <div className="list-empty">
                <BuildingOfficeIcon className="list-empty-icon" />
                <div className="list-empty-title">Sin departamentos registrados</div>
                <div className="list-empty-message">Crea departamentos para organizar tu estructura</div>
                <button
                  onClick={() => openModalDepartamento(null)}
                  className="btn btn-primary btn-sm mt-3"
                >
                  <PlusIcon className="icon-left" />
                  Nuevo Departamento
                </button>
              </div>
            ) : (
              <div className="list-scrollable">
                {departamentos.map((departamento) => (
                  <div key={departamento.id_departamento} className="list-item list-item-incidencia">
                    <DepartamentoItem
                      departamento={departamento}
                      isAdmin={isAdmin}
                      onEditar={openModalDepartamento}
                      onEliminar={handleDeleteDepartamento}
                      onVerDetalles={handleVerDetallesDepartamento}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal para Usuario */}
      <Modal
        isOpen={showModalUsuario}
        onClose={() => setShowModalUsuario(false)}
        title={selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
        animationType="fade-scale"
      >
        <form onSubmit={handleSubmitUsuario} className="modal-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                required
                value={formDataUsuario.nombre}
                onChange={(e) => setFormDataUsuario(prev => ({...prev, nombre: e.target.value}))}
                className="form-input"
                placeholder="Nombre del usuario"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellidos *</label>
              <input
                type="text"
                required
                value={formDataUsuario.apellidos}
                onChange={(e) => setFormDataUsuario(prev => ({...prev, apellidos: e.target.value}))}
                className="form-input"
                placeholder="Apellidos del usuario"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              required
              value={formDataUsuario.email}
              onChange={(e) => setFormDataUsuario(prev => ({...prev, email: e.target.value}))}
              className="form-input"
              placeholder="email@empresa.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {selectedUsuario ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              required={!selectedUsuario}
              value={formDataUsuario.password}
              onChange={(e) => setFormDataUsuario(prev => ({...prev, password: e.target.value}))}
              className="form-input"
              placeholder={selectedUsuario ? "Dejar vacío para no cambiar" : "Contraseña"}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Rol *</label>
              <Select
                value={rolesOptions.find(opt => opt.value === parseInt(formDataUsuario.id_rol)) || null}
                onChange={(selected) => setFormDataUsuario(prev => ({
                  ...prev, 
                  id_rol: selected ? String(selected.value) : ''
                }))}
                options={rolesOptions}
                styles={customSelectStyles}
                placeholder="Seleccionar rol"
                isSearchable={false}
                components={{ DropdownIndicator, ClearIndicator }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Departamento</label>
              <Select
                value={departamentosOptions.find(opt => opt.value === parseInt(formDataUsuario.id_departamento)) || null}
                onChange={(selected) => setFormDataUsuario(prev => ({
                  ...prev, 
                  id_departamento: selected ? String(selected.value) : ''
                }))}
                options={departamentosOptions}
                styles={customSelectStyles}
                placeholder="Sin departamento"
                isClearable
                isSearchable={false}
                components={{ DropdownIndicator, ClearIndicator }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setShowModalUsuario(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {selectedUsuario ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para Departamento */}
      <Modal
        isOpen={showModalDepartamento}
        onClose={() => setShowModalDepartamento(false)}
        title={selectedDepartamento ? 'Editar Departamento' : 'Nuevo Departamento'}
        size="md"
        animationType="fade-scale"
      >
        <form onSubmit={handleSubmitDepartamento} className="modal-form">
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              required
              value={formDataDepartamento.nombre}
              onChange={(e) => setFormDataDepartamento(prev => ({...prev, nombre: e.target.value}))}
              className="form-input"
              placeholder="Nombre del departamento"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              value={formDataDepartamento.descripcion}
              onChange={(e) => setFormDataDepartamento(prev => ({...prev, descripcion: e.target.value}))}
              className="form-textarea"
              placeholder="Descripción del departamento (opcional)"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personalización del departamento</label>
            <div className="department-customization">
              <div className="customization-item">
                <label className="customization-label">Color</label>
                <input
                  type="color"
                  value={formDataDepartamento.color}
                  onChange={(e) => setFormDataDepartamento(prev => ({...prev, color: e.target.value}))}
                  className="color-input-compact"
                />
              </div>
              <div className="customization-item flex-1">
                <label className="customization-label">Icono</label>
                <button
                  type="button"
                  onClick={() => setShowIconPickerModal(true)}
                  className="icon-selector-button"
                >
                  {(() => {
                    const IconComponent = getIconComponent(formDataDepartamento.icono);
                    return (
                      <>
                        <div 
                          className="icon-selector-preview"
                          style={{ 
                            background: `linear-gradient(135deg, ${formDataDepartamento.color} 0%, ${formDataDepartamento.color}dd 100%)`
                          }}
                        >
                          <IconComponent />
                        </div>
                        <span className="icon-selector-label">
                          {DEPARTMENT_ICONS[formDataDepartamento.icono]?.label || 'Seleccionar icono'}
                        </span>
                        <ChevronDownIcon className="icon-selector-arrow" />
                      </>
                    );
                  })()}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setShowModalDepartamento(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {selectedDepartamento ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para seleccionar icono */}
      <Modal
        isOpen={showIconPickerModal}
        onClose={() => setShowIconPickerModal(false)}
        title="Seleccionar icono del departamento"
        size="md"
        animationType="fade-scale"
      >
        <div className="icon-picker-modal-content">
          <IconPicker 
            selectedIcon={formDataDepartamento.icono}
            onSelectIcon={(iconName) => {
              setFormDataDepartamento(prev => ({...prev, icono: iconName}))
              setShowIconPickerModal(false)
            }}
            color={formDataDepartamento.color}
          />
        </div>
      </Modal>

      {/* Modal de Detalles del Departamento */}
      <Modal
        isOpen={showDetallesDepartamento}
        onClose={() => setShowDetallesDepartamento(false)}
        title={`Detalles: ${departamentoDetalles?.nombre || ''}`}
        size="lg"
        variant="elegant"
        animationType="fade-scale"
      >
        <div className="space-y-5">
          {/* Header con información principal */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {departamentoDetalles?.nombre}
              </h3>
              {departamentoDetalles?.descripcion && (
                <p className="text-sm text-gray-600 mt-1">
                  {departamentoDetalles.descripcion}
                </p>
              )}
            </div>
            <span className="list-badge info">
              {usuariosDepartamento.length} {usuariosDepartamento.length === 1 ? 'usuario' : 'usuarios'}
            </span>
          </div>

          {/* Información del departamento */}
          <div className="space-y-0">
            <div className="modal-info-row">
              <div className="modal-info-label">
                <BuildingOfficeIcon />
                Nombre
              </div>
              <div className="modal-info-value">
                {departamentoDetalles?.nombre}
              </div>
            </div>

            {departamentoDetalles?.descripcion && (
              <div className="modal-info-row">
                <div className="modal-info-label">
                  <span className="text-gray-600">Descripción</span>
                </div>
                <div className="modal-info-value">
                  {departamentoDetalles.descripcion}
                </div>
              </div>
            )}

            <div className="modal-info-row">
              <div className="modal-info-label">
                <UserIcon />
                Usuarios asignados
              </div>
              <div className="modal-info-value">
                {usuariosDepartamento.length} {usuariosDepartamento.length === 1 ? 'usuario' : 'usuarios'}
              </div>
            </div>
          </div>

          {/* Lista de usuarios del departamento */}
          {usuariosDepartamento.length > 0 && (
            <div className="departamento-usuarios-list">
              <h4 className="usuarios-list-title">Usuarios del Departamento</h4>
              <div className="list-scrollable" style={{ maxHeight: '300px' }}>
                {usuariosDepartamento.map((usuario) => (
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
                        {usuario.role?.nombre || usuario.rol?.nombre || 'Sin rol'}
                      </div>
                    </div>
                    <span className={`list-item-badge ${
                      usuario.email_verified_at ? 'success' : 'warning'
                    }`}>
                      {usuario.email_verified_at ? 'Activo' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer con acciones */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setShowDetallesDepartamento(false)}
              className="btn btn-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Detalles del Usuario */}
      <Modal
        isOpen={showDetallesUsuario}
        onClose={() => setShowDetallesUsuario(false)}
        title="Detalles del Usuario"
        size="md"
        variant="elegant"
        animationType="fade-scale"
      >
        {usuarioDetalles && (
          <div className="space-y-5">
            {/* Header con información principal */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 flex-1">
                <div className="list-item-avatar" style={{ width: '3.5rem', height: '3.5rem', fontSize: '1.125rem' }}>
                  {`${usuarioDetalles.nombre?.[0] || ''}${usuarioDetalles.apellidos?.[0] || ''}`.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {usuarioDetalles.nombre} {usuarioDetalles.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {usuarioDetalles.email}
                  </p>
                </div>
              </div>
              <span className={`list-badge ${
                usuarioDetalles.activo || usuarioDetalles.email_verified_at ? 'success' : 'warning'
              }`}>
                {usuarioDetalles.activo || usuarioDetalles.email_verified_at ? 'Activo' : 'Pendiente'}
              </span>
            </div>

            {/* Información del usuario */}
            <div className="space-y-0">
              <div className="modal-info-row">
                <div className="modal-info-label">
                  <UserIcon />
                  Nombre completo
                </div>
                <div className="modal-info-value">
                  {usuarioDetalles.nombre} {usuarioDetalles.apellidos}
                </div>
              </div>

              <div className="modal-info-row">
                <div className="modal-info-label">
                  <EnvelopeIcon />
                  Email
                </div>
                <div className="modal-info-value">
                  {usuarioDetalles.email}
                </div>
              </div>

              <div className="modal-info-row">
                <div className="modal-info-label">
                  <span className="text-gray-600">Rol</span>
                </div>
                <div className="modal-info-value">
                  <span className="list-meta-badge info">
                    {usuarioDetalles.role?.nombre || usuarioDetalles.rol?.nombre || 'Sin rol'}
                  </span>
                </div>
              </div>

              <div className="modal-info-row">
                <div className="modal-info-label">
                  <BuildingOfficeIcon />
                  Departamento
                </div>
                <div className="modal-info-value">
                  {usuarioDetalles.departamento?.nombre || usuarioDetalles.department?.nombre || 'Sin departamento'}
                </div>
              </div>

              {(usuarioDetalles.fecha_alta || usuarioDetalles.created_at) && (
                <div className="modal-info-row">
                  <div className="modal-info-label">
                    <CalendarIcon />
                    Fecha de alta
                  </div>
                  <div className="modal-info-value">
                    {new Date(usuarioDetalles.fecha_alta || usuarioDetalles.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              )}

              <div className="modal-info-row">
                <div className="modal-info-label">
                  <span className="text-gray-600">Estado</span>
                </div>
                <div className="modal-info-value">
                  <span className={`list-meta-badge ${
                    usuarioDetalles.activo || usuarioDetalles.email_verified_at ? 'success' : 'warning'
                  }`}>
                    {usuarioDetalles.activo || usuarioDetalles.email_verified_at ? 'Cuenta activa' : 'Pendiente de verificación'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowDetallesUsuario(false)
                  openModalUsuario(usuarioDetalles)
                }}
                className="btn btn-primary"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDetallesUsuario(false)
                  handleDeleteUsuario(usuarioDetalles)
                }}
                className="btn btn-danger"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación para Eliminación de Usuario */}
      <ConfirmDialog
        isOpen={showConfirmDeleteUsuario}
        onClose={() => {
          setShowConfirmDeleteUsuario(false)
          setUsuarioToDelete(null)
        }}
        onConfirm={confirmDeleteUsuario}
        title="¿Eliminar usuario?"
        message={`¿Estás seguro de que deseas eliminar al usuario "${usuarioToDelete?.nombre} ${usuarioToDelete?.apellidos}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        variant="elegant"
        animationOrigin="center"
      />

      {/* Modal de Confirmación para Eliminación de Departamento */}
      <ConfirmDialog
        isOpen={showConfirmDeleteDepartamento}
        onClose={() => {
          setShowConfirmDeleteDepartamento(false)
          setDepartamentoToDelete(null)
        }}
        onConfirm={confirmDeleteDepartamento}
        title="¿Eliminar departamento?"
        message={`¿Estás seguro de que deseas eliminar el departamento "${departamentoToDelete?.nombre}"? Esta acción no se puede deshacer. Los usuarios asignados quedarán sin departamento.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        variant="elegant"
        animationOrigin="center"
      />

      {/* Toast Container */}
      <ToastContainer 
        toasts={toast.toasts} 
        onRemove={toast.removeToast} 
      />
    </div>
  )
}
