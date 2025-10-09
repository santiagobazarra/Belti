import { useEffect, useRef } from 'react'
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

const SimpleChart = ({ 
  title, 
  type = 'bar', 
  data, 
  options = {}, 
  className = ''
}) => {
  const chartRef = useRef(null)

  // Opciones por defecto
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  // Validar datos
  if (!data || !data.labels || !Array.isArray(data.labels)) {
    return (
      <div className={`reporte-chart-container ${className}`}>
        <div className="reporte-chart-header">
          <div className="reporte-chart-title">{title}</div>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p>No hay datos disponibles para mostrar</p>
          </div>
        </div>
      </div>
    )
  }

  const chartProps = {
    ref: chartRef,
    data,
    options: defaultOptions
  }

  const renderChart = () => {
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

  return (
    <div className={`reporte-chart-container ${className}`}>
      <div className="reporte-chart-header">
        <div className="reporte-chart-title">{title}</div>
      </div>
      <div className="reporte-chart-wrapper">
        {renderChart()}
      </div>
    </div>
  )
}

export default SimpleChart
