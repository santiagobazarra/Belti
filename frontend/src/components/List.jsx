import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente List reutilizable para listas de elementos con diseño minimalista
 * Basado en el patrón de Solicitudes e Incidencias
 * 
 * @param {Array} items - Array de elementos a mostrar
 * @param {Function} renderItem - Función para renderizar cada elemento
 * @param {string} className - Clases CSS adicionales para el contenedor
 * @param {Object} config - Configuración del componente
 * @param {string} config.variant - Variante del componente ('solicitud', 'incidencia', 'custom')
 * @param {string} config.itemKey - Campo único para la key de cada elemento
 * @param {boolean} config.showHeader - Mostrar header con contador
 * @param {number} config.headerCount - Número a mostrar en el header
 * @param {string} config.headerText - Texto del header
 * @param {boolean} config.loading - Estado de carga
 * @param {React.ReactNode} config.emptyState - Componente para estado vacío
 */
const List = ({
  items = [],
  renderItem,
  className = '',
  config = {}
}) => {
  const {
    variant = 'custom',
    itemKey = 'id',
    showHeader = false,
    headerCount = 0,
    headerText = 'Elementos',
    loading = false,
    emptyState = null
  } = config;

  // Clases CSS base
  const baseClasses = `list list-${variant}`;
  const containerClasses = `${baseClasses} ${className}`.trim();

  // Renderizar header si está habilitado
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className="list-header">
        <h3 className="list-title">{headerText}</h3>
        <span className="list-count">{headerCount}</span>
      </div>
    );
  };

  // Renderizar estado de carga
  const renderLoading = () => {
    if (!loading) return null;

    return (
      <div className="list-loading">
        <div className="list-loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  };

  // Renderizar estado vacío
  const renderEmpty = () => {
    if (loading || items.length > 0) return null;

    return emptyState || (
      <div className="list-empty">
        <p>No hay elementos para mostrar</p>
      </div>
    );
  };

  // Renderizar lista de elementos
  const renderItems = () => {
    if (loading || items.length === 0) return null;

    return (
      <div className="list-scrollable">
        {items.map((item, index) => (
          <div key={item[itemKey] || index} className={`list-item list-item-${variant}`}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      {renderHeader()}
      {renderLoading()}
      {renderEmpty()}
      {renderItems()}
    </div>
  );
};

List.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  className: PropTypes.string,
  config: PropTypes.shape({
    variant: PropTypes.oneOf(['solicitud', 'incidencia', 'custom']),
    itemKey: PropTypes.string,
    showHeader: PropTypes.bool,
    headerCount: PropTypes.number,
    headerText: PropTypes.string,
    loading: PropTypes.bool,
    emptyState: PropTypes.node
  })
};

export default List;
