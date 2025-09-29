import { useEffect, useState } from 'react'

export default function LiveClock({ className = '' }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`${className}`}>
      <div className="p-3 text-center flex flex-col justify-center items-center h-full">
        {/* Fecha */}
        <div className="p-3 text-base font-medium text-gray-500 mb-4 uppercase tracking-wide" style={{ fontFamily: '"Google Sans", sans-serif' }}>
          {formatDate(now)}
        </div>

        {/* Hora principal - GOOGLE SANS OFICIAL */}
        <div className="text-8xl font-normal text-gray-900 tracking-normal leading-none mb-3" style={{ fontFamily: '"Google Sans", sans-serif', fontFeatureSettings: '"tnum"' }}>
          {hh}<span className="text-gray-500">:</span>{mm}
          <span className="text-6xl text-gray-400 ml-3 font-light">{ss}</span>
        </div>

        {/* Indicador sutil */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-medium tracking-normal" style={{ fontFamily: '"Google Sans", sans-serif' }}>
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span>TIEMPO REAL</span>
        </div>
      </div>
    </div>
  )
}
