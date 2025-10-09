import { useState, useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const ChartContainer = ({ 
  title, 
  type = 'bar', 
  data, 
  options = {}, 
  icon: IconComponent,
  className = '',
  onExport,
  onShare,
  showControls = true
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const chartRef = useRef(null)

  // Destruir gráfico cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.destroy()
        } catch (error) {
          // Ignorar errores de destrucción
        }
      }
    }
  }, [])

  // Opciones por defecto para los gráficos
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: '600'
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6b7280'
        },
        beginAtZero: true
      }
    } : undefined,
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8
      },
      point: {
        backgroundColor: 'white',
        borderWidth: 2
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    ...options
  }

  const handleExport = async () => {
    if (!chartRef.current) return
    
    setIsLoading(true)
    try {
      const canvas = chartRef.current.canvas
      const url = canvas.toDataURL('image/png')
      
      // Crear enlace de descarga
      const link = document.createElement('a')
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.png`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      if (onExport) {
        await onExport(url)
      }
    } catch (error) {
      console.error('Error al exportar gráfico:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (onShare) {
      await onShare()
    } else {
      // Compartir por defecto (copiar enlace)
      try {
        await navigator.clipboard.writeText(window.location.href)
        // Aquí podrías mostrar un toast de confirmación
        console.log('Enlace copiado al portapapeles')
      } catch (error) {
        console.error('Error al compartir:', error)
      }
    }
  }

  const renderChart = () => {
    // Validar que los datos sean correctos
    if (!data || !data.labels || !Array.isArray(data.labels)) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p>No hay datos disponibles para mostrar</p>
          </div>
        </div>
      )
    }

    const chartProps = {
      ref: chartRef,
      data,
      options: defaultOptions
    }

    switch (type) {
      case 'line':
        return <Line {...chartProps} />
      case 'doughnut':
        return <Doughnut {...chartProps} />
      case 'bar':
      default:
        return <Bar {...chartProps} />
    }
  }

  if (!isVisible) {
    return (
      <div className={`reporte-chart-container ${className}`}>
        <div className="reporte-chart-header">
          <div className="reporte-chart-title">
            {IconComponent && <IconComponent />}
            {title}
          </div>
          <button
            onClick={() => setIsVisible(true)}
            className="reporte-chart-btn"
          >
            <EyeIcon className="w-4 h-4" />
            Mostrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`reporte-chart-container ${className}`}>
      <div className="reporte-chart-header">
        <div className="reporte-chart-title">
          {IconComponent && <IconComponent />}
          {title}
        </div>
        {showControls && (
          <div className="reporte-chart-actions">
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="reporte-chart-btn"
              title="Exportar como imagen"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {isLoading ? 'Exportando...' : 'Exportar'}
            </button>
            <button
              onClick={handleShare}
              className="reporte-chart-btn"
              title="Compartir"
            >
              <ShareIcon className="w-4 h-4" />
              Compartir
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="reporte-chart-btn"
              title="Ocultar gráfico"
            >
              <EyeSlashIcon className="w-4 h-4" />
              Ocultar
            </button>
          </div>
        )}
      </div>
      <div className="reporte-chart-wrapper">
        {renderChart()}
      </div>
    </div>
  )
}

export default ChartContainer
