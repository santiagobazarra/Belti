import api from '../lib/api'

export const toggleJornada = () => api.post('/fichaje/jornada').then(r => r.data)
export const togglePausa = () => api.post('/fichaje/pausa').then(r => r.data)

