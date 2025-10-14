import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import SimpleChart from '../../components/SimpleChart'
import StatCard from '../../components/StatCard'
import DatePicker from '../../components/DatePicker'
import Select from 'react-select'
import Card from '../../components/Card'
import ToastContainer from '../../components/ToastContainer'
import useToast from '../../hooks/useToast'
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
  const toast = useToast()
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
        toast.error('Por favor selecciona las fechas de inicio y fin para generar el reporte')
        setLoading(false)
        return
      }

      // Validar que la fecha de inicio no sea posterior a la fecha de fin
      if (new Date(filtros.fecha_inicio) > new Date(filtros.fecha_fin)) {
        toast.error('La fecha de inicio no puede ser posterior a la fecha de fin')
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
          toast.success('Reporte generado correctamente')
        }, 100)
      
    } catch (error) {
      console.error('Error al generar reporte:', error)
      toast.error('Error al generar el reporte. Inténtalo de nuevo.')
      setDatos(null) // Limpiar datos en caso de error
    } finally {
      setLoading(false)
    }
  }

  const descargarCSV = async () => {
    if (!filtros.fecha_inicio || !filtros.fecha_fin) {
      toast.error('Por favor selecciona las fechas de inicio y fin para descargar el CSV')
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
      
      toast.success('Archivo CSV descargado correctamente')
    } catch (error) {
      console.error('Error al descargar CSV:', error)
      toast.error('Error al descargar el archivo CSV. Inténtalo de nuevo.')
    } finally {
      setLoadingCSV(false)
    }
  }

  const descargarPDF = async () => {
    if (!filtros.fecha_inicio || !filtros.fecha_fin) {
      toast.error('Por favor selecciona las fechas de inicio y fin para descargar el PDF')
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
      
      toast.success('Archivo PDF descargado correctamente')
    } catch (error) {
      console.error('Error al descargar PDF:', error)
      toast.error('Error al descargar el archivo PDF. Inténtalo de nuevo.')
    } finally {
      setLoadingPDF(false)
    }
  }

  // Función para transformar datos de la API al formato de las gráficas
  const transformarDatosAPI = (dataAPI, tipoReporte) => {
    switch (tipoReporte) {
      case 'jornadas':
        // Calcular porcentajes reales basados en los datos
        const jornadasCompletas = dataAPI.estadisticas.jornadas_completas || 0
        const diasTrabajadosJornadas = dataAPI.estadisticas.dias_trabajados || 1
        const totalHorasJornadas = dataAPI.estadisticas.total_horas || 0
        const horasExtraJornadas = dataAPI.estadisticas.horas_extra || 0
        const totalPausas = dataAPI.estadisticas.total_pausas || 0
        
        const porcentajeCompletitud = diasTrabajadosJornadas > 0 ? (jornadasCompletas / diasTrabajadosJornadas) * 100 : 0
        const porcentajeHorasExtraJornadas = totalHorasJornadas > 0 ? (horasExtraJornadas / totalHorasJornadas) * 100 : 0
        const porcentajePausas = totalHorasJornadas > 0 ? (totalPausas / (totalHorasJornadas + totalPausas)) * 100 : 0
        
        return {
          estadisticas: [
            { 
              titulo: 'Horas Totales', 
              valor: totalHorasJornadas, 
              formato: 'duration', 
              color: 'primary', 
              trend: 'up', 
              trendValue: 4.2,
              tooltip: 'Total de horas trabajadas en el período seleccionado, incluyendo horas regulares y extra.'
            },
            { 
              titulo: 'Horas Extra', 
              valor: horasExtraJornadas, 
              formato: 'duration', 
              color: 'warning', 
              trend: 'up', 
              trendValue: porcentajeHorasExtraJornadas,
              tooltip: 'Horas trabajadas por encima de la jornada estándar. Incluye horas adicionales fuera del horario normal.'
            },
            { 
              titulo: 'Jornadas Completas', 
              valor: jornadasCompletas, 
              formato: 'number', 
              color: 'success', 
              trend: 'up', 
              trendValue: porcentajeCompletitud,
              tooltip: 'Número de jornadas que fueron completadas correctamente (con entrada y salida registradas).'
            },
            { 
              titulo: 'Total Pausas', 
              valor: totalPausas, 
              formato: 'duration', 
              color: 'secondary', 
              trend: 'up', 
              trendValue: porcentajePausas,
              tooltip: 'Tiempo total dedicado a pausas durante las jornadas laborales.'
            }
          ],
          graficas: dataAPI.graficas || []
        }

      case 'solicitudes':
        const totalSolicitudesSolicitudes = dataAPI.estadisticas.total_solicitudes || 0
        const aprobadas = dataAPI.estadisticas.aprobadas || 0
        const pendientes = dataAPI.estadisticas.pendientes || 0
        const diasPromedio = dataAPI.estadisticas.dias_promedio || 0
        
        const porcentajeAprobacion = totalSolicitudesSolicitudes > 0 ? (aprobadas / totalSolicitudesSolicitudes) * 100 : 0
        const porcentajePendientes = totalSolicitudesSolicitudes > 0 ? (pendientes / totalSolicitudesSolicitudes) * 100 : 0
        
        return {
          estadisticas: [
            { 
              titulo: 'Total Solicitudes', 
              valor: totalSolicitudesSolicitudes, 
              formato: 'number', 
              color: 'primary', 
              trend: 'up', 
              trendValue: 12.5,
              tooltip: 'Número total de solicitudes presentadas en el período seleccionado.'
            },
            { 
              titulo: 'Tasa de Aprobación', 
              valor: dataAPI.estadisticas.tasa_aprobacion, 
              formato: 'percentage', 
              color: 'success', 
              trend: 'up', 
              trendValue: porcentajeAprobacion,
              tooltip: 'Porcentaje de solicitudes que han sido aprobadas respecto al total de solicitudes.'
            },
            { 
              titulo: 'Días Promedio', 
              valor: diasPromedio, 
              formato: 'number', 
              color: 'warning', 
              trend: 'down', 
              trendValue: -1.8,
              tooltip: 'Número promedio de días de duración de las solicitudes presentadas.'
            },
            { 
              titulo: 'Pendientes', 
              valor: pendientes, 
              formato: 'number', 
              color: 'danger', 
              trend: 'down', 
              trendValue: porcentajePendientes,
              tooltip: 'Número de solicitudes que están pendientes de aprobación o resolución.'
            }
          ],
          graficas: dataAPI.graficas || []
        }

      case 'incidencias':
        const totalIncidenciasIncidencias = dataAPI.estadisticas.total_incidencias || 0
        const incidenciasPendientes = dataAPI.estadisticas.pendientes || 0
        const incidenciasAprobadas = dataAPI.estadisticas.aprobadas || 0
        
        const porcentajeResolucion = totalIncidenciasIncidencias > 0 ? (dataAPI.estadisticas.tasa_resolucion || 0) : 0
        const porcentajeIncidenciasPendientes = totalIncidenciasIncidencias > 0 ? (incidenciasPendientes / totalIncidenciasIncidencias) * 100 : 0
        const porcentajeIncidenciasAprobadas = totalIncidenciasIncidencias > 0 ? (incidenciasAprobadas / totalIncidenciasIncidencias) * 100 : 0
        
        return {
          estadisticas: [
            { 
              titulo: 'Total Incidencias', 
              valor: totalIncidenciasIncidencias, 
              formato: 'number', 
              color: 'danger', 
              trend: 'down', 
              trendValue: -8.3,
              tooltip: 'Número total de incidencias reportadas en el período seleccionado.'
            },
            { 
              titulo: 'Tasa de Resolución', 
              valor: dataAPI.estadisticas.tasa_resolucion, 
              formato: 'percentage', 
              color: 'success', 
              trend: 'up', 
              trendValue: porcentajeResolucion,
              tooltip: 'Porcentaje de incidencias que han sido resueltas (aprobadas o rechazadas) respecto al total.'
            },
            { 
              titulo: 'Pendientes', 
              valor: incidenciasPendientes, 
              formato: 'number', 
              color: 'primary', 
              trend: 'down', 
              trendValue: porcentajeIncidenciasPendientes,
              tooltip: 'Número de incidencias que están pendientes de resolución.'
            },
            { 
              titulo: 'Aprobadas', 
              valor: incidenciasAprobadas, 
              formato: 'number', 
              color: 'success', 
              trend: 'up', 
              trendValue: porcentajeIncidenciasAprobadas,
              tooltip: 'Número de incidencias que han sido aprobadas y resueltas.'
            }
          ],
          graficas: dataAPI.graficas || []
        }

      default: // resumen
        const horasNetasResumen = dataAPI.totales?.horas_netas || 0
        const horasExtraResumen = dataAPI.totales?.horas_extra || 0
        const diasTrabajadosResumen = dataAPI.totales?.dias_trabajados || 1
        const horasDeficit = dataAPI.totales?.horas_deficit || 0
        const totalJornadas = dataAPI.totales?.total_jornadas || 0
        const totalSolicitudesResumen = dataAPI.totales?.total_solicitudes || 0
        const totalIncidenciasResumen = dataAPI.totales?.total_incidencias || 0
        const tasaCompletitud = dataAPI.totales?.tasa_completitud || 0
        
        const porcentajeHorasExtraResumen = horasNetasResumen > 0 ? (horasExtraResumen / horasNetasResumen) * 100 : 0
        const porcentajeProductividad = diasTrabajadosResumen > 0 ? ((horasNetasResumen / (diasTrabajadosResumen * 8)) * 100) : 0
        
        return {
          estadisticas: [
            { 
              titulo: 'Total Horas', 
              valor: horasNetasResumen, 
              formato: 'duration', 
              color: 'primary', 
              trend: 'up', 
              trendValue: porcentajeProductividad,
              tooltip: 'Total de horas trabajadas en el período, incluyendo horas regulares y extra.'
            },
            { 
              titulo: 'Horas Extra', 
              valor: horasExtraResumen, 
              formato: 'duration', 
              color: 'warning', 
              trend: 'up', 
              trendValue: porcentajeHorasExtraResumen,
              tooltip: 'Horas trabajadas por encima de la jornada estándar de 8 horas diarias.'
            },
            { 
              titulo: 'Días Trabajados', 
              valor: diasTrabajadosResumen, 
              formato: 'number', 
              color: 'success', 
              trend: 'up', 
              trendValue: 2.1,
              tooltip: 'Número de días en los que se registró actividad laboral.'
            },
            { 
              titulo: 'Déficit/Superávit', 
              valor: horasDeficit, 
              formato: 'duration', 
              color: horasDeficit >= 0 ? 'danger' : 'success', 
              trend: horasDeficit >= 0 ? 'down' : 'up', 
              trendValue: Math.abs(horasDeficit),
              tooltip: 'Diferencia entre las horas esperadas y las horas realmente trabajadas. Positivo indica déficit, negativo indica superávit.'
            }
          ],
          graficas: dataAPI.graficas || []
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
                  tooltip={stat.tooltip}
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

      {/* Toast Container */}
      <ToastContainer 
        toasts={toast.toasts} 
        onRemove={toast.removeToast} 
      />
    </div>
  )
}
