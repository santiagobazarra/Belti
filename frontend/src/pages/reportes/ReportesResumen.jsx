import { useState, useEffect } from 'react'
import { resumenCSV, resumenJSON, resumenPDF } from '../../services/reportes'
import api from '../../lib/api'
import {
  PlayIcon,
  DocumentTextIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'

export default function ReportesResumen() {
  const [params, setParams] = useState({ desde: '', hasta: '', usuario_id: '', departamento_id: '' })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [departamentos, setDepartamentos] = useState([])

  useEffect(() => {
    loadUsuarios()
    loadDepartamentos()
  }, [])

  const loadUsuarios = async () => {
    try {
      const { data } = await api.get('/usuarios')
      setUsuarios(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    }
  }

  const loadDepartamentos = async () => {
    try {
      const { data } = await api.get('/departamentos')
      setDepartamentos(data.data || data || [])
    } catch (error) {
      console.error('Error al cargar departamentos:', error)
    }
  }

  const cleanParams = (p) => {
    const clean = {}
    Object.entries(p).forEach(([k, v]) => { if (v) clean[k] = v })
    return clean
  }

  const load = async () => {
    setLoading(true)
    try {
      const d = await resumenJSON(cleanParams(params));
      setData(d)
    } catch (e) {
      setData({ error: e?.response?.data || e.message })
    } finally {
      setLoading(false)
    }
  }

  const download = async (kind) => {
    try {
      const p = cleanParams(params)
      const blob = kind === 'csv' ? await resumenCSV(p) : await resumenPDF(p)
      const url = URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url
      a.download = kind === 'csv' ? 'resumen.csv' : 'resumen.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes - Resumen</h1>
        <p className="text-gray-600 mt-1">Genera reportes personalizados del sistema</p>
      </div>

      {/* Filtros con diseño mejorado */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={params.desde}
                onChange={(e) => setParams({...params, desde: e.target.value})}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={params.hasta}
                onChange={(e) => setParams({...params, hasta: e.target.value})}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <select
                value={params.usuario_id}
                onChange={(e) => setParams({...params, usuario_id: e.target.value})}
                className="form-input"
              >
                <option value="">Todos los usuarios</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario?.nombre && usuario?.apellidos ? `${usuario.nombre} ${usuario.apellidos}` : 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <select
                value={params.departamento_id}
                onChange={(e) => setParams({...params, departamento_id: e.target.value})}
                className="form-input"
              >
                <option value="">Todos los departamentos</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept?.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones con diseño premium */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={load}
              disabled={loading}
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
            >
              <PlayIcon className="icon-left" />
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>

            <button
              onClick={() => download('csv')}
              className="btn btn-secondary"
            >
              <TableCellsIcon className="icon-left" />
              Descargar CSV
            </button>

            <button
              onClick={() => download('pdf')}
              className="btn btn-success"
            >
              <DocumentTextIcon className="icon-left" />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Resultado del reporte */}
      {data && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Resultado del Reporte</h3>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Generando reporte...</p>
              </div>
            ) : (
              <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
