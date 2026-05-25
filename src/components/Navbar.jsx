import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const path = location.pathname;
  const active = 'text-primary border-b border-primary pb-1 uppercase text-sm tracking-[0.08em] font-bold cursor-pointer active-nav-glow transition-all';
  const inactive = 'text-on-surface-variant uppercase text-sm tracking-[0.08em] font-bold hover:text-primary transition-colors px-3 py-1';

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-outline-variant flex justify-between items-center h-16 px-6 lg:px-8"
      style={{ background: '#111317' }}>
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logos/civilCorelogo.png" alt="CivilCore" className="h-8 w-8 object-contain" />
          <span className="font-bold text-xl tracking-tighter uppercase text-primary" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>CIVILCORE</span>
        </Link>
        <div className="hidden md:flex gap-6 items-center h-full">
          <Link to="/" className={path === '/' ? active : inactive} style={{ fontFamily: 'Geist, monospace' }}>INICIO</Link>
          <Link to="/pricing" className={path === '/pricing' ? active : inactive} style={{ fontFamily: 'Geist, monospace' }}>PRECIOS</Link>
          <Link to="/docs" className={path === '/docs' ? active : inactive} style={{ fontFamily: 'Geist, monospace' }}>DOCUMENTACIÓN</Link>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/login" className="bg-primary-container text-on-primary-container px-6 py-2 uppercase text-sm tracking-[0.08em] font-bold border border-primary hover:bg-primary hover:text-on-primary transition-all" style={{ fontFamily: 'Geist, monospace', boxShadow: '0 0 10px rgba(0,245,255,0.1)' }}>
          ACCESO
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
