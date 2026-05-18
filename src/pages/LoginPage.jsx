import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center relative">
      {/* Tech Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #3a494a 1px, transparent 1px), linear-gradient(to bottom, #3a494a 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.15,
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,220,229,0.05)_0%,transparent_80%)]" />

      <div className="relative z-10 w-full max-w-[400px] mx-4">
        {/* Card */}
        <div className="border border-outline-variant bg-surface-bg">
          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 border border-primary bg-primary/5">
              <span className="material-symbols-outlined text-primary text-2xl">ssid_chart</span>
            </div>
            <h1 className="text-headline-sm font-bold text-primary tracking-tight">DHIDROSAN</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">Ingeniería Civil - Hidrosanitaria</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">
                CORREO ELECTRÓNICO
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant text-on-surface text-[13px] font-mono focus:border-primary focus:outline-none transition-colors"
                placeholder="usuario@civilflow.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-widest uppercase text-on-surface-variant mb-1.5">
                CONTRASEÑA
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant text-on-surface text-[13px] font-mono focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border border-outline-variant bg-surface-container-low accent-primary" />
                <span className="text-on-surface-variant">Recordarme</span>
              </label>
              <button type="button" className="text-primary hover:text-primary-fixed underline text-[13px]">
                ¿Olvidó su contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-primary text-on-primary font-bold text-[11px] tracking-widest uppercase hover:bg-primary-container hover:text-on-primary-container transition-colors"
            >
              INICIAR SESIÓN
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-outline-variant text-center">
            <p className="text-[13px] text-on-surface-variant">
              ¿No tiene cuenta?{' '}
              <button className="text-primary hover:text-primary-fixed underline">
                Registrarse
              </button>
            </p>
          </div>

          {/* Engineering badges */}
          <div className="px-6 pb-6 flex justify-center gap-2">
            <span className="px-2 py-1 text-[11px] text-on-surface-variant bg-surface-container border border-outline-variant">
              NTC 1500
            </span>
            <span className="px-2 py-1 text-[11px] text-on-surface-variant bg-surface-container border border-outline-variant">
              RAS 2000
            </span>
            <span className="px-2 py-1 text-[11px] text-on-surface-variant bg-surface-container border border-outline-variant">
              NTC 3728
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
