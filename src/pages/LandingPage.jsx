import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MODULOS_HERO = [
  { id: 'flow', logo: '/logos/civilFlowlogo.png', name: 'CivilFlow', color: '#00aaff', path: '/civilflow',
    desc: 'Diseño y análisis de redes hidráulicas, sanitarias y de gas. Modelado de flujos, presiones y caudales.',
    cats: ['Modelado de redes', 'Análisis de presiones', 'Cálculo de caudales', 'Normativas integradas'] },
  { id: 'structure', logo: '/logos/civilStructurelogo.png', name: 'CivilStructure', color: '#7f8c8d', path: '/civilstructure',
    desc: 'Diseño estructural y análisis de elementos como puentes, losas y marcos. Cálculo de cargas y resistencia.',
    cats: ['Análisis FEM', 'Diseño de elementos', 'Cálculo de cargas', 'Normativas NTC'] },
  { id: 'terrain', logo: '/logos/civilTerrainlogo.png', name: 'CivilTerrain', color: '#27ae60', path: '/civilterrain',
    desc: 'Topografía digital, perfiles de terreno y cálculo de movimiento de tierras. Modelos 3D del suelo.',
    cats: ['Modelos 3D', 'Curvas de nivel', 'Volúmenes corte/relleno', 'Integración LiDAR'] },
  { id: 'bim', logo: '/logos/civilBIMlogo.png', name: 'CivilBIM', color: '#8e44ad', path: '/civilbim',
    desc: 'Integración BIM para coordinación multidisciplinar. Visualización y gestión de modelos 3D inteligentes.',
    cats: ['Importación IFC', 'Detección de colisiones', 'Coordinación BIM', 'Vinculación Revit'] },
  { id: 'manage', logo: '/logos/civilManagelogo.png', name: 'CivilManage', color: '#e67e22', path: '/civilmanage',
    desc: 'Gestión de proyectos, presupuestos, cronogramas y seguimiento de avance de obra.',
    cats: ['Control de costos', 'Gestión de cronogramas', 'Avance de obra', 'Integración ERP'] },
  { id: 'mep', logo: '/logos/civilMEPlogo.png', name: 'CivilMEP', color: '#16a085', path: '/civilmep',
    desc: 'Diseño de instalaciones mecánicas, eléctricas y de plomería integradas al modelo civil.',
    cats: ['Ruteo inteligente', 'Análisis de cargas', 'Dimensionamiento', 'Coordination MEP'] },
  { id: 'roads', logo: '/logos/civilRoadslogo.png', name: 'CivilRoads', color: '#f39c12', path: '/civilroads',
    desc: 'Diseño geométrico de vías, urbanismo, peraltes y alineamientos horizontales y verticales.',
    cats: ['Alineamientos', 'Diseño geométrico', 'Señalización', 'Análisis de tráfico'] },
];

const PILLARS = [
  { icon: 'link', title: 'INTEGRACIÓN\nTOTAL' },
  { icon: 'cloud_sync', title: 'FLUJO DE TRABAJO\nCONECTADO' },
  { icon: 'schema', title: 'DATOS ÚNICOS\nINTELIGENTES' },
  { icon: 'group_work', title: 'COLABORACIÓN\nEN TIEMPO REAL' },
];

