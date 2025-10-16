import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import Select from 'react-select'
import DatePicker from '../../components/DatePicker'
import Modal from '../../components/Modal'
import Card from '../../components/Card'
import List from '../../components/List'
import { AuditoriaItem } from '../../components/ListItems'
import './css/Auditoria.css'
import '../../components/css-components/List.css'
import './css/AuditoriaModal.css'
import { ShieldCheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import AuditModalBody from './components/AuditModalBody'

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
    padding: 0,
    color: 'transparent',
    caretColor: 'transparent'
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
    zIndex: 9999
  }),
  menuList: (base) => ({
    ...base,
    padding: '8px',
    maxHeight: '300px'
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '88px',
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

// Opciones para los selects
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
  { value: 'Pausa', label: 'Pausas' },
  { value: 'User', label: 'Usuarios' },
  { value: 'Festivo', label: 'Festivos' },
  { value: 'Department', label: 'Departamentos' },
  { value: 'Role', label: 'Roles' }
]

export default function Auditoria () {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    model: null,
    usuario_id: null,
    accion: null,
    desde: '',
    hasta: ''
  })
  const [selectedLog, setSelectedLog] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 20
  })

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.model?.value) params.append('model', filters.model.value)
      if (filters.usuario_id?.value) params.append('usuario_id', filters.usuario_id.value)
      if (filters.accion?.value) params.append('accion', filters.accion.value)
      if (filters.desde) params.append('desde', filters.desde)
      if (filters.hasta) params.append('hasta', filters.hasta)

      params.append('page', pagination.currentPage)
      params.append('per_page', pagination.perPage)

      const { data } = await api.get(`/audit-logs?${params}`)

      setLogs(data.data || [])
      setPagination(prev => ({
        ...prev,
        totalPages: data.last_page || 1,
        total: data.total || 0
      }))
    } catch (error) {
      console.error('Error al cargar logs de auditoría:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.currentPage, pagination.perPage])

  const loadUsuarios = useCallback(async () => {
    try {
      const { data } = await api.get('/usuarios')
      setUsuarios(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadLogs()
      loadUsuarios()
    }
  }, [isAdmin, loadLogs, loadUsuarios])

  if (!isAdmin) {
    return (
      <div className='text-center py-8'>
        <ShieldCheckIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
        <p className='text-gray-600'>No tienes permisos para acceder a esta sección</p>
      </div>
    )
  }

  const openModal = async (log) => {
    try {
      const response = await api.get(`/audit-logs/${log.id}`)
      setSelectedLog(response.data)
    } catch (error) {
      console.error('Error al obtener log detallado:', error)
      setSelectedLog(log) // Fallback to the basic log info
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedLog(null)
  }

  const createDateFromString = (dateString) => {
    if (!dateString) return null;
    // The string is in 'YYYY-MM-DD' format. Appending 'T00:00:00' ensures it's parsed as local time.
    const date = new Date(`${dateString}T00:00:00`);
    // Check if the created date is valid
    if (isNaN(date.getTime())) {
        console.error('Error parsing date:', dateString);
        return null;
    }
    return date;
  }

  const generatePageNumbers = () => {
    const pages = []
    const { currentPage, totalPages } = pagination

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }))
    }
  }

  const goToPreviousPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
    }
  }

  const goToNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
    }
  }

  const getLogDescription = (log) => {
    const action = log.action
    const modelType = log.model_type.split('\\').pop()
    const modelId = log.model_id

    const actionText = {
      created: 'creó',
      updated: 'modificó',
      deleted: 'eliminó'
    }[action] || 'actualizó'

    const modelDescriptions = {
      Incidencia: `${actionText} la incidencia #${modelId}`,
      Solicitud: `${actionText} la solicitud #${modelId}`,
      Jornada: `${actionText} el registro de jornada #${modelId}`,
      Pausa: `${actionText} el registro de pausa #${modelId}`,
      User: `${actionText} el usuario #${modelId}`,
      Festivo: `${actionText} el festivo #${modelId}`,
      Department: `${actionText} el departamento #${modelId}`,
      Role: `${actionText} el rol #${modelId}`
    }

    return modelDescriptions[modelType] || `${actionText} ${modelType} #${modelId}`
  }

  const usuariosOptions = [
    { value: '', label: 'Todos los usuarios' },
    ...usuarios.map(u => ({
      value: u.id,
      label: u.nombre && u.apellidos ? `${u.nombre} ${u.apellidos}` : u.email || 'Sin nombre'
    }))
  ]

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Auditoría del Sistema
          </h1>
          <p className='text-gray-600 mt-1 auditoria-subtitle'>
            Retención mínima 4 años • Cumplimiento RDL 8/2019
          </p>
        </div>
      </div>

      <Card>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
          <div className='w-full'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Modelo
            </label>
            <Select
              options={MODELOS}
              value={filters.model}
              onChange={(option) => setFilters(prev => ({ ...prev, model: option }))}
              placeholder='Seleccionar modelo'
              isClearable
              isSearchable={false}
              styles={customSelectStyles}
              components={{ DropdownIndicator }}
              menuPortalTarget={document.body}
              menuPosition='fixed'
            />
          </div>
          <div className='w-full'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Usuario
            </label>
            <Select
              options={usuariosOptions}
              value={filters.usuario_id}
              onChange={(option) => setFilters(prev => ({ ...prev, usuario_id: option }))}
              placeholder='Seleccionar usuario'
              isClearable
              styles={customSelectStyles}
              components={{ DropdownIndicator }}
              menuPortalTarget={document.body}
              menuPosition='fixed'
            />
          </div>
          <div className='w-full'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Acción
            </label>
            <Select
              options={ACCIONES}
              value={filters.accion}
              onChange={(option) => setFilters(prev => ({ ...prev, accion: option }))}
              placeholder='Seleccionar acción'
              isClearable
              isSearchable={false}
              styles={customSelectStyles}
              components={{ DropdownIndicator }}
              menuPortalTarget={document.body}
              menuPosition='fixed'
            />
          </div>
          <div className='w-full'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Desde
            </label>
            <DatePicker
              selected={createDateFromString(filters.desde)}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  setFilters(prev => ({ ...prev, desde: `${year}-${month}-${day}` }))
                } else {
                  setFilters(prev => ({ ...prev, desde: '' }))
                }
              }}
              placeholder='Seleccionar fecha'
            />
          </div>
          <div className='w-full'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Hasta
            </label>
            <DatePicker
              selected={createDateFromString(filters.hasta)}
              onChange={(date) => {
                if (date) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  setFilters(prev => ({ ...prev, hasta: `${year}-${month}-${day}` }))
                } else {
                  setFilters(prev => ({ ...prev, hasta: '' }))
                }
              }}
              placeholder='Seleccionar fecha'
            />
          </div>
        </div>
      </Card>

      <List
        items={logs}
        renderItem={(log) => (
          <AuditoriaItem
            log={log}
            description={getLogDescription(log)}
            onVerDetalles={openModal}
          />
        )}
        config={{
          variant: 'custom',
          itemKey: 'id',
          showHeader: true,
          headerText: 'Registro de Actividades del Sistema',
          headerCount: pagination.total,
          loading,
          emptyState: (
            <div className='list-empty'>
              <ShieldCheckIcon className='list-empty-icon' />
              <div className='list-empty-title'>Sin registros de auditoría</div>
              <div className='list-empty-message'>No se encontraron registros con los filtros seleccionados</div>
            </div>
          )
        }}
      />

      {!loading && logs.length > 0 && pagination.totalPages > 1 && (
        <div className='pagination'>
          <div className='pagination-controls'>
            <button
              onClick={goToPreviousPage}
              disabled={pagination.currentPage === 1}
              className='pagination-button'
              title='Página anterior'
            >
              <ChevronLeftIcon className='h-5 w-5' />
            </button>

            <div className='pagination-pages'>
              {generatePageNumbers().map((page, index) => (
                page === '...'
                  ? (
                    <span key={`ellipsis-${index}`} className='pagination-ellipsis'>
                      ...
                    </span>
                    )
                  : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`pagination-page ${pagination.currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                    )
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className='pagination-button'
              title='Página siguiente'
            >
              <ChevronRightIcon className='h-5 w-5' />
            </button>
          </div>

          <div className='pagination-info'>
            Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de {pagination.total} registros
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        variant='elegant'
        size='lg'
        animationType='fade-scale'
        title='Registro de Auditoría - Información Detallada'
        titleClassName='text-lg font-bold text-gray-800'
      >
        {selectedLog && <AuditModalBody log={selectedLog} />}
      </Modal>
    </div>
  )
}