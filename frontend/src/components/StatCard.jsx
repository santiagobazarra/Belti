import { useState, useEffect } from 'react'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import Tooltip from './Tooltip'

const StatCard = ({
  title,
  value,
  icon: IconComponent,
  trend = null,
  trendValue = null,
  color = 'primary',
  format = 'number',
  suffix = '',
  prefix = '',
  className = '',
  tooltip = null
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(val)
    } else if (format === 'percentage') {
      return `${val.toFixed(1)}%`
    } else if (format === 'time') {
      const hours = Math.floor(val / 60)
      const minutes = val % 60
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`
    } else if (format === 'duration') {
      const hours = Math.floor(val)
      const minutes = Math.round((val - hours) * 60)
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`
    }
    return new Intl.NumberFormat('es-ES').format(val)
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowTrendingUpIcon className="w-3 h-3" />
    if (trend === 'down') return <ArrowTrendingDownIcon className="w-3 h-3" />
    return <MinusIcon className="w-3 h-3" />
  }

  const getTrendColor = () => {
    if (trend === 'up') return '#16a34a'
    if (trend === 'down') return '#dc2626'
    return '#6b7280'
  }

  const getTrendBg = () => {
    if (trend === 'up') return '#dcfce7'
    if (trend === 'down') return '#fee2e2'
    return '#f3f4f6'
  }

  const colorClasses = {
    primary: {
      icon: '#3b82f6',
      bg: '#eff6ff'
    },
    success: {
      icon: '#10b981',
      bg: '#ecfdf5'
    },
    warning: {
      icon: '#f59e0b',
      bg: '#fffbeb'
    },
    danger: {
      icon: '#ef4444',
      bg: '#fef2f2'
    },
    purple: {
      icon: '#8b5cf6',
      bg: '#f3e8ff'
    },
    pink: {
      icon: '#ec4899',
      bg: '#fce7f3'
    }
  }

  const currentColor = colorClasses[color] || colorClasses.primary

  return (
    <div 
      className={`reporte-stat-card ${color} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease'
      }}
    >
      <div className="reporte-stat-header">
        <div 
          className="reporte-stat-icon"
          style={{
            backgroundColor: currentColor.bg,
            color: currentColor.icon
          }}
        >
          {IconComponent && <IconComponent />}
        </div>
        <div className="reporte-stat-header-right">
          {tooltip && (
            <Tooltip content={tooltip} delay={1000} position="top">
              <InformationCircleIcon 
                className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" 
              />
            </Tooltip>
          )}
          {trend !== null && trendValue !== null && (
            <div 
              className="reporte-stat-trend"
              style={{
                backgroundColor: getTrendBg(),
                color: getTrendColor()
              }}
            >
              {getTrendIcon()}
              {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
      
      <div className="reporte-stat-value">
        {prefix}{formatValue(value)}{suffix}
      </div>
      
      <div className="reporte-stat-label">
        {title}
      </div>
    </div>
  )
}

export default StatCard
