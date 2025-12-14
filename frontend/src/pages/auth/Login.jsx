import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const canvasRef = useRef(null)
  const errorTimeoutRef = useRef(null)

  const closeError = () => {
    setIsClosing(true)
    setTimeout(() => {
      setError('')
      setIsClosing(false)
    }, 300) // Tiempo de la animación de salida
  }

  useEffect(() => {
    if (error && !isClosing) {
      // Limpiar timeout anterior si existe
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
      // Cerrar automáticamente después de 5 segundos
      errorTimeoutRef.current = setTimeout(() => {
        closeError()
      }, 5000)
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [error, isClosing])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (error) closeError()
    const res = await login(email, password)
    if (res.ok) navigate(from, { replace: true })
    else {
      setError(res.error)
      setIsClosing(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    class Particle {
      constructor() {
        this.reset()
        this.y = Math.random() * canvas.height
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.2
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.fill()
      }
    }

    // Crear partículas
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Dibujar conexiones entre partículas cercanas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 120)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Actualizar y dibujar partículas
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="login-container">
      {/* Canvas de partículas */}
      <canvas ref={canvasRef} className="particles-canvas" />
      
      {/* Gradientes animados de fondo */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Notificación de error */}
      {error && (
        <div className={`error-notification ${isClosing ? 'closing' : ''}`}>
          <div className="notification-content">
            <div className="notification-icon-wrapper">
              <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="notification-text">
              <p className="notification-title">Error de autenticación</p>
              <p className="notification-message">{error}</p>
            </div>
            <button 
              onClick={closeError} 
              className="notification-close"
              aria-label="Cerrar notificación"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="login-wrapper">
        <div className="login-card">
          {/* Header minimalista */}
          <div className="login-header">
            <h1 className="login-title">Iniciar sesión</h1>
            <p className="login-subtitle">Accede a tu cuenta</p>
          </div>


          {/* Form */}
          <form onSubmit={onSubmit} className="login-form">
            {/* Email field */}
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="form-input"
                  placeholder="nombre@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="form-input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle className="spinner-circle" cx="12" cy="12" r="10" />
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #000000;
          position: relative;
          overflow: hidden;
        }

        .particles-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .animated-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(99, 102, 241, 0) 70%);
          bottom: -300px;
          right: -200px;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }

        .login-wrapper {
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 3rem 2.5rem;
          box-shadow: 
            0 8px 32px 0 rgba(0, 0, 0, 0.37),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          position: relative;
          z-index: 1;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #111827;
          letter-spacing: -0.025em;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .login-subtitle {
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0;
          font-weight: 400;
        }

        .error-notification {
          position: fixed;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          animation: slideDownBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          max-width: 90%;
          width: 100%;
          max-width: 420px;
        }

        .error-notification.closing {
          animation: slideUpFadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .notification-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: rgba(239, 68, 68, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 
            0 10px 40px rgba(239, 68, 68, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
            0 0 60px rgba(239, 68, 68, 0.2);
          position: relative;
          overflow: hidden;
        }

        .notification-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.5), 
            transparent
          );
          animation: shimmer 2s infinite;
        }

        .notification-icon-wrapper {
          flex-shrink: 0;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .notification-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #ffffff;
          animation: pulse 2s ease-in-out infinite;
        }

        .notification-text {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 0.25rem 0;
          letter-spacing: -0.01em;
        }

        .notification-message {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.4;
        }

        .notification-close {
          flex-shrink: 0;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          padding: 0;
        }

        .notification-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          transform: scale(1.1);
        }

        .notification-close svg {
          width: 1rem;
          height: 1rem;
        }

        @keyframes slideDownBounce {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
          }
          60% {
            opacity: 1;
            transform: translateX(-50%) translateY(10px);
          }
          100% {
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes slideUpFadeOut {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%) scale(0.95);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          letter-spacing: -0.01em;
        }

        .input-wrapper {
          position: relative;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          transition: all 0.15s ease;
        }

        .input-wrapper:hover {
          border-color: #9ca3af;
        }

        .input-wrapper.focused {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          color: #111827;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          line-height: 1.5;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }

        .password-toggle:hover {
          color: #374151;
        }

        .icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .submit-button {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: #111827;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          font-family: inherit;
          letter-spacing: -0.01em;
        }

        .submit-button:hover:not(:disabled) {
          background: #1f2937;
        }

        .submit-button:active:not(:disabled) {
          transform: scale(0.99);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 1.125rem;
          height: 1.125rem;
          animation: spin 0.8s linear infinite;
        }

        .spinner-circle {
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-dasharray: 32;
          stroke-dashoffset: 24;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 2.5rem 2rem;
          }

          .login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

