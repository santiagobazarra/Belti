import api from '../lib/api'

export const getConfig = () => api.get('/configuracion').then(r=>r.data)
export const updateConfig = (payload) => api.put('/configuracion', payload).then(r=>r.data)

