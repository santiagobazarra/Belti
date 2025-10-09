import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import SimpleChart from '../../components/SimpleChart'
import StatCard from '../../components/StatCard'
import DatePicker from '../../components/DatePicker'
import Select from 'react-select'
import Card from '../../components/Card'
import {
  DocumentChartBarIcon,
  ClockIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import './css/Reportes.css'
import '../../components/css-components/modal-styles.css'

// Componente Spinner personalizado
const Spinner = ({ size = 'h-4 w-4' }) => (
  <ArrowPathIcon className={`${size} animate-spin`} />
)

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

// Estilos personalizados para React Select - Igual que Solicitudes
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
  inputContainer: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    outline: 'none',
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent'
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: 'rgb(55, 65, 81)',
    caretColor: 'rgb(55, 65, 81)',
    fontSize: '0.875rem',
    backgroundColor: 'transparent',
    outline: 'none',
    border: 'none',
    boxShadow: 'none'
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
    transition: 'all 0.15s',
    '&:active': {
      backgroundColor: state.isSelected ? 'rgb(37, 99, 235)' : 'rgb(219, 234, 254)'
    }
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 40
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
    fontSize: '0.875rem',
    padding: '12px'
  })
}

// Opciones para los selects
const TIPOS_REPORTE = [
  { value: 'jornadas', label: 'Jornadas' },
  { value: 'solicitudes', label: 'Solicitudes' },
  { value: 'incidencias', label: 'Incidencias' },
  { value: 'resumen', label: 'Resumen General' }
]

const ESTADOS_SOLICITUD = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'rechazada', label: 'Rechazada' }
]

const TIPOS_INCIDENCIA = [
  { value: 'falta', label: 'Falta' },
  { value: 'retraso', label: 'Retraso' },
  { value: 'ausencia_parcial', label: 'Ausencia parcial' }
]

