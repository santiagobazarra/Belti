import api from '../lib/api'

export const resumenJSON = (params={}) => api.get('/reportes/resumen', { params }).then(r=>r.data)
export const resumenCSV = (params={}) => api.get('/reportes/resumen.csv', { params, responseType: 'blob', headers: { Accept: 'text/csv' } }).then(r=>r.data)
export const resumenPDF = (params={}) => api.get('/reportes/resumen.pdf', { params, responseType: 'blob', headers: { Accept: 'application/pdf' } }).then(r=>r.data)

