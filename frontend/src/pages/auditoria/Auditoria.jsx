import { useState, useEffect, useCallback, useRef } from 'react'
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
import './css/AuditoriaList.css'
import {
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon as XCircleIcon,
  PencilIcon,
  UserIcon,
  TrashIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  FingerPrintIcon,
  ServerIcon,
  QuestionMarkCircleIcon,
  ArrowsRightLeftIcon,
  CubeIcon,
  HashtagIcon,
  IdentificationIcon,
  ChartBarIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  LinkIcon,
  EnvelopeIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowDownIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

// Componente para el cuerpo del Modal de Auditoría
const AuditModalBody = ({ log }) => {
  // Nota: evitar logs pesados en montaje del modal para no bloquear apertura
  
  if (!log) return (
    <div className="audit-modal-content">
      <div className="modal-main-content">
        <div className="audit-section">
          <h3 className="section-title"><InformationCircleIcon /> Sin datos de auditoría</h3>
          <p className="text-gray-500">No se ha podido cargar la información del registro seleccionado.</p>
        </div>
      </div>
    </div>
  )

  // Mapeo de datos del log a nombres consistentes
  const accion = log.action || log.accion || ''
  const modelo = (log.model_type || log.entidad || '').split('\\').pop() || '-'
  const modelo_id = (log.model_id && log.model_id !== 0) ? log.model_id : (log.id_entidad || log.id || '-')
  const usuario = log.user || log.usuario || null
  const fecha_hora = log.created_at || log.fecha_hora || null
  const contexto = log.context || log.contexto || {}
  const valores_anteriores = log.properties?.old || log.valores_anteriores || log.old_values || {}
  const valores_nuevos = log.properties?.attributes || log.valores_nuevos || log.new_values || {}
  // Función segura para obtener cambios
  const getCambiosSeguros = () => {
    // Primero intenta usar los cambios del backend
    if (log.cambios && typeof log.cambios === 'object') {
      return log.cambios;
    }
    
    // Si no hay cambios del backend, intenta construir desde properties
    if (log.properties && log.properties.old && log.properties.attributes) {
      const cambios = {};
      const oldValues = log.properties.old || {};
      const newValues = log.properties.attributes || {};
      
      // Obtener todas las claves únicas
      const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
      
      allKeys.forEach(key => {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          cambios[key] = {
            old: oldValues[key],
            new: newValues[key]
          };
        }
      });
      
      return cambios;
    }
    
    return {};
  };

  const cambios = getCambiosSeguros();

  // Mapeo de nombres de campos a un formato legible
  const friendlyFieldNames = {
    id: 'ID de Registro',
    created_at: 'Fecha de Creación',
    updated_at: 'Última Actualización',
    name: 'Nombre',
    email: 'Email',
    user_id: 'ID de Usuario',
    id_usuario: 'ID de Usuario',
    fecha_inicio: 'Fecha de Inicio',
    fecha_fin: 'Fecha de Fin',
    estado: 'Estado',
    tipo: 'Tipo',
    descripcion: 'Descripción',
    motivo: 'Motivo'
  }

  const translateField = (field) => {
    return friendlyFieldNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Función para formatear UserAgent
  const formatUserAgent = (userAgent) => {
    if (!userAgent || userAgent === 'N/A') return 'N/A';
    
    // Extraer información clave del UserAgent
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
    const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);
    
    if (browserMatch && osMatch) {
      const browser = browserMatch[0].split('/')[0];
      const os = osMatch[1];
      return `${browser} en ${os}`;
    } else if (browserMatch) {
      return browserMatch[0].split('/')[0];
    } else {
      // Si no se puede parsear, truncar a 50 caracteres
      return userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
    }
  };

  // Función para copiar al portapapeles con notificación
  const copyToClipboard = async (text, type, buttonRef) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${type} copiado al portapapeles:`, text);
      
      // Mostrar notificación
      if (buttonRef?.current) {
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" />
            </svg>
            Copiado
          </div>
        `;
        
        buttonRef.current.appendChild(notification);
        
        // Remover la notificación después de la animación
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const getDataType = (value) => {
    if (value === null || value === undefined) return { type: 'Nulo', Icon: XCircleIcon }
    if (typeof value === 'boolean') return { type: 'Booleano', Icon: CheckCircleIcon }
    if (typeof value === 'number') return { type: 'Numérico', Icon: HashtagIcon }
    if (typeof value === 'object') return { type: 'Objeto', Icon: CubeIcon }
    return { type: 'Texto', Icon: DocumentTextIcon }
  }

  const ValueDisplay = ({ value, fieldName }) => {
    const { type, Icon } = getDataType(value)
    const buttonRef = useRef(null)
    let displayValue = value
    if (value === null || value === undefined) displayValue = 'Sin valor'
    else if (typeof value === 'boolean') displayValue = value ? 'Sí' : 'No'
    else if (typeof value === 'object') {
      return (
        <div className='value-display object'>
          <div className='value-content'>
            <pre><code>{JSON.stringify(value, null, 2)}</code></pre>
            <button 
              ref={buttonRef}
              className='copy-button'
              onClick={() => copyToClipboard(JSON.stringify(value, null, 2), `${fieldName} (${type})`, buttonRef)}
              title={`Copiar ${fieldName}`}
            >
              <ClipboardDocumentIcon />
            </button>
          </div>
          <span className='data-type'><Icon className='h-3.5 w-3.5' /> {type}</span>
        </div>
      )
    }
    return (
      <div className='value-display'>
        <div className='value-content'>
          <span className='main-value'>{String(displayValue)}</span>
          <button 
            ref={buttonRef}
            className='copy-button'
            onClick={() => copyToClipboard(String(displayValue), `${fieldName} (${type})`, buttonRef)}
            title={`Copiar ${fieldName}`}
          >
            <ClipboardDocumentIcon />
          </button>
        </div>
        <span className='data-type'><Icon className='h-3.5 w-3.5' /> {type}</span>
      </div>
    )
  }

  const getActionDetails = () => {
    switch (accion) {
      case 'created': return { Icon: CheckCircleIcon, color: 'green', text: 'Creación' }
      case 'updated': return { Icon: PencilIcon, color: 'blue', text: 'Actualización' }
      case 'deleted': return { Icon: TrashIcon, color: 'red', text: 'Eliminación' }
      case 'report_generated': return { Icon: DocumentTextIcon, color: 'purple', text: 'Generación de Reporte' }
      case 'report_downloaded': return { Icon: ArrowDownTrayIcon, color: 'purple', text: 'Descarga de Reporte' }
      case 'approved': return { Icon: CheckCircleIcon, color: 'green', text: 'Aprobación' }
      case 'rejected': return { Icon: XCircleIcon, color: 'red', text: 'Rechazo' }
      default: return { Icon: QuestionMarkCircleIcon, color: 'gray', text: 'Desconocido' }
    }
  }

  const actionDetails = getActionDetails()

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const parsableDate = new Date(dateString.replace(' ', 'T'));
    if (isNaN(parsableDate.getTime())) {
        console.error("Invalid date value:", dateString);
        return null;
    }
    return parsableDate;
  }

  const fecha_hora_date = parseDate(fecha_hora);

  const MainBanner = () => (
    <div className={`audit-banner ${accion}`}>
      <actionDetails.Icon className='banner-icon' />
      <div className='banner-text'>
        <h2 className='banner-title'>{actionDetails.text} de {modelo}</h2>
        <p className='banner-subtitle'>
          <span className='model-badge'>{modelo} {modelo_id !== 'N/A' ? `#${modelo_id}` : ''}</span>
          {fecha_hora_date && <span>{format(fecha_hora_date, "dd 'de' MMMM, yyyy 'a las' HH:mm:ss", { locale: es })}
</span>}
        </p>
      </div>
    </div>
  )

  const TimelineSection = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const timelineRef = useRef(null);
    
    // Flujo real de lo que ha sucedido en la aplicación
    const getEventFlow = () => {
      const flowSteps = [];
      
      // Paso 1: Usuario inicia acción
      if (usuario) {
        flowSteps.push({
          icon: UserIcon,
          label: 'Usuario',
          value: `${usuario.nombre} ${usuario.apellidos}`,
          subvalue: 'Inicia la acción',
          details: [
            { label: 'Email', value: usuario.email || 'N/A' },
            { label: 'ID Usuario', value: usuario.id || 'N/A' },
            { label: 'Departamento', value: usuario.departamento?.nombre || usuario.department?.nombre || 'N/A' },
            { label: 'Rol', value: usuario.role?.name || usuario.role?.nombre || 'N/A' }
          ],
          color: 'blue'
        });
      }

      // Paso 2: Sistema procesa la solicitud
      flowSteps.push({
        icon: ServerIcon,
        label: 'Sistema',
        value: 'Procesa solicitud',
        subvalue: `${actionDetails.text.toLowerCase()} de ${modelo}`,
        details: [
          { label: 'Acción', value: actionDetails.text },
          { label: 'Modelo', value: modelo },
          { label: 'Timestamp', value: fecha_hora_date ? format(fecha_hora_date, 'HH:mm:ss') : 'N/A' },
          { label: 'IP', value: contexto?.ip || 'N/A' }
        ],
        color: 'purple'
      });

      // Paso 3: Base de datos actualizada o proceso específico
      if (modelo === 'Reporte') {
        flowSteps.push({
          icon: DocumentTextIcon,
          label: 'Generación',
          value: accion === 'report_generated' ? 'Reporte generado' : 'Reporte descargado',
          subvalue: `${valores_nuevos?.data?.report_type || 'Reporte'} #${modelo_id}`,
          details: [
            { label: 'Tipo Reporte', value: valores_nuevos?.data?.report_type || 'N/A' },
            { label: 'Formato', value: valores_nuevos?.data?.format || 'N/A' },
            { label: 'ID Reporte', value: modelo_id },
            { label: 'Estado', value: 'Completado' }
          ],
          color: 'purple'
        });
      } else {
        flowSteps.push({
          icon: CubeIcon,
          label: 'Base de Datos',
          value: accion === 'created' ? 'Registro creado' : accion === 'updated' ? 'Registro modificado' : 'Registro eliminado',
          subvalue: `${modelo} #${modelo_id}`,
          details: [
            { label: 'Operación', value: accion === 'created' ? 'CREATE' : accion === 'updated' ? 'UPDATE' : 'DELETE' },
            { label: 'Tabla', value: modelo },
            { label: 'ID Registro', value: modelo_id },
            { label: 'Cambios', value: Object.keys(cambios || {}).length }
          ],
          color: accion === 'created' ? 'green' : accion === 'updated' ? 'blue' : 'red'
        });
      }

      // Paso 4: Auditoría registrada
      flowSteps.push({
        icon: ShieldCheckIcon,
        label: 'Auditoría',
        value: 'Evento registrado',
        subvalue: `ID: ${log.id || log.id_auditoria || 'N/A'}`,
        details: [
          { label: 'ID Auditoría', value: log.id || log.id_auditoria || 'N/A' },
          { label: 'User Agent', value: formatUserAgent(contexto?.user_agent || contexto?.navegador) },
          { label: 'Estado', value: 'Registrado' },
          { label: 'Integridad', value: 'Verificada' }
        ],
        color: 'green'
      });

      return flowSteps;
    };

    const eventFlow = getEventFlow();
    
    const scrollToStep = (stepIndex) => {
      if (timelineRef.current) {
        const containerWidth = timelineRef.current.offsetWidth;
        const scrollPosition = stepIndex * containerWidth;
        timelineRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    };
    
    const goToNextStep = () => {
      const nextStep = (currentStep + 1) % eventFlow.length;
      setCurrentStep(nextStep);
      scrollToStep(nextStep);
    };
    
    const goToPreviousStep = () => {
      const prevStep = (currentStep - 1 + eventFlow.length) % eventFlow.length;
      setCurrentStep(prevStep);
      scrollToStep(prevStep);
    };


    return (
      <div className='audit-section timeline-section'>
         <h3 className='section-title'><ArrowsRightLeftIcon /> Flujo del Evento</h3>
         <div className='timeline-container'>
           <div 
             className='timeline-flow' 
             ref={timelineRef}
           >
             {eventFlow.map((step, index) => (
               <div 
                 key={index} 
                 className={`timeline-step ${step.color} ${index === currentStep ? 'active' : ''}`}
               >
                 <div className='timeline-step-icon'>
                   <step.icon />
                 </div>
                 <div className='timeline-step-content'>
                   <div className='timeline-step-header'>
                     <div className='timeline-step-label'>{step.label}</div>
                     <div className='timeline-step-navigation'>
                       <button 
                         className='timeline-step-nav-btn' 
                         onClick={goToPreviousStep}
                         disabled={eventFlow.length <= 1}
                       >
                         <ArrowLeftIcon />
                       </button>
                       <button 
                         className='timeline-step-nav-btn' 
                         onClick={goToNextStep}
                         disabled={eventFlow.length <= 1}
                       >
                         <ArrowRightIcon />
                       </button>
                     </div>
                   </div>
                   <div className='timeline-step-value'>{step.value}</div>
                   <div className='timeline-step-subvalue'>{step.subvalue}</div>
                   {step.details && (
                     <div className='timeline-step-details'>
                       {step.details.map((detail, detailIndex) => (
                         <div key={detailIndex} className='timeline-step-detail'>
                           <div className='timeline-step-detail-label'>{detail.label}</div>
                           <div className='timeline-step-detail-value'>{detail.value}</div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
                 {index < eventFlow.length - 1 && (
                   <div className='timeline-step-connector'>
                     <ArrowRightIcon />
                   </div>
                 )}
               </div>
             ))}
           </div>
           <div className='timeline-indicator'>
             {currentStep + 1}/{eventFlow.length}
           </div>
         </div>
      </div>
    )
  }

  const UserInfo = () => (
    <div className='audit-section user-info'>
      <h3 className='section-title'><UserIcon /> Usuario que realizó la acción</h3>
      <div className='user-details'>
        <div className='user-avatar'>
          {usuario && usuario.nombre && usuario.apellidos ? `${usuario.nombre.charAt(0)}${usuario.apellidos.charAt(0)}` : 'S'}
        </div>
        <div className='user-identity'>
          <p className='user-name'>{usuario && usuario.nombre && usuario.apellidos ? `${usuario.nombre} ${usuario.apellidos}` : 'Sistema'}</p>
          <p className='user-email'>{usuario ? usuario.email : '-'}</p>
        </div>
        <div className='user-id-badge'><IdentificationIcon /><span>ID: {usuario ? usuario.id : 'N/A'}</span></div>
      </div>
    </div>
  )

  const ChangesSection = () => {
    const [currentChangeIndex, setCurrentChangeIndex] = useState(0)
    const changesRef = useRef(null)
    
    // Función de scroll
    const scrollToChange = (changeIndex) => {
      if (changesRef.current) {
        const containerWidth = changesRef.current.offsetWidth;
        const scrollPosition = changeIndex * containerWidth;
        changesRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    };
    
    if (accion === 'updated' && cambios && Object.keys(cambios).length > 0) {
      const changeEntries = Object.entries(cambios)
      
      const goToPrevious = () => {
        const prevChange = (currentChangeIndex - 1 + changeEntries.length) % changeEntries.length;
        setCurrentChangeIndex(prevChange);
        scrollToChange(prevChange);
      };
      
      const goToNext = () => {
        const nextChange = (currentChangeIndex + 1) % changeEntries.length;
        setCurrentChangeIndex(nextChange);
        scrollToChange(nextChange);
      };

      
      const getSectionTitle = () => {
        const count = Object.keys(cambios).length;
        switch (accion) {
          case 'created':
            return `Campos Creados (${count})`;
          case 'updated':
            return `Cambios Realizados (${count})`;
          case 'deleted':
            return `Campos Eliminados (${count})`;
          default:
            return `Campos Registrados (${count})`;
        }
      };

      return (
        <div className='audit-section changes-section'>
          <h3 className='section-title'><DocumentTextIcon /> {getSectionTitle()}</h3>
          
          <div className='changes-container'>
            <div 
              className='changes-flow' 
              ref={changesRef}
            >
              {changeEntries.map((change, index) => (
                <div 
                  key={index} 
                  className={`change-step ${index === currentChangeIndex ? 'active' : ''}`}
                >
                  <div className='change-step-content'>
                    <div className='change-step-header'>
                      <div className='change-number'>#{index + 1}</div>
                      <div className='change-field-name'>
                        <span className='change-label'>Campo</span>
                        <span className='change-value'>{translateField(change[0])}</span>
                        <span className='change-field-badge'>{change[0]}</span>
                      </div>
                      <div className='change-step-navigation'>
                        <button 
                          className='change-step-nav-btn' 
                          onClick={goToPrevious}
                          disabled={changeEntries.length <= 1}
                        >
                          <ArrowLeftIcon />
                        </button>
                        <button 
                          className='change-step-nav-btn' 
                          onClick={goToNext}
                          disabled={changeEntries.length <= 1}
                        >
                          <ArrowRightIcon />
                        </button>
                      </div>
                    </div>
                    
                    <div className='change-values-container'>
                      {accion === 'created' ? (
                        <div className='value-box new-value'>
                          <div className='value-box-header'>
                            <CheckCircleIcon />
                            <span>Valor Creado</span>
                          </div>
                          <ValueDisplay value={change[1].new} fieldName={`${translateField(change[0])} (Creado)`} />
                        </div>
                      ) : accion === 'deleted' ? (
                        <div className='value-box old-value'>
                          <div className='value-box-header'>
                            <XCircleIcon />
                            <span>Valor Eliminado</span>
                          </div>
                          <ValueDisplay value={change[1].old} fieldName={`${translateField(change[0])} (Eliminado)`} />
                        </div>
                      ) : (
                        <>
                          <div className='value-box old-value'>
                            <div className='value-box-header'>
                              <XCircleIcon />
                              <span>Valor Anterior</span>
                            </div>
                            <ValueDisplay value={change[1].old} fieldName={`${translateField(change[0])} (Anterior)`} />
                          </div>
                          
                          <div className='arrow-container'>
                            <ArrowDownIcon className='animated-arrow' />
                          </div>
                          
                          <div className='value-box new-value'>
                            <div className='value-box-header'>
                              <CheckCircleIcon />
                              <span>Valor Nuevo</span>
                            </div>
                            <ValueDisplay value={change[1].new} fieldName={`${translateField(change[0])} (Nuevo)`} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className='changes-indicator'>
              {currentChangeIndex + 1}/{changeEntries.length}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const ValuesSection = ({ title, values, icon: Icon, type }) => {
    if (!values || Object.keys(values).length === 0) return null
    return (
      <div className={`audit-section values-section-${type}`}>
        <h3 className='section-title'><Icon /> {title}</h3>
        <div className='values-grid'>
          {Object.entries(values).map(([key, value], index) => (
            <div key={key} className='value-card'>
              <div className='value-card-header'>
                <span className='value-number'>#{index + 1}</span>
                <div className='value-field-name'><p>{translateField(key)}</p><span>({key})</span></div>
              </div>
              <div className='value-card-body'><ValueDisplay value={value} fieldName={translateField(key)} /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const AssociatedContextSection = () => {
    const modelData = log.model || {};
    let contextTitle = 'Contexto Adicional';
    let contextData = [];

    switch (modelo) {
        case 'Incidencia':
        case 'Solicitud':
        case 'Jornada':
        case 'Pausa':
            if (modelData.user) {
                contextTitle = 'Usuario Asociado';
                contextData.push({ icon: UserIcon, label: 'Nombre', value: `${modelData.user.nombre} ${modelData.user.apellidos}` });
                contextData.push({ icon: IdentificationIcon, label: 'ID Usuario', value: modelData.user.id });
                contextData.push({ icon: EnvelopeIcon, label: 'Email', value: modelData.user.email });
            }
            break;
        case 'User':
            if (modelData.department) {
                contextData.push({ icon: BuildingOfficeIcon, label: 'Departamento', value: modelData.department.nombre });
            }
            if (modelData.role) {
                contextData.push({ icon: BriefcaseIcon, label: 'Rol', value: modelData.role.nombre });
            }
            contextTitle = 'Información Organizacional';
            break;
        default:
            return null;
    }

    if (contextData.length === 0) return null;

    return (
        <div className='audit-section associated-context-section'>
            <h3 className='section-title'><LinkIcon /> {contextTitle}</h3>
            <div className='context-grid'>
                {contextData.map((item, index) => (
                    <div key={index} className='context-item'>
                        <item.icon className='context-item-icon' />
                        <div className='context-item-text'>
                            <span className='context-item-label'>{item.label}</span>
                            <p className='context-item-value'>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  const TechnicalInfoSection = () => (
    <div className='audit-section tech-info-section'>
      <h3 className='section-title'><ShieldCheckIcon /> Información Técnica y de Seguridad</h3>
      <div className='tech-info-grid'>
        <div className='tech-info-item'><IdentificationIcon /><span>ID de Auditoría</span><p>{log.id || log.id_auditoria || 'N/A'}</p></div>
        <div className='tech-info-item'><GlobeAltIcon /><span>Dirección IP</span><p>{contexto?.ip || 'No disponible'}</p></div>
        <div className='tech-info-item full-width'>
          <ComputerDesktopIcon />
          <span>User Agent</span>
          <p title={contexto?.user_agent || contexto?.navegador || 'No disponible'}>{formatUserAgent(contexto?.user_agent || contexto?.navegador)}</p>
          <div className='tech-info-timestamp'>
            <ClockIcon />
            <span>Fecha: {fecha_hora_date ? format(fecha_hora_date, "dd/MM/yyyy HH:mm:ss", { locale: es }) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const SummarySection = () => (
    <div className='audit-section summary-section'>
      <h3 className='section-title'><ChartBarIcon /> Resumen del Registro</h3>
      <div className='summary-grid'>
        <div className='summary-card'><actionDetails.Icon /><span>Tipo de Acción</span><p>{actionDetails.text}</p></div>
        <div className='summary-card'><CubeIcon /><span>Modelo Afectado</span><p>{modelo}</p></div>
        <div className='summary-card'><HashtagIcon /><span>Campos Registrados</span><p>{Object.keys(valores_nuevos || valores_anteriores || {}).length}</p></div>
        <div className='summary-card'><ArrowPathIcon /><span>Campos Modificados</span><p>{Object.keys(cambios || {}).length}</p></div>
      </div>
    </div>
  )

  return (
    <div className="audit-modal-content audit-modal-premium">
      <MainBanner />
      <div className="modal-main-content">
        <TimelineSection />
        <UserInfo />
        <AssociatedContextSection />
        {accion === 'created' && <ValuesSection title='Valores Iniciales' values={valores_nuevos} icon={CheckCircleIcon} type='created' />}
        {accion === 'updated' && <ChangesSection />}
        {accion === 'deleted' && <ValuesSection title='Valores Eliminados' values={valores_anteriores} icon={TrashIcon} type='deleted' />}
        <TechnicalInfoSection />
        <SummarySection />
      </div>
    </div>
  )
}

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
  const [readyModalContent, setReadyModalContent] = useState(false)

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

  const openModal = (log) => {
    // Abrir el modal de inmediato con información básica
    setSelectedLog(log)
    setShowModal(true)
    setReadyModalContent(false)

    // Cargar detalles en segundo plano sin bloquear apertura
    api.get(`/audit-logs/${log.id}`)
      .then((response) => {
        setSelectedLog(response.data)
      })
      .catch((error) => {
        console.error('Error al obtener log detallado:', error)
      })
      .finally(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setReadyModalContent(true))
        })
      })
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedLog(null)
    setReadyModalContent(false)
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
      deleted: 'eliminó',
      report_generated: 'generó',
      report_downloaded: 'descargó',
      approved: 'aprobó',
      rejected: 'rechazó'
    }[action] || 'actualizó'

    const modelDescriptions = {
      Incidencia: `${actionText} la incidencia #${modelId}`,
      Solicitud: `${actionText} la solicitud #${modelId}`,
      Jornada: `${actionText} el registro de jornada #${modelId}`,
      Pausa: `${actionText} el registro de pausa #${modelId}`,
      User: `${actionText} el usuario #${modelId}`,
      Festivo: `${actionText} el festivo #${modelId}`,
      Department: `${actionText} el departamento #${modelId}`,
      Role: `${actionText} el rol #${modelId}`,
      Reporte: `${actionText} un reporte`
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

      {/* Lista de auditorías con diseño estándar */}
      <div className="list">
        <div className="list-header">
          <h3 className="list-title">Registro de Actividades del Sistema</h3>
          <span className="list-count">
            {loading ? (
              <div className="list-count-spinner">
                <div className="animate-spin"></div>
              </div>
            ) : (
              pagination.total
            )}
          </span>
        </div>

        {loading ? (
          <div className="list-loading">
            <div className="list-loading-icon">
              <div className="animate-spin"></div>
            </div>
            <div className="list-loading-title">Cargando registros de auditoría...</div>
            <div className="list-loading-message">Obteniendo historial de actividades</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="list-empty">
            <ShieldCheckIcon className="list-empty-icon" />
            <div className="list-empty-title">Sin registros de auditoría</div>
            <div className="list-empty-message">No se encontraron registros con los filtros seleccionados</div>
          </div>
        ) : (
          <div className="list-scrollable">
            {logs.map((log, index) => (
              <div key={log.id || index} className="list-item list-item-auditoria">
                <AuditoriaItem
                  log={log}
                  description={getLogDescription(log)}
                  onVerDetalles={openModal}
                />
              </div>
            ))}
          </div>
        )}
      </div>

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
        animationType='none'
        title='Registro de Auditoría - Información Detallada'
        titleClassName='text-lg font-bold text-gray-800'
      >
        {selectedLog && (
          readyModalContent ? (
            <AuditModalBody log={selectedLog} />
          ) : (
            <div className='list-loading' style={{ padding: '2rem 0' }}>
              <div className='list-loading-spinner'></div>
              <div>Cargando detalles…</div>
            </div>
          )
        )}
      </Modal>
    </div>
  )
}