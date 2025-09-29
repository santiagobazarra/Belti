import { useState } from 'react'
import ReportesResumen from './ReportesResumen'
import {
  DocumentChartBarIcon,
  ClockIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

export default function Reportes() {
  const [activeTab, setActiveTab] = useState('resumen')

  const tabs = [
    {
      id: 'resumen',
      label: 'Resumen General',
      icon: DocumentChartBarIcon
    },
    {
      id: 'jornadas',
      label: 'Jornadas',
      icon: ClockIcon
    },
    {
      id: 'solicitudes',
      label: 'Solicitudes',
      icon: EnvelopeIcon
    },
    {
      id: 'incidencias',
      label: 'Incidencias',
      icon: ExclamationTriangleIcon
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':
        return <ReportesResumen />
      case 'jornadas':
        return <ReporteJornadas />
      case 'solicitudes':
        return <ReporteSolicitudes />
      case 'incidencias':
        return <ReporteIncidencias />
      default:
        return <ReportesResumen />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sistema de Reportes</h1>
        <p className="text-gray-600 mt-1">
          Genera y consulta reportes detallados del sistema de control horario
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div className="tabs-list">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  )
}

// Componente para Reporte de Jornadas
function ReporteJornadas() {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    empleado: ''
  })

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Reporte de Jornadas</h3>
      </div>
      <div className="card-content space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empleado
            </label>
            <select
              value={filtros.empleado}
              onChange={(e) => setFiltros({...filtros, empleado: e.target.value})}
              className="form-input"
            >
              <option value="">Todos los empleados</option>
              <option value="1">Juan Pérez</option>
              <option value="2">María García</option>
              <option value="3">Carlos López</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary">
          <DocumentChartBarIcon className="icon-left" />
          Generar Reporte
        </button>
      </div>
    </div>
  )
}

// Componente para Reporte de Solicitudes
function ReporteSolicitudes() {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  })

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Reporte de Solicitudes</h3>
      </div>
      <div className="card-content space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="form-input"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary">
          <DocumentChartBarIcon className="icon-left" />
          Generar Reporte
        </button>
      </div>
    </div>
  )
}

// Componente para Reporte de Incidencias
function ReporteIncidencias() {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    tipo: ''
  })

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Reporte de Incidencias</h3>
      </div>
      <div className="card-content space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="form-input"
            >
              <option value="">Todos los tipos</option>
              <option value="falta">Falta</option>
              <option value="retraso">Retraso</option>
              <option value="ausencia_parcial">Ausencia parcial</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary">
          <DocumentChartBarIcon className="icon-left" />
          Generar Reporte
        </button>
      </div>
    </div>
  )
}
