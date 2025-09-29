import api from '../lib/api'

export const listSolicitudes = (params={}) => api.get('/solicitudes', { params }).then(r=>r.data)
export const getSolicitud = (id) => api.get(`/solicitudes/${id}`).then(r=>r.data)
export const createSolicitud = (payload) => api.post('/solicitudes', payload).then(r=>r.data)
export const updateSolicitud = (id, payload) => api.patch(`/solicitudes/${id}`, payload).then(r=>r.data)
export const deleteSolicitud = (id) => api.delete(`/solicitudes/${id}`).then(r=>r.data)