export default function Reportes() {
  const { user } = useAuth()
  const [filtros, setFiltros] = useState({
    tipo_reporte: 'resumen',
    fecha_inicio: '',
    fecha_fin: '',
    usuario_id: '',
    departamento_id: '',
    estado: '',
    tipo_incidencia: ''
  })
  const [usuarios, setUsuarios] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingCSV, setLoadingCSV] = useState(false)
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [chartKey, setChartKey] = useState(0)

  const isAdmin = user?.role?.slug === 'administrador' || user?.role?.nombre?.toLowerCase() === 'administrador'
  
  // Debug para verificar el estado del usuario (solo una vez)
  console.log('🔍 Debug isAdmin:', isAdmin, 'Role:', user?.role?.slug)

  // Función para crear Date desde string sin problemas de timezone
  const createDateFromString = (dateString) => {
    if (!dateString || dateString === '') return null
    
    try {
      // Si ya es formato ISO completo, usarlo directamente
      let dateStr = dateString;
      
      // Si es solo YYYY-MM-DD, agregar T00:00:00
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        dateStr = dateString + 'T00:00:00';
      }
      
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) ? date : null;
    } catch (error) {
      return null;
    }
  }

  useEffect(() => {
    loadUsuarios()
    loadDepartamentos()
  }, [isAdmin])

  // Limpiar datos cuando cambia el tipo de reporte
  useEffect(() => {
    if (datos) {
      setDatos(null)
    }
    
    // Limpiar filtros específicos del tipo de reporte anterior
    setFiltros(prev => ({
      ...prev,
      estado: '',
      tipo_incidencia: ''
    }))
  }, [filtros.tipo_reporte])

  const loadUsuarios = async () => {
    // Solo cargar usuarios si el usuario actual es admin
    if (!isAdmin) {
      setUsuarios([])
      return
    }

    try {
      const response = await api.get('/usuarios')
      const usuariosData = response.data?.data || response.data || []
      
      // Filtrar usuarios que tengan id_usuario válido
      const usuariosValidos = usuariosData.filter(u => u && u.id_usuario !== undefined && u.id_usuario !== null)
      console.log('✅ Usuarios cargados:', usuariosValidos.length, 'usuarios')
      setUsuarios(usuariosValidos)
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error)
      setUsuarios([])
    }
  }

  const loadDepartamentos = async () => {
    // Solo cargar departamentos si el usuario actual es admin
    if (!isAdmin) {
      setDepartamentos([])
      return
    }

    try {
      const response = await api.get('/departamentos')
      const departamentosData = response.data?.data || response.data || []
      
      // Filtrar departamentos que tengan id_departamento válido
      const departamentosValidos = departamentosData.filter(d => d && d.id_departamento !== undefined && d.id_departamento !== null)
      console.log('✅ Departamentos cargados:', departamentosValidos.length, 'departamentos')
      setDepartamentos(departamentosValidos)
    } catch (error) {
      console.error('❌ Error al cargar departamentos:', error)
      setDepartamentos([])
    }
  }


  const generarReporte = async () => {
    setLoading(true)
    
    try {
      // Validar que las fechas estén seleccionadas
      if (!filtros.fecha_inicio || !filtros.fecha_fin) {
        alert('Por favor selecciona las fechas de inicio y fin para el reporte')
        setLoading(false)
        return
      }

      // Construir parámetros para la API
      const params = new URLSearchParams({
        desde: filtros.fecha_inicio,
        hasta: filtros.fecha_fin
      })

      // Añadir filtros adicionales si están seleccionados
      if (filtros.usuario_id) params.append('id_usuario', filtros.usuario_id)
      if (filtros.departamento_id) params.append('id_departamento', filtros.departamento_id)
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.tipo_incidencia) params.append('tipo', filtros.tipo_incidencia)

      // Determinar endpoint según el tipo de reporte
      let endpoint = ''
      switch (filtros.tipo_reporte) {
        case 'jornadas':
          endpoint = '/reportes/jornadas'
          break
        case 'solicitudes':
          endpoint = '/reportes/solicitudes'
          break
        case 'incidencias':
          endpoint = '/reportes/incidencias'
          break
        default:
          endpoint = '/reportes/resumen'
      }

      // Llamar a la API real
      const { data } = await api.get(`${endpoint}?${params}`)
      
        // Transformar datos de la API al formato esperado por las gráficas
        const datosTransformados = transformarDatosAPI(data, filtros.tipo_reporte)
        
        // Validar que los datos transformados sean válidos
        if (!datosTransformados || !datosTransformados.graficas || !Array.isArray(datosTransformados.graficas)) {
          throw new Error('Formato de datos inválido recibido del servidor')
        }
        
        // Validar cada gráfica
        datosTransformados.graficas.forEach((grafica, index) => {
          if (!grafica.datos || !Array.isArray(grafica.datos.labels)) {
            console.error(`Gráfica ${index} tiene datos inválidos:`, grafica)
            throw new Error(`Datos de gráfica ${index} inválidos`)
          }
        })
        
        setDatos(datosTransformados)
        
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
          setChartKey(prev => prev + 1) // Forzar recreación de gráficos
        }, 100)
      
    } catch (error) {
      console.error('Error al generar reporte:', error)
      alert('Error al generar el reporte. Inténtalo de nuevo.')
      setDatos(null) // Limpiar datos en caso de error
    } finally {
      setLoading(false)
    }
  }

  const descargarCSV = async () => {
    if (!filtros.fecha_inicio || !filtros.fecha_fin) {
      alert('Por favor selecciona las fechas de inicio y fin para el reporte')
      return
    }

    setLoadingCSV(true)
    try {
      // Construir parámetros para la API
      const params = new URLSearchParams({
        desde: filtros.fecha_inicio,
        hasta: filtros.fecha_fin
      })

      // Añadir filtros adicionales si están seleccionados
      if (filtros.usuario_id) params.append('id_usuario', filtros.usuario_id)
      if (filtros.departamento_id) params.append('id_departamento', filtros.departamento_id)
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.tipo_incidencia) params.append('tipo', filtros.tipo_incidencia)

      // Determinar endpoint según el tipo de reporte
      let endpoint = ''
      switch (filtros.tipo_reporte) {
        case 'jornadas':
          endpoint = '/reportes/jornadas.csv'
          break
        case 'solicitudes':
          endpoint = '/reportes/solicitudes.csv'
          break
        case 'incidencias':
          endpoint = '/reportes/incidencias.csv'
          break
        default:
          endpoint = '/reportes/resumen.csv'
      }

      // Descargar archivo CSV
      const response = await api.get(`${endpoint}?${params}`, {
        responseType: 'blob'
      })

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte_${filtros.tipo_reporte}_${filtros.fecha_inicio}_${filtros.fecha_fin}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar CSV:', error)
      alert('Error al descargar el archivo CSV. Inténtalo de nuevo.')
    } finally {
      setLoadingCSV(false)
    }
  }

  const descargarPDF = async () => {
    if (!filtros.fecha_inicio || !filtros.fecha_fin) {
      alert('Por favor selecciona las fechas de inicio y fin para el reporte')
      return
    }

    setLoadingPDF(true)
    try {
      // Construir parámetros para la API
      const params = new URLSearchParams({
        desde: filtros.fecha_inicio,
        hasta: filtros.fecha_fin
      })

      // Añadir filtros adicionales si están seleccionados
      if (filtros.usuario_id) params.append('id_usuario', filtros.usuario_id)
      if (filtros.departamento_id) params.append('id_departamento', filtros.departamento_id)
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.tipo_incidencia) params.append('tipo', filtros.tipo_incidencia)

      // Determinar endpoint según el tipo de reporte
      let endpoint = ''
      switch (filtros.tipo_reporte) {
        case 'jornadas':
          endpoint = '/reportes/jornadas.pdf'
          break
        case 'solicitudes':
          endpoint = '/reportes/solicitudes.pdf'
          break
        case 'incidencias':
          endpoint = '/reportes/incidencias.pdf'
          break
        default:
          endpoint = '/reportes/resumen.pdf'
      }

      // Descargar archivo PDF
      const response = await api.get(`${endpoint}?${params}`, {
        responseType: 'blob'
      })

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte_${filtros.tipo_reporte}_${filtros.fecha_inicio}_${filtros.fecha_fin}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar PDF:', error)
      alert('Error al descargar el archivo PDF. Inténtalo de nuevo.')
    } finally {
      setLoadingPDF(false)
    }
  }

  // Función para transformar datos de la API al formato de las gráficas
  const transformarDatosAPI = (dataAPI, tipoReporte) => {
    switch (tipoReporte) {
      case 'jornadas':
        return {
          estadisticas: [
            { titulo: 'Horas Totales', valor: dataAPI.estadisticas.total_horas, formato: 'duration', color: 'primary', trend: 'up', trendValue: 4.2 },
            { titulo: 'Horas Extra', valor: dataAPI.estadisticas.horas_extra, formato: 'duration', color: 'warning', trend: 'up', trendValue: 8.1 },
            { titulo: 'Jornadas Completas', valor: dataAPI.estadisticas.jornadas_completas, formato: 'number', color: 'success', trend: 'down', trendValue: -2.1 },
            { titulo: 'Puntualidad', valor: dataAPI.estadisticas.puntualidad, formato: 'percentage', color: 'primary', trend: 'up', trendValue: 1.2 }
          ],
          graficas: dataAPI.graficas
        }

      case 'solicitudes':
        return {
          estadisticas: [
            { titulo: 'Total Solicitudes', valor: dataAPI.estadisticas.total_solicitudes, formato: 'number', color: 'primary', trend: 'up', trendValue: 12.5 },
            { titulo: 'Tasa de Aprobación', valor: dataAPI.estadisticas.tasa_aprobacion, formato: 'percentage', color: 'success', trend: 'up', trendValue: 3.2 },
            { titulo: 'Días Promedio', valor: dataAPI.estadisticas.dias_promedio, formato: 'duration', color: 'warning', trend: 'down', trendValue: -1.8 },
            { titulo: 'Pendientes', valor: dataAPI.estadisticas.pendientes, formato: 'number', color: 'danger', trend: 'down', trendValue: -5.3 }
          ],
          graficas: dataAPI.graficas
        }

      case 'incidencias':
        return {
          estadisticas: [
            { titulo: 'Total Incidencias', valor: dataAPI.estadisticas.total_incidencias, formato: 'number', color: 'danger', trend: 'down', trendValue: -8.3 },
            { titulo: 'Tasa de Resolución', valor: dataAPI.estadisticas.tasa_resolucion, formato: 'percentage', color: 'success', trend: 'up', trendValue: 5.7 },
            { titulo: 'Pendientes', valor: dataAPI.estadisticas.pendientes, formato: 'number', color: 'primary', trend: 'down', trendValue: -15.2 },
            { titulo: 'Aprobadas', valor: dataAPI.estadisticas.aprobadas, formato: 'number', color: 'success', trend: 'up', trendValue: 12.1 }
          ],
          graficas: dataAPI.graficas
        }

      default: // resumen
        return {
          estadisticas: [
            { titulo: 'Total Horas', valor: dataAPI.totales.horas_netas, formato: 'duration', color: 'primary', trend: 'up', trendValue: 4.2 },
            { titulo: 'Horas Extra', valor: dataAPI.totales.horas_extra, formato: 'duration', color: 'warning', trend: 'up', trendValue: 8.3 },
            { titulo: 'Días Trabajados', valor: dataAPI.totales.dias_trabajados, formato: 'number', color: 'success', trend: 'up', trendValue: 2.1 },
            { titulo: 'Déficit/Superávit', valor: dataAPI.totales.horas_deficit, formato: 'duration', color: dataAPI.totales.horas_deficit >= 0 ? 'danger' : 'success', trend: dataAPI.totales.horas_deficit >= 0 ? 'down' : 'up', trendValue: 1.2 }
          ],
          graficas: [{
            titulo: `Resumen de Actividad (${filtros.fecha_inicio} - ${filtros.fecha_fin})`,
            tipo: 'bar',
            datos: {
              labels: dataAPI.detalle.map(item => item.fecha),
              datasets: [
                {
                  label: 'Horas Trabajadas',
                  data: dataAPI.detalle.map(item => item.horas_netas),
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 2,
                },
                {
                  label: 'Horas Extra',
                  data: dataAPI.detalle.map(item => item.horas_extra),
                  backgroundColor: 'rgba(245, 158, 11, 0.8)',
                  borderColor: 'rgba(245, 158, 11, 1)',
                  borderWidth: 2,
                }
              ]
            }
          }]
        }
    }
  }

  const getIconForReport = (tipo) => {
    switch (tipo) {
      case 'jornadas': return ClockIcon
      case 'solicitudes': return EnvelopeIcon
      case 'incidencias': return ExclamationTriangleIcon
      default: return ChartBarIcon
    }
  }

  return (
    <div className="reportes-page">
      {/* Header */}
      <div className="reportes-header">
        <h1 className="reportes-title">
          {isAdmin ? 'Sistema de Reportes' : 'Mis Reportes'}
        </h1>
        <p className="reportes-subtitle">
          {isAdmin ? 'Genera y consulta reportes detallados del sistema de control horario' : 'Consulta tus estadísticas y datos laborales'}
        </p>
      </div>

      {/* Filtros con componentes mejorados */}
      <Card className="card-interactive overflow-visible">
        <div className="flex flex-col gap-4">
          {/* PRIMERA FILA: Elementos básicos siempre presentes */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <Select
                components={{ DropdownIndicator }}
                styles={customSelectStyles}
                value={TIPOS_REPORTE.find(t => t.value === filtros.tipo_reporte)}
                onChange={(option) => setFiltros(prev => ({...prev, tipo_reporte: option.value}))}
                options={TIPOS_REPORTE}
                isClearable={false}
                placeholder="Selecciona tipo de reporte"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isSearchable={false}
              />
      </div>

            <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
              <DatePicker
                selected={createDateFromString(filtros.fecha_inicio)}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    setFiltros(prev => ({
                      ...prev, 
                      fecha_inicio: `${year}-${month}-${day}`
                    }))
                  } else {
                    setFiltros(prev => ({...prev, fecha_inicio: ''}))
                  }
                }}
                placeholder="Seleccionar fecha"
            />
          </div>

            <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
              <DatePicker
                selected={createDateFromString(filtros.fecha_fin)}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    setFiltros(prev => ({
                      ...prev, 
                      fecha_fin: `${year}-${month}-${day}`
                    }))
                  } else {
                    setFiltros(prev => ({...prev, fecha_fin: ''}))
                  }
                }}
                placeholder="Seleccionar fecha"
            />
          </div>
          </div>

          {/* SEGUNDA FILA: Elementos condicionales - siempre en grupos de 2 o 3 */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <Select
                  components={{ DropdownIndicator, ClearIndicator }}
                  styles={customSelectStyles}
                  value={usuarios.find(u => u?.id_usuario?.toString() === filtros.usuario_id) || null}
                  onChange={(option) => setFiltros(prev => ({...prev, usuario_id: option?.id_usuario?.toString() || ''}))}
                  options={usuarios}
                  getOptionLabel={(option) => `${option?.nombre || ''} ${option?.apellidos || ''}`}
                  getOptionValue={(option) => option?.id_usuario?.toString() || ''}
                  isClearable
                  isSearchable
                  placeholder="Todos los usuarios"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  noOptionsMessage={() => 'No hay usuarios disponibles'}
                />
    </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <Select
                  components={{ DropdownIndicator, ClearIndicator }}
                  styles={customSelectStyles}
                  value={departamentos.find(d => d?.id_departamento?.toString() === filtros.departamento_id) || null}
                  onChange={(option) => setFiltros(prev => ({...prev, departamento_id: option?.id_departamento?.toString() || ''}))}
                  options={departamentos}
                  getOptionLabel={(option) => option?.nombre || ''}
                  getOptionValue={(option) => option?.id_departamento?.toString() || ''}
                  isClearable
                  isSearchable
                  placeholder="Todos los departamentos"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  noOptionsMessage={() => 'No hay departamentos disponibles'}
                />
              </div>

              {/* TERCER ELEMENTO DE LA SEGUNDA FILA - Condicional por tipo de reporte */}
              {filtros.tipo_reporte === 'solicitudes' && (
                <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
            </label>
                  <Select
                    components={{ DropdownIndicator, ClearIndicator }}
                    styles={customSelectStyles}
                    value={ESTADOS_SOLICITUD.find(e => e.value === filtros.estado)}
                    onChange={(option) => setFiltros(prev => ({...prev, estado: option?.value || ''}))}
                    options={ESTADOS_SOLICITUD}
                    isClearable
                    placeholder="Todos los estados"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable={false}
            />
          </div>
              )}

              {filtros.tipo_reporte === 'incidencias' && (
                <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Incidencia
            </label>
                  <Select
                    components={{ DropdownIndicator, ClearIndicator }}
                    styles={customSelectStyles}
                    value={TIPOS_INCIDENCIA.find(t => t.value === filtros.tipo_incidencia)}
                    onChange={(option) => setFiltros(prev => ({...prev, tipo_incidencia: option?.value || ''}))}
                    options={TIPOS_INCIDENCIA}
                    isClearable
                    placeholder="Todos los tipos"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable={false}
            />
          </div>
              )}
            </div>
          )}

          {/* Para usuarios NO admin - Elementos condicionales por tipo */}
          {!isAdmin && (
            <div className="flex flex-col sm:flex-row gap-4">
              {filtros.tipo_reporte === 'solicitudes' && (
                <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
                  <Select
                    components={{ DropdownIndicator, ClearIndicator }}
                    styles={customSelectStyles}
                    value={ESTADOS_SOLICITUD.find(e => e.value === filtros.estado)}
                    onChange={(option) => setFiltros(prev => ({...prev, estado: option?.value || ''}))}
                    options={ESTADOS_SOLICITUD}
                    isClearable
                    placeholder="Todos los estados"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable={false}
                  />
                </div>
              )}

              {filtros.tipo_reporte === 'incidencias' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Incidencia
                  </label>
                  <Select
                    components={{ DropdownIndicator, ClearIndicator }}
                    styles={customSelectStyles}
                    value={TIPOS_INCIDENCIA.find(t => t.value === filtros.tipo_incidencia)}
                    onChange={(option) => setFiltros(prev => ({...prev, tipo_incidencia: option?.value || ''}))}
                    options={TIPOS_INCIDENCIA}
                    isClearable
                    placeholder="Todos los tipos"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={descargarCSV}
              disabled={loading || loadingCSV || loadingPDF}
              className="btn-download-csv"
            >
              {loadingCSV ? (
                <Spinner size="h-4 w-4" />
              ) : (
                <DocumentTextIcon className="h-4 w-4" />
              )}
              <span className="ml-2">
                {loadingCSV ? 'Generando...' : 'Descargar CSV'}
              </span>
            </button>
            <button
              onClick={descargarPDF}
              disabled={loading || loadingCSV || loadingPDF}
              className="btn-download-pdf"
            >
              {loadingPDF ? (
                <Spinner size="h-4 w-4" />
              ) : (
                <DocumentArrowDownIcon className="h-4 w-4" />
              )}
              <span className="ml-2">
                {loadingPDF ? 'Generando...' : 'Descargar PDF'}
              </span>
            </button>
          </div>
          <button
            onClick={generarReporte}
            disabled={loading || loadingCSV || loadingPDF}
            className="btn btn-primary"
          >
            {loading ? (
              <Spinner size="h-5 w-5" />
            ) : (
              <DocumentChartBarIcon className="h-5 w-5" />
            )}
            <span className="ml-2">
              {loading ? 'Generando...' : 'Generar Reporte'}
            </span>
          </button>
        </div>
      </Card>

      {/* Resultados */}
      {datos && (
        <div className="reportes-results mt-8">
          <div className="reportes-results-header">
            <h3 className="reportes-results-title">
              {(() => {
                const IconComponent = getIconForReport(filtros.tipo_reporte)
                return <IconComponent />
              })()}
              Reporte de {TIPOS_REPORTE.find(t => t.value === filtros.tipo_reporte)?.label}
            </h3>
          </div>
          <div className="reportes-results-content">
            {/* Estadísticas */}
            <div className="reportes-stats-grid">
              {datos.estadisticas.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.titulo}
                  value={stat.valor}
                  format={stat.formato}
                  icon={getIconForReport(filtros.tipo_reporte)}
                  color={stat.color}
                  trend={stat.trend}
                  trendValue={stat.trendValue}
                />
              ))}
          </div>

            {/* Gráficas */}
            {datos.graficas.map((grafica, index) => (
              <SimpleChart
                key={`${chartKey}-${index}`}
                title={grafica.titulo}
                type={grafica.tipo}
                data={grafica.datos}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="reportes-results mt-8">
          <div className="reportes-results-content">
            <div className="reporte-loading">
              <div className="reporte-loading-icon"></div>
              <div className="reporte-loading-title">Generando reporte...</div>
              <div className="reporte-loading-message">Procesando datos del servidor</div>
            </div>
          </div>
      </div>
      )}
    </div>
  )
}