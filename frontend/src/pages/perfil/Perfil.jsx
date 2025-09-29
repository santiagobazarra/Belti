import { useAuth } from '../../context/AuthContext'

export default function Perfil() {
  const { user } = useAuth()
  const nombre = user?.nombre || ''
  const apellidos = user?.apellidos || ''
  const rol = user?.role?.nombre || user?.role?.slug || '—'
  const departamento = user?.department?.nombre || user?.departamento?.nombre || '—'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Información personal</h3>
          </div>
          <div className="card-content">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {(nombre[0] || '?')}{(apellidos[0] || '')}
              </div>
              <div>
                <div className="font-medium">{nombre} {apellidos}</div>
                <div className="text-sm text-gray-600">Rol: {rol}</div>
                <div className="text-sm text-gray-600">Departamento: {departamento}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Idioma</h3>
          </div>
          <div className="card-content">
            <select defaultValue="es" className="form-input">
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="fr">Francés</option>
              <option value="de">Alemán</option>
            </select>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tema</h3>
          </div>
          <div className="card-content">
            <div className="flex items-center gap-3">
              <span>Modo</span>
              <select defaultValue="light" className="form-input">
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Notificaciones</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> Email
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> SMS
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> Push
              </label>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Seguridad</h3>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200">Actualizar contraseña</button>
              <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200">Configurar 2FA</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
