import api from '../lib/api'

export const listFestivos = (params={}) => api.get('/festivos', { params }).then(r=>r.data)
export const getFestivo = (id) => api.get(`/festivos/${id}`).then(r=>r.data)
export const createFestivo = (payload) => api.post('/festivos', payload).then(r=>r.data)
export const updateFestivo = (id, payload) => api.put(`/festivos/${id}`, payload).then(r=>r.data)
export const deleteFestivo = (id) => api.delete(`/festivos/${id}`).then(r=>r.data)

