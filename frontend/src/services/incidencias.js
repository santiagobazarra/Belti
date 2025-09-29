import api from '../lib/api'

export const listIncidencias = (params={}) => api.get('/incidencias', { params }).then(r=>r.data)
export const getIncidencia = (id) => api.get(`/incidencias/${id}`).then(r=>r.data)
export const createIncidencia = (payload) => api.post('/incidencias', payload).then(r=>r.data)
export const updateIncidencia = (id, payload) => api.patch(`/incidencias/${id}`, payload).then(r=>r.data)
export const approveIncidencia = (id, payload={}) => api.patch(`/incidencias/${id}/aprobar`, payload).then(r=>r.data)
export const deleteIncidencia = (id) => api.delete(`/incidencias/${id}`).then(r=>r.data)

