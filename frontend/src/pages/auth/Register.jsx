import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await register(form)
    if (res.ok) navigate('/')
    else setError(res.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h1 className="text-xl font-semibold mb-4">Registro</h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <form onSubmit={onSubmit} className="grid gap-3">
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input name="nombre" className="w-full border rounded px-3 py-2" value={form.nombre} onChange={onChange} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Apellidos</label>
            <input name="apellidos" className="w-full border rounded px-3 py-2" value={form.apellidos} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" name="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={onChange} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" name="password" className="w-full border rounded px-3 py-2" value={form.password} onChange={onChange} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirmación</label>
            <input type="password" name="password_confirmation" className="w-full border rounded px-3 py-2" value={form.password_confirmation} onChange={onChange} required />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">{loading? 'Creando...' : 'Crear cuenta'}</button>
        </form>
        <p className="text-sm mt-3">¿Ya tienes cuenta? <Link to="/login" className="text-blue-600">Accede</Link></p>
      </div>
    </div>
  )
}

