import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ShieldCheckIcon,
  XMarkIcon as XCircleIcon,
  PencilIcon,
  UserIcon,
  TrashIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ArrowRightIcon,
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
  EnvelopeIcon
} from '@heroicons/react/24/outline'

// Componente para el cuerpo del Modal de Auditoría
const AuditModalBody = ({ log }) => {
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
  const modelo_id = log.model_id || log.id_entidad || '-'
  const usuario = log.user || log.usuario || null
  const fecha_hora = log.created_at || log.fecha_hora || null
  const contexto = log.context || log.contexto || {}
  const valores_anteriores = log.properties?.old || log.valores_anteriores || {}
  const valores_nuevos = log.properties?.attributes || log.valores_nuevos || {}
  const cambios = (log.properties?.old && log.properties?.attributes)
    ? Object.keys(log.properties.attributes).reduce((acc, key) => {
        if (log.properties.old[key] !== log.properties.attributes[key]) {
          acc[key] = {
            old: log.properties.old[key],
            new: log.properties.attributes[key]
          }
        }
        return acc
      }, {})
    : (log.cambios || {})

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
    // ... agregar más mapeos si es necesario
  }

  const translateField = (field) => {
    return friendlyFieldNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getDataType = (value) => {
    if (value === null || value === undefined) return { type: 'Nulo', Icon: XCircleIcon }
    if (typeof value === 'boolean') return { type: 'Booleano', Icon: CheckCircleIcon }
    if (typeof value === 'number') return { type: 'Numérico', Icon: HashtagIcon }
    if (typeof value === 'object') return { type: 'Objeto', Icon: CubeIcon }
    return { type: 'Texto', Icon: DocumentTextIcon }
  }

  const ValueDisplay = ({ value }) => {
    const { type, Icon } = getDataType(value)
    let displayValue = value
    if (value === null || value === undefined) displayValue = 'Sin valor'
    else if (typeof value === 'boolean') displayValue = value ? 'Sí' : 'No'
    else if (typeof value === 'object') {
      return (
        <div className='value-display object'>
          <pre><code>{JSON.stringify(value, null, 2)}</code></pre>
          <span className='data-type'><Icon className='h-3.5 w-3.5' /> {type}</span>
        </div>
      )
    }
    return (
      <div className='value-display'>
        <span className='main-value'>{String(displayValue)}</span>
        <span className='data-type'><Icon className='h-3.5 w-3.5' /> {type}</span>
      </div>
    )
  }

  const getActionDetails = () => {
    switch (accion) {
      case 'created': return { Icon: CheckCircleIcon, color: 'green', text: 'Creación' }
      case 'updated': return { Icon: PencilIcon, color: 'blue', text: 'Actualización' }
      case 'deleted': return { Icon: TrashIcon, color: 'red', text: 'Eliminación' }
      default: return { Icon: QuestionMarkCircleIcon, color: 'gray', text: 'Desconocido' }
    }
  }

  const actionDetails = getActionDetails()

  const parseDate = (dateString) => {
    if (!dateString) return null;
    // Replace space with 'T' to make it ISO 8601 compliant and parsable by new Date()
    const parsableDate = new Date(dateString.replace(' ', 'T'));
    // Check if the date is valid
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
          <span className='model-badge'>{modelo} #{modelo_id}</span>
          {fecha_hora_date && <span>{format(fecha_hora_date, "dd 'de' MMMM, yyyy 'a las' HH:mm:ss", { locale: es })}
</span>}
        </p>
      </div>
    </div>
  )

  const TimelineSection = () => {
    // Fallback seguro para iniciales
    let userInitials = 'S';
    if (usuario && typeof usuario.nombre === 'string' && usuario.nombre.length > 0) {
      userInitials = usuario.nombre.charAt(0);
      if (usuario.apellidos && typeof usuario.apellidos === 'string' && usuario.apellidos.length > 0) {
        userInitials += usuario.apellidos.charAt(0);
      }
    }

    // --- FLUJO TEMPORAL CONTEXTUAL ---
    let timelineDetails = null;
    if (['Pausa', 'Jornada'].includes(modelo)) {
      if (accion === 'created') {
        const horaInicio = valores_nuevos?.hora_inicio || valores_nuevos?.hora_entrada;
        timelineDetails = (
          <div className="timeline-detail temporal">
            <ClockIcon className="h-4 w-4 text-blue-500" />
            <span>{modelo === 'Pausa' ? 'Pausa iniciada' : 'Jornada iniciada'}:</span>
            <b>{horaInicio ? new Date(horaInicio).toLocaleTimeString('es-ES') : 'Sin hora'}</b>
          </div>
        );
      } else if (accion === 'updated') {
        const inicioAntes = valores_anteriores?.hora_inicio || valores_anteriores?.hora_entrada;
        const finDespues = valores_nuevos?.hora_fin || valores_nuevos?.hora_salida;
        timelineDetails = (
          <div className="timeline-detail temporal">
            <ClockIcon className="h-4 w-4 text-blue-500" />
            <span>Inicio:</span> <b>{inicioAntes ? new Date(inicioAntes).toLocaleTimeString('es-ES') : 'Sin hora'}</b>
            <ArrowRightIcon className="inline h-4 w-4 mx-2 text-gray-400" />
            <span>Fin:</span> <b>{finDespues ? new Date(finDespues).toLocaleTimeString('es-ES') : 'Sin hora'}</b>
          </div>
        );
      }
    } else if (modelo === 'Solicitud') {
      timelineDetails = (
        <div className="timeline-detail temporal">
          <CalendarIcon className="h-4 w-4 text-indigo-500" />
          <span>Desde:</span> <b>{valores_nuevos?.fecha_inicio ? new Date(valores_nuevos.fecha_inicio).toLocaleDateString('es-ES') : '-'}</b>
          <ArrowRightIcon className="inline h-4 w-4 mx-2 text-gray-400" />
          <span>Hasta:</span> <b>{valores_nuevos?.fecha_fin ? new Date(valores_nuevos.fecha_fin).toLocaleDateString('es-ES') : '-'}</b>
          {valores_nuevos?.estado && <span className="ml-3">Estado: <b>{valores_nuevos.estado}</b></span>}
        </div>
      );
    } else if (modelo === 'Incidencia') {
      timelineDetails = (
        <div className="timeline-detail temporal">
          <CalendarIcon className="h-4 w-4 text-rose-500" />
          <span>Fecha:</span> <b>{valores_nuevos?.fecha ? new Date(valores_nuevos.fecha).toLocaleDateString('es-ES') : '-'}</b>
          {valores_nuevos?.hora_inicio && <span className="ml-3">Inicio: <b>{new Date(valores_nuevos.hora_inicio).toLocaleTimeString('es-ES')}</b></span>}
          {valores_nuevos?.hora_fin && <span className="ml-3">Fin: <b>{new Date(valores_nuevos.hora_fin).toLocaleTimeString('es-ES')}</b></span>}
          {valores_nuevos?.estado && <span className="ml-3">Estado: <b>{valores_nuevos.estado}</b></span>}
        </div>
      );
    } else if (modelo === 'Festivo') {
      timelineDetails = (
        <div className="timeline-detail temporal">
          <CalendarIcon className="h-4 w-4 text-amber-500" />
          <span>Fecha:</span> <b>{valores_nuevos?.fecha ? new Date(valores_nuevos.fecha).toLocaleDateString('es-ES') : '-'}</b>
          <span className="ml-3">{valores_nuevos?.descripcion || '-'}</span>
        </div>
      );
    } else if (modelo === 'User') {
      timelineDetails = (
        <div className="timeline-detail temporal">
          <UserIcon className="h-4 w-4 text-blue-400" />
          <span>Usuario:</span> <b>{valores_nuevos?.nombre || '-'}</b>
          {valores_nuevos?.email && <span className="ml-3">Email: <b>{valores_nuevos.email}</b></span>}
        </div>
      );
    } else if (modelo === 'Department') {
      timelineDetails = (
        <div className="timeline-detail temporal">
          <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
          <span>Departamento:</span> <b>{valores_nuevos?.nombre || '-'}</b>
        </div>
      );
    }

    return (
      <div className='audit-section timeline-section'>
         <h3 className='section-title'><ArrowsRightLeftIcon /> Flujo del Evento</h3>
         <div className='timeline-container'>
          <div className='timeline-item'>
            <div className='timeline-avatar'>{userInitials}</div>
            <p className='timeline-text'>{usuario && usuario.nombre && usuario.apellidos ? `${usuario.nombre} ${usuario.apellidos}` : 'Sistema'}</p>
          </div>
          <div className='timeline-connector'><ArrowRightIcon/></div>
          <div className='timeline-item'>
            <div className={`timeline-icon ${accion}`}><actionDetails.Icon/></div>
            <p className='timeline-text'>{actionDetails.text}</p>
          </div>
          <div className='timeline-connector'><ArrowRightIcon/></div>
          <div className='timeline-item'>
            <div className='timeline-icon model'><CubeIcon/></div>
            <p className='timeline-text'>{modelo} #{modelo_id}</p>
          </div>
         </div>
         {timelineDetails && <div className='timeline-extra'>{timelineDetails}</div>}
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
    if (accion === 'updated' && cambios && Object.keys(cambios).length > 0) {
      return (
        <div className='audit-section changes-section'>
          <h3 className='section-title'><DocumentTextIcon /> Cambios Realizados ({Object.keys(cambios).length})</h3>
          <div className='changes-grid'>
            {Object.entries(cambios).map(([field, values], index) => (
              <div key={field} className='change-card'>
                <div className='change-card-header'>
                  <span className='change-number'>#{index + 1}</span>
                  <div className='change-field-name'><p>{translateField(field)}</p><span>({field})</span></div>
                </div>
                <div className='change-card-body'>
                  <div className='value-box old-value'><div className='value-box-header'><XCircleIcon /><span>Valor Anterior</span></div><ValueDisplay value={values.old} /></div>
                  <div className='arrow-container'><ArrowRightIcon className='animated-arrow' /></div>
                  <div className='value-box new-value'><div className='value-box-header'><CheckCircleIcon /><span>Valor Nuevo</span></div><ValueDisplay value={values.new} /></div>
                </div>
              </div>
            ))}
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
              <div className='value-card-body'><ValueDisplay value={value} /></div>
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
            return null; // No mostrar esta sección para otros modelos
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
        <div className='tech-info-item'><IdentificationIcon /><span>ID de Auditoría</span><p>{log.id}</p></div>
        <div className='tech-info-item'><GlobeAltIcon /><span>Dirección IP</span><p>{contexto?.ip || 'No disponible'}</p></div>
        <div className='tech-info-item full-width'><ComputerDesktopIcon /><span>User Agent</span><p title={contexto?.user_agent || 'No disponible'}>{contexto?.user_agent || 'No disponible'}</p></div>
        <div className='tech-info-item'><ClockIcon /><span>Timestamp Unix</span><p>{fecha_hora_date ? fecha_hora_date.getTime() : 'N/A'}</p></div>
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

export default AuditModalBody;