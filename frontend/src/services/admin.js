import api from '../lib/api'

export const listRoles = (params={}) => api.get('/roles', { params }).then(r=>r.data)
export const createRole = (payload) => api.post('/roles', payload).then(r=>r.data)

export const listDepartamentos = (params={}) => api.get('/departamentos', { params }).then(r=>r.data)
export const createDepartamento = (payload) => api.post('/departamentos', payload).then(r=>r.data)

export const listUsuarios = (params={}) => api.get('/usuarios', { params }).then(r=>r.data)
export const createUsuario = (payload) => api.post('/usuarios', payload).then(r=>r.data)
