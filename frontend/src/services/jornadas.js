import api from '../lib/api'

export const listJornadas = (params = {}) => api.get('/jornadas', { params }).then(r=>r.data)
export const resumenJornadas = (params = {}) => api.get('/jornadas/resumen', { params }).then(r=>r.data)

