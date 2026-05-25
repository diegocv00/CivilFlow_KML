import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', empresa: '', password: '', confirm: '' });
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0e14', color: '#e2e2e8' }}>
      <style>{`
        .login-grid {
          background-image: linear-gradient(rgba(0,170,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,170,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>

      <Navbar />

      <div className="flex-1 flex items-center justify-center relative pt-16 py-12">
        <div className="absolute inset-0 login-grid pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'rgba(0,170,255,0.06)' }} />

        <div className="relative z-10 w-full max-w-[420px] mx-4">
          <div className="border border-outline-variant" style={{ background: 'rgba(10,14,20,0.8)', backdropFilter: 'blur(16px)' }}>

            <div className="px-8 pt-10 pb-6 text-center">
              <div className="flex justify-center mb-5">
                <img src="/logos/civilCorelogo.png" alt="CivilCore" className="w-16 h-16 object-contain"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(0,170,255,0.25))' }} />
              </div>
              <h1 className="text-2xl font-black tracking-tight uppercase mb-1"
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                <span style={{ color: '#e8f4fd' }}>CIVIL</span>
                <span style={{ color: '#00dce5' }}>CORE</span>
              </h1>
              <p className="text-xs uppercase tracking-widest" style={{ color: '#6b8cae', fontFamily: 'Geist, monospace', fontWeight: 600 }}>
                Crear Cuenta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                    style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>NOMBRE</label>
                  <input type="text" value={form.nombre} onChange={handleChange('nombre')}
                    className="w-full h-10 px-3 border text-sm focus:outline-none transition-colors"
                    style={{ background: '#0a0e14', borderColor: '#3a494a', color: '#e2e2e8', fontFamily: 'Geist, monospace' }}
                    onFocus={(e) => e.target.style.borderColor = '#00dce5'}
                    onBlur={(e) => e.target.style.borderColor = '#3a494a'} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                    style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>APELLIDO</label>
                  <input type="text" value={form.apellido} onChange={handleChange('apellido')}
                    className="w-full h-10 px-3 border text-sm focus:outline-none transition-colors"
                    style={{ background: '#0a0e14', borderColor: '#3a494a', color: '#e2e2e8', fontFamily: 'Geist, monospace' }}
                    onFocus={(e) => e.target.style.borderColor = '#00dce5'}
                    onBlur={(e) => e.target.style.borderColor = '#3a494a'} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                  style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>CORREO ELECTRÓNICO</label>
                <input type="email" value={form.email} onChange={handleChange('email')}
                  className="w-full h-10 px-3 border text-sm focus:outline-none transition-colors"
                  style={{ background: '#0a0e14', borderColor: '#3a494a', color: '#e2e2e8', fontFamily: 'Geist, monospace' }}
                  onFocus={(e) => e.target.style.borderColor = '#00dce5'}
                  onBlur={(e) => e.target.style.borderColor = '#3a494a'}
                  placeholder="usuario@civilcore.com" />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                  style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>EMPRESA</label>
                <input type="text" value={form.empresa} onChange={handleChange('empresa')}
                  className="w-full h-10 px-3 border text-sm focus:outline-none transition-colors"
                  style={{ background: '#0a0e14', borderColor: '#3a494a', color: '#e2e2e8', fontFamily: 'Geist, monospace' }}
                  onFocus={(e) => e.target.style.borderColor = '#00dce5'}
                  onBlur={(e) => e.target.style.borderColor = '#3a494a'}
                  placeholder="Nombre de su empresa" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                    style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>CONTRASEÑA</label>
                  <input type="password" value={form.password} onChange={handleChange('password')}
                    className="w-full h-10 px-3 border text-sm focus:outline-none transition-colors"
                    style={{ background: '#0a0e14', borderColor: '#3a494a', color: '#e2e2e8', fontFamily: 'Geist, monospace' }}
                    onFocus={(e) => e.target.style.borderColor = '#00dce5'}
                    onBlur={(e) => e.target.style.borderColor = '#3a494a'} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5"
                    style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>CONFIRMAR</label>
                  <input type="password" value={form.confirm} onChange={handleChange('confirm')}
                    className="w-full h-10 px-3 border text-sm focus:outline-none transition-colors"
                    style={{ background: '#0a0e14', borderColor: '#3a494a', color: '#e2e2e8', fontFamily: 'Geist, monospace' }}
                    onFocus={(e) => e.target.style.borderColor = '#00dce5'}
                    onBlur={(e) => e.target.style.borderColor = '#3a494a'} />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" className="w-4 h-4 mt-0.5 border accent-[#00dce5]"
                  style={{ borderColor: '#3a494a', background: '#0a0e14' }} />
                <span className="text-[11px] leading-tight" style={{ color: '#6b8cae' }}>
                  Acepto los <span className="cursor-pointer hover:underline" style={{ color: '#00dce5' }}>Términos de Servicio</span> y la <span className="cursor-pointer hover:underline" style={{ color: '#00dce5' }}>Política de Privacidad</span>
                </span>
              </div>

              <button
                type="submit"
                className="w-full h-12 font-bold text-[11px] tracking-widest uppercase transition-all"
                style={{ background: '#00dce5', color: '#0a0e14', fontFamily: 'Geist, monospace',
                  boxShadow: '0 0 20px rgba(0,220,229,0.2)' }}
                onMouseEnter={(e) => e.target.style.boxShadow = '0 0 30px rgba(0,220,229,0.4)'}
                onMouseLeave={(e) => e.target.style.boxShadow = '0 0 20px rgba(0,220,229,0.2)'}
              >
                CREAR CUENTA
              </button>
            </form>

            <div className="px-8 py-5 border-t text-center" style={{ borderColor: '#3a494a' }}>
              <p className="text-xs" style={{ color: '#6b8cae' }}>
                ¿Ya tiene cuenta?{' '}
                <Link to="/login" className="font-bold hover:underline" style={{ color: '#00dce5' }}>
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
