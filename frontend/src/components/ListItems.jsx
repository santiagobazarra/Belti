import React, { useState, useEffect, useRef } from 'react';
import {
  UserIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { getIconComponent } from '../lib/departmentIcons';

// Hook para detectar si el botón tiene suficiente ancho para mostrar texto
const useButtonWidth = () => {
  const [showText, setShowText] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!buttonRef.current || !isMobile) {
      setShowText(false);
      return;
    }

    const checkWidth = () => {
      const button = buttonRef.current;
      if (button) {
        // Crear un elemento temporal para medir el ancho del texto
        const tempSpan = document.createElement('span');
        tempSpan.textContent = 'Resumen';
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.fontSize = window.getComputedStyle(button).fontSize;
        tempSpan.style.fontFamily = window.getComputedStyle(button).fontFamily;
        tempSpan.style.fontWeight = window.getComputedStyle(button).fontWeight;
        document.body.appendChild(tempSpan);
        
        const textWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);
        
        // Obtener el ancho disponible del botón (descontando padding y icono)
        const buttonStyle = window.getComputedStyle(button);
        const paddingLeft = parseFloat(buttonStyle.paddingLeft);
        const paddingRight = parseFloat(buttonStyle.paddingRight);
        const gap = parseFloat(buttonStyle.gap) || 8; // gap por defecto
        const iconWidth = 16; // ancho del icono
        const availableWidth = button.offsetWidth - paddingLeft - paddingRight - iconWidth - gap;
        
        // Si hay espacio suficiente para el texto, mostrarlo
        setShowText(availableWidth >= textWidth);
      }
    };

    // Verificar después de un pequeño delay para que el DOM se actualice
    const timer = setTimeout(checkWidth, 100);
    
    // También verificar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', checkWidth);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkWidth);
    };
  }, [isMobile]);

  return { showText, buttonRef };
};

/**
 * Componente para renderizar elementos de Solicitud
 */
export const SolicitudItem = ({ 
  solicitud, 
  isAdmin, 
  onAprobar, 
  onRechazar, 
  onEditar, 
  onVerDetalles,
  TIPOS_SOLICITUD,
  ESTADOS,
  calculateDays 
}) => {
  const { showText, buttonRef } = useButtonWidth();

  return (
    <>
      {/* COLUMNA IZQUIERDA: Fecha minimalista con indicador */}
      <div className="list-date-col">
        <div className="list-date">
          <div className="list-day">
            {new Date(solicitud.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'short' })}
          </div>
          <div className="list-date-number">
            {new Date(solicitud.fecha_inicio).getDate()}
          </div>
          <div className="list-month">
            {new Date(solicitud.fecha_inicio).toLocaleDateString('es-ES', { month: 'short' })}
          </div>
        </div>
        <div className={`list-status-indicator ${solicitud.estado}`}></div>
      </div>

      {/* COLUMNA CENTRAL: Contenido principal */}
      <div className="list-info-col">
        {/* Fila superior: Tipo + Badge */}
        <div className="list-header-row">
          <div className="list-tipo">
            {TIPOS_SOLICITUD.find(t => t.value === solicitud.tipo)?.label}
          </div>
          <span className={`list-badge ${
            solicitud.estado === 'aprobada' ? 'success' :
            solicitud.estado === 'rechazada' ? 'danger' :
            solicitud.estado === 'cancelada' ? 'info' : 'warning'
          }`}>
            {ESTADOS.find(e => e.value === solicitud.estado)?.label}
          </span>
        </div>

        {/* Fila de metadata */}
        <div className="list-meta-row">
          {isAdmin && solicitud.usuario && (
            <div className="list-usuario">
              <UserIcon />
              {solicitud.usuario.nombre} {solicitud.usuario.apellidos}
            </div>
          )}
          
          <div className="list-meta-item">
            <ClockIcon />
            {calculateDays(solicitud.fecha_inicio, solicitud.fecha_fin)} días
          </div>
        </div>

        {/* Período como descripción */}
        <div className="list-descripcion">
          {new Date(solicitud.fecha_inicio).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })} - {new Date(solicitud.fecha_fin).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>

      {/* COLUMNA DERECHA: Acciones */}
      <div className="list-actions-col">
        {/* Botones de acción según el estado y rol */}
        {solicitud.estado === 'pendiente' && (
          <>
            {/* Botón de editar - siempre visible para solicitudes pendientes */}
            <button
              onClick={() => onEditar(solicitud)}
              className="list-btn-icon list-btn-icon-primary"
              title="Editar"
            >
              <DocumentTextIcon />
            </button>
            
            {/* Botones de aprobar/rechazar - solo para admins */}
            {isAdmin && (
              <>
                <button
                  onClick={() => onAprobar(solicitud)}
                  className="list-btn-icon list-btn-icon-success"
                  title="Aprobar"
                >
                  <CheckIcon />
                </button>
                <button
                  onClick={() => onRechazar(solicitud)}
                  className="list-btn-icon list-btn-icon-danger"
                  title="Rechazar"
                >
                  <XMarkIcon />
                </button>
              </>
            )}
          </>
        )}

        {/* Botón de ver resumen - siempre visible */}
        <button
          ref={buttonRef}
          onClick={() => onVerDetalles(solicitud)}
          className="list-btn-resumen"
          title="Ver resumen"
        >
          <EyeIcon />
          {showText && <span>Resumen</span>}
        </button>
      </div>
    </>
  );
};