function LandingPage() {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const hovered = hoveredIdx !== null ? MODULOS_HERO[hoveredIdx] : null;

  return (
    <div className="min-h-screen" style={{ background: '#0a0e14', color: '#e2e2e8' }}>
      <style>{`
        .hero-module { transition: filter 0.3s, transform 0.3s; cursor: pointer; }
        .hero-module:hover { filter: drop-shadow(0 0 16px var(--mod-color)); transform: translateY(-6px) scale(1.04); }
        .hero-module .mod-glow { opacity: 0; transition: opacity 0.3s; }
        .hero-module:hover .mod-glow { opacity: 1; }
        .desc-panel { transform: translateY(100%); opacity: 0; transition: transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s ease; }
        .desc-panel.active { transform: translateY(0); opacity: 1; }
        .hero-logo-glow { animation: logoPulse 4s ease-in-out infinite; }
        @keyframes logoPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .hero-bg-grid {
          background-image: linear-gradient(rgba(0,170,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,170,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .section-divider { background: linear-gradient(90deg, transparent, rgba(0,170,255,0.15), transparent); height: 1px; }
      `}</style>

      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, #0d1a2e 0%, #0a0e14 60%)' }} />
        <div className="absolute inset-0 hero-bg-grid" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] hero-logo-glow pointer-events-none"
          style={{ background: 'rgba(0,170,255,0.12)' }} />

        {/* Logo + Branding */}
        <div className="relative z-10 flex flex-col items-center text-center px-4" style={{ marginTop: '-4vh' }}>
          <img src="/logos/civilCorelogo.png" alt="CivilCore"
            className="w-28 h-28 md:w-36 md:h-36 object-contain mb-6"
            style={{ filter: 'drop-shadow(0 0 40px rgba(0,170,255,0.3))' }} />
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase mb-4"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            <span style={{ color: '#e8f4fd' }}>CIVIL</span>
            <span style={{ color: '#00dce5' }}>CORE</span>
          </h1>
          <p className="text-sm md:text-base tracking-[0.35em] uppercase font-semibold"
            style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>
            DISEÑA. ANALIZA. OPTIMIZA. CONSTRUYE.
          </p>
        </div>

        {/* 7 Module Cards — bottom row */}
        <div className="absolute bottom-20 left-0 right-0 z-10 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {MODULOS_HERO.map((m, i) => (
              <Link key={m.id} to={m.path}
                className="hero-module flex flex-col items-center text-center p-3 md:p-4 border border-transparent hover:border-opacity-40 rounded-lg relative group"
                style={{ '--mod-color': m.color, background: 'rgba(10,14,20,0.6)', backdropFilter: 'blur(8px)',
                  borderColor: hoveredIdx === i ? m.color + '66' : 'transparent' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}>
                <div className="mod-glow absolute inset-0 rounded-lg pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${m.color}10 0%, transparent 70%)` }} />
                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-2 relative z-10">
                  <img src={m.logo} alt={m.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider relative z-10"
                  style={{ color: m.color, fontFamily: 'Hanken Grotesk, sans-serif' }}>
                  {m.name.replace('Civil', '')}
                </span>
                <span className="text-[8px] md:text-[9px] text-center mt-1 relative z-10 uppercase tracking-wider leading-tight"
                  style={{ color: '#6b8cae', fontFamily: 'Geist, monospace', fontWeight: 600 }}>
                  {m.id === 'flow' && 'REDES HIDRÁULICAS,\nSANITARIAS Y GAS'}
                  {m.id === 'structure' && 'DISEÑO ESTRUCTURAL\nY ANÁLISIS'}
                  {m.id === 'terrain' && 'TOPOGRAFÍA Y\nMOVIMIENTO DE TIERRAS'}
                  {m.id === 'bim' && 'INTEGRACIÓN\nBIM'}
                  {m.id === 'manage' && 'PRESUPUESTOS\nY GESTIÓN'}
                  {m.id === 'mep' && 'INSTALACIONES\nMEP'}
                  {m.id === 'roads' && 'VÍAS Y\nURBANISMO'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Description Panel — slides up on hover */}
        <div className={`desc-panel absolute bottom-0 left-0 right-0 z-20 border-t-2 ${hovered ? 'active' : ''}`}
          style={{ background: 'rgba(10,14,20,0.95)', backdropFilter: 'blur(16px)',
            borderColor: hovered ? hovered.color : 'transparent', minHeight: 120 }}>
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5 flex flex-col md:flex-row gap-6 items-start">
            {hovered ? (
              <>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-12 h-12 border rounded-lg flex items-center justify-center"
                    style={{ borderColor: hovered.color + '44', background: hovered.color + '0a' }}>
                    <img src={hovered.logo} alt={hovered.name} className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: hovered.color, fontFamily: 'Hanken Grotesk, sans-serif' }}>{hovered.name}</h3>
                    <p className="text-xs uppercase tracking-widest" style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>
                      {hovered.id === 'flow' && 'Redes Hidráulicas, Sanitarias y Gas'}
                      {hovered.id === 'structure' && 'Diseño Estructural y Análisis'}
                      {hovered.id === 'terrain' && 'Topografía y Movimiento de Tierras'}
                      {hovered.id === 'bim' && 'Integración BIM'}
                      {hovered.id === 'manage' && 'Presupuestos y Gestión'}
                      {hovered.id === 'mep' && 'Instalaciones MEP'}
                      {hovered.id === 'roads' && 'Vías y Urbanismo'}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: '#8a9bb0' }}>{hovered.desc}</p>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {hovered.cats.map(c => (
                    <span key={c} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 border rounded"
                      style={{ borderColor: hovered.color + '33', color: hovered.color, fontFamily: 'Geist, monospace', fontWeight: 600 }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: hovered.color }} />
                      {c}
                    </span>
                  ))}
                </div>
              </>
            ) : <div className="py-2" />}
          </div>
        </div>
      </section>

      {/* ===== 4 PILLARS ===== */}
      <section className="border-y border-outline-variant py-6 px-6 lg:px-8" style={{ background: '#0d1117' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {PILLARS.map((p, i) => (
            <React.Fragment key={p.icon}>
              <div className="flex items-center gap-4 flex-1 min-w-[180px]">
                <span className="material-symbols-outlined text-2xl" style={{ color: '#00dce5', fontVariationSettings: "'FILL' 0" }}>{p.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest whitespace-pre-line" style={{ color: '#e8f4fd', fontFamily: 'Geist, monospace' }}>{p.title}</span>
              </div>
              {i < PILLARS.length - 1 && <div className="hidden md:block w-px h-10 bg-outline-variant" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ===== POR QUÉ CIVILCORE ===== */}
      <section className="py-20 px-6 lg:px-8" style={{ background: '#0a0e14' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-outline-variant flex-grow" />
            <h2 className="text-xl font-semibold uppercase tracking-widest px-4" style={{ color: '#e8f4fd', fontFamily: 'Hanken Grotesk, sans-serif' }}>¿Por qué CivilCore?</h2>
            <div className="h-px bg-outline-variant flex-grow" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'speed', title: 'VELOCIDAD', desc: 'De los datos del proyecto a la memoria de cálculo en minutos, no en horas. Cálculos en tiempo real con retroalimentación instantánea.' },
              { icon: 'verified', title: 'PRECISIÓN NORMATIVA', desc: 'Verificación automática contra NTC, RAS, NFPA y normativas locales. Reducción de errores humanos al 0%.' },
              { icon: 'hub', title: 'INTEGRACIÓN TOTAL', desc: 'Todos los módulos comparten un mismo modelo de datos. Cambios en topografía se reflejan en estructura, redes y presupuesto.' },
            ].map(f => (
              <div key={f.icon} className="border border-outline-variant p-8 hover:border-primary/30 transition-all group"
                style={{ background: '#111317' }}>
                <span className="material-symbols-outlined text-3xl mb-4 block group-hover:text-primary transition-colors" style={{ color: '#00dce5' }}>{f.icon}</span>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#e8f4fd', fontFamily: 'Hanken Grotesk, sans-serif' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b8cae' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== MÓDULOS DETALLADOS ===== */}
      <section id="modulos" className="py-20 px-6 lg:px-8" style={{ background: '#0d1117' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-outline-variant flex-grow" />
            <h2 className="text-xl font-semibold uppercase tracking-widest px-4" style={{ color: '#e8f4fd', fontFamily: 'Hanken Grotesk, sans-serif' }}>Módulos Core</h2>
            <div className="h-px bg-outline-variant flex-grow" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULOS_HERO.map(m => (
              <Link key={m.id} to={m.path}
                className="border border-outline-variant p-6 flex flex-col items-center text-center hover:border-opacity-50 transition-all group relative overflow-hidden"
                style={{ background: '#111317' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${m.color}08 0%, transparent 70%)` }} />
                <div className="w-20 h-20 mb-4 border border-outline-variant flex items-center justify-center relative z-10 group-hover:border-opacity-50 transition-colors"
                  style={{ background: '#0a0e14' }}>
                  <img src={m.logo} alt={m.name} className="h-12 w-12 object-contain" />
                </div>
                <h3 className="text-base font-bold mb-1 relative z-10" style={{ color: m.color, fontFamily: 'Hanken Grotesk, sans-serif' }}>{m.name}</h3>
                <p className="text-[10px] uppercase tracking-widest relative z-10 leading-tight" style={{ color: '#6b8cae', fontFamily: 'Geist, monospace', fontWeight: 600 }}>
                  {m.id === 'flow' && 'REDES HIDRÁULICAS, SANITARIAS Y GAS'}
                  {m.id === 'structure' && 'DISEÑO ESTRUCTURAL Y ANÁLISIS'}
                  {m.id === 'terrain' && 'TOPOGRAFÍA Y MOVIMIENTO DE TIERRAS'}
                  {m.id === 'bim' && 'INTEGRACIÓN BIM'}
                  {m.id === 'manage' && 'PRESUPUESTOS Y GESTIÓN'}
                  {m.id === 'mep' && 'INSTALACIONES MEP'}
                  {m.id === 'roads' && 'VÍAS Y URBANISMO'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 lg:px-8" style={{ background: '#0a0e14' }}>
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold uppercase" style={{ color: '#e8f4fd', fontFamily: 'Hanken Grotesk, sans-serif' }}>
            ¿Listo para elaborar sus<br />
            <span style={{ color: '#00dce5' }}>memorias de cálculo?</span>
          </h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: '#6b8cae' }}>
            CivilCore — de los datos del proyecto a la memoria de cálculo exportable, con verificación normativa automática.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link to="/dashboard" className="bg-primary text-on-primary px-10 py-4 uppercase text-[11px] tracking-[0.1em] font-bold hover:bg-primary-container transition-all"
              style={{ fontFamily: 'Geist, monospace', boxShadow: '0 0 20px rgba(0,245,255,0.3)' }}>
              EMPEZAR AHORA
            </Link>
            <Link to="/docs" className="border border-outline-variant px-10 py-4 uppercase text-[11px] tracking-[0.1em] font-bold hover:border-primary hover:text-primary transition-all"
              style={{ fontFamily: 'Geist, monospace', color: '#6b8cae' }}>
              DOCUMENTACIÓN TÉCNICA
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-outline-variant" style={{ background: '#0a0e14' }}>
        <div className="flex flex-col md:flex-row justify-between items-center py-8 px-6 lg:px-8 gap-4 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logos/civilCorelogo.png" alt="CivilCore" className="h-7 w-7 object-contain" />
              <span className="text-lg font-bold uppercase" style={{ color: '#3a494a', fontFamily: 'Hanken Grotesk, sans-serif' }}>CivilCore</span>
            </Link>
            <nav className="flex gap-6">
              <Link to="/docs" className="uppercase tracking-widest transition-colors hover:text-on-surface" style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Geist, monospace', color: '#3a494a' }}>Documentación</Link>
              <Link to="/pricing" className="uppercase tracking-widest transition-colors hover:text-on-surface" style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Geist, monospace', color: '#3a494a' }}>Precios</Link>
              <span className="uppercase tracking-widest cursor-pointer transition-colors hover:text-on-surface" style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Geist, monospace', color: '#3a494a' }}>Contacto Técnico</span>
            </nav>
          </div>
          <div style={{ color: '#3a494a', fontSize: 12 }}>
            © 2026 CivilCore. Ingeniería de Precisión Geoespacial.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
