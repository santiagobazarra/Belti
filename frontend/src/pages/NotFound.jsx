import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="mb-4">No encontramos la página.</p>
        <Link className="text-blue-600" to="/">Volver al inicio</Link>
      </div>
    </div>
  )
}