/**
 * Componente para renderizar elementos de Incidencia
 */
export const IncidenciaItem = ({ 
  incidencia, 
  isAdmin, 
  onAprobar, 
  onRechazar, 
  onEditar, 
  onVerDetalles,
  TIPOS_INCIDENCIA,
  ESTADOS 
}) => {
  const { showText, buttonRef } = useButtonWidth();

  return (
    <>
      {/* COLUMNA IZQUIERDA: Fecha minimalista con indicador */}
      <div className="list-date-col">
        <div className="list-date">
          <div className="list-day">
            {new Date(incidencia.fecha).toLocaleDateString('es-ES', { weekday: 'short' })}
          </div>
          <div className="list-date-number">
            {new Date(incidencia.fecha).getDate()}
          </div>
          <div className="list-month">
            {new Date(incidencia.fecha).toLocaleDateString('es-ES', { month: 'short' })}
          </div>
        </div>
        <div className={`list-status-indicator ${incidencia.estado}`}></div>
      </div>

      {/* COLUMNA CENTRAL: Contenido principal */}
      <div className="list-info-col">
        {/* Fila superior: Tipo + Badge */}
        <div className="list-header-row">
          <div className="list-tipo">
            {TIPOS_INCIDENCIA.find(t => t.value === incidencia.tipo)?.label}
          </div>
          <span className={`list-badge ${
            incidencia.estado === 'aprobada' ? 'success' :
            incidencia.estado === 'rechazada' ? 'danger' : 'warning'
          }`}>
            {ESTADOS.find(e => e.value === incidencia.estado)?.label}
          </span>
        </div>

        {/* Fila de metadata */}
        <div className="list-meta-row">
          {isAdmin && incidencia.usuario && (
            <div className="list-usuario">
              <UserIcon />
              {incidencia.usuario.nombre} {incidencia.usuario.apellidos}
            </div>
          )}
          
          {(incidencia.hora_inicio || incidencia.hora_fin) && (
            <div className="list-meta-item">
              <ClockIcon />
              {incidencia.hora_inicio?.slice(11, 16)} - {incidencia.hora_fin?.slice(11, 16)}
            </div>
          )}
        </div>

        {/* Descripción */}
        {incidencia.descripcion && (
          <div className="list-descripcion">
            {incidencia.descripcion}
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA: Acciones */}
      <div className="list-actions-col">
        {/* Botones de acción según el estado y rol */}
        {incidencia.estado === 'pendiente' && (
          <>
            {/* Botón de editar - siempre visible para incidencias pendientes */}
            <button
              onClick={() => onEditar(incidencia)}
              className="list-btn-icon list-btn-icon-primary"
              title="Editar"
            >
              <DocumentTextIcon />
            </button>
            
            {/* Botones de aprobar/rechazar - solo para admins */}
            {isAdmin && (
              <>
                <button
                  onClick={() => onAprobar(incidencia)}
                  className="list-btn-icon list-btn-icon-success"
                  title="Aprobar"
                >
                  <CheckIcon />
                </button>
                <button
                  onClick={() => onRechazar(incidencia)}
                  className="list-btn-icon list-btn-icon-danger"
                  title="Rechazar"
                >
                  <XMarkIcon />
                </button>
              </>
            )}
          </>
        )}

        {/* Botón de ver resumen - siempre visible */}
        <button
          ref={buttonRef}
          onClick={() => onVerDetalles(incidencia)}
          className="list-btn-resumen"
          title="Ver resumen"
        >
          <EyeIcon />
          {showText && <span>Resumen</span>}
        </button>
      </div>
    </>
  );
};

/**
 * Componente para renderizar elementos de Usuario
 */
export const UsuarioItem = ({ 
  usuario, 
  isAdmin, 
  onEditar, 
  onEliminar, 
  onVerDetalles 
}) => {
  const { showText, buttonRef } = useButtonWidth();
  
  // Obtener el departamento y su icono
  const departamento = usuario.departamento || usuario.department;
  const DepartmentIconComponent = departamento?.icono 
    ? getIconComponent(departamento.icono) 
    : BuildingOfficeIcon;
  const departamentoColor = departamento?.color || '#8b5cf6';

  return (
    <>
      {/* COLUMNA IZQUIERDA: Avatar con iniciales */}
      <div className="list-date-col">
        <div className="list-item-avatar">
          {`${usuario.nombre?.[0] || ''}${usuario.apellidos?.[0] || ''}`.toUpperCase()}
        </div>
        <div className={`list-status-indicator ${
          usuario.activo || usuario.email_verified_at ? 'aprobada' : 'pendiente'
        }`}></div>
      </div>

      {/* COLUMNA CENTRAL: Contenido principal */}
      <div className="list-info-col">
        {/* Fila superior: Nombre + Badge de estado */}
        <div className="list-header-row">
          <div className="list-tipo">
            {usuario.nombre} {usuario.apellidos}
          </div>
          <span className={`list-badge ${
            usuario.activo || usuario.email_verified_at ? 'success' : 'warning'
          }`}>
            {usuario.activo || usuario.email_verified_at ? 'Activo' : 'Pendiente'}
          </span>
        </div>

        {/* Fila de metadata */}
        <div className="list-meta-row">
          <div className="list-meta-item">
            <UserIcon />
            {usuario.email}
          </div>
          
          {usuario.role?.nombre || usuario.rol?.nombre ? (
            <div className="list-meta-item">
              <span className={`list-meta-badge ${
                (usuario.role?.slug === 'administrador' || usuario.rol?.slug === 'administrador' ||
                 usuario.role?.nombre?.toLowerCase() === 'administrador' || usuario.rol?.nombre?.toLowerCase() === 'administrador')
                  ? 'danger' 
                  : 'info'
              }`}>
                {usuario.role?.nombre || usuario.rol?.nombre}
              </span>
            </div>
          ) : null}
        </div>

        {/* Departamento como descripción con icono dinámico */}
        {departamento?.nombre && (
          <div className="list-descripcion">
            <DepartmentIconComponent 
              style={{ 
                width: '1rem', 
                height: '1rem', 
                display: 'inline-block', 
                marginRight: '0.25rem',
                color: departamentoColor
              }} 
            />
            {departamento.nombre}
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA: Acciones */}
      <div className="list-actions-col">
        {isAdmin && (
          <>
            <button
              onClick={() => onEditar(usuario)}
              className="list-btn-icon list-btn-icon-primary"
              title="Editar"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => onEliminar(usuario)}
              className="list-btn-icon list-btn-icon-danger"
              title="Eliminar"
            >
              <TrashIcon />
            </button>
          </>
        )}

        {/* Botón de ver detalles */}
        <button
          ref={buttonRef}
          onClick={() => onVerDetalles(usuario)}
          className="list-btn-resumen"
          title="Ver detalles"
        >
          <EyeIcon />
          {showText && <span>Detalles</span>}
        </button>
      </div>
    </>
  );
};

/**
 * Componente para renderizar elementos de Departamento
 */
export const DepartamentoItem = ({ 
  departamento, 
  isAdmin, 
  onEditar, 
  onEliminar, 
  onVerDetalles 
}) => {
  const { showText, buttonRef } = useButtonWidth();
  
  const usuariosCount = departamento.usuarios_count || departamento.usuarios?.length || 0;
  const departamentoColor = departamento.color || '#8b5cf6';
  const DepartamentoIconComponent = getIconComponent(departamento.icono);

  return (
    <>
      {/* COLUMNA IZQUIERDA: Icono del departamento */}
      <div className="list-date-col">
        <div className="list-item-icon list-item-icon-department" style={{ 
          background: `linear-gradient(135deg, ${departamentoColor} 0%, ${departamentoColor}dd 100%)`
        }}>
          <DepartamentoIconComponent />
        </div>
        <div className="list-status-indicator aprobada"></div>
      </div>

      {/* COLUMNA CENTRAL: Contenido principal */}
      <div className="list-info-col">
        {/* Fila superior: Nombre + Badge */}
        <div className="list-header-row">
          <div className="list-tipo">
            {departamento.nombre}
          </div>
          <span className="list-badge info">
            {usuariosCount} {usuariosCount === 1 ? 'usuario' : 'usuarios'}
          </span>
        </div>

        {/* Fila de metadata */}
        <div className="list-meta-row">
          <div className="list-meta-item">
            <UserIcon />
            {usuariosCount} {usuariosCount === 1 ? 'miembro' : 'miembros'} asignados
          </div>
        </div>

        {/* Descripción */}
        {departamento.descripcion && (
          <div className="list-descripcion">
            {departamento.descripcion}
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA: Acciones */}
      <div className="list-actions-col">
        {isAdmin && (
          <>
            <button
              onClick={() => onEditar(departamento)}
              className="list-btn-icon list-btn-icon-primary"
              title="Editar"
            >
              <PencilIcon />
            </button>
            <button
              onClick={() => onEliminar(departamento)}
              className="list-btn-icon list-btn-icon-danger"
              title="Eliminar"
            >
              <TrashIcon />
            </button>
          </>
        )}

        {/* Botón de ver detalles */}
        <button
          ref={buttonRef}
          onClick={() => onVerDetalles(departamento)}
          className="list-btn-resumen"
          title="Ver detalles"
        >
          <EyeIcon />
          {showText && <span>Detalles</span>}
        </button>
      </div>
    </>
  );
};

