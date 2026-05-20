import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const G = `
  :root { --primary-cyan: #00f5ff; }
  .tech-grid {
    background-image: linear-gradient(to right, rgba(0, 245, 255, 0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0, 245, 255, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .glow-border { box-shadow: 0 0 10px rgba(0, 245, 255, 0.1); }
  .glow-border:hover { box-shadow: 0 0 15px rgba(0, 245, 255, 0.3); border-color: #00f5ff; }
  .active-nav-glow { box-shadow: 0 2px 4px -1px rgba(0, 245, 255, 0.4); }
  .cursor-blink { animation: pulse-cursor 1s step-end infinite; }
  @keyframes pulse-cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .carousel-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #3a494a; cursor: pointer; transition: all .2s; }
  .carousel-dot.act { background: #00f5ff; border-color: #00f5ff; }
  .norma-item { cursor: pointer; transition: background .15s; }
  .norma-item:hover { background: #1a1c20; }
  .norma-item.sel { background: #1a1c20; border-left-color: #00f5ff; }
  .hero-text { text-align: justify; text-justify: inter-word; }
`;

const modulos = [
  {ico:'ac_unit',color:'#3B82F6',title:'AGUA FRÍA',desc:'Cálculo de redes de distribución por Hazen-Williams. Verificación de velocidad (0.6–3.0 m/s), presión mínima por aparato y pérdida por fricción. Coeficiente C=150 para PVC.'},
  {ico:'local_fire_department',color:'#F04545',title:'AGUA CALIENTE',desc:'Diseño de redes CPVC RDE 11, cobre y PP-R. Cálculo de recirculación cuando L>15m, pérdida de calor y selección de calentadores a gas (HACEB, BOSCH, RHEEM, RINNAI).'},
  {ico:'plumbing',color:'#F5A623',title:'SANITARIA',desc:'Modelado de bajantes por maning (n=0.009). Cálculo de diámetros económicos, número de Froude, fuerza tractiva (mín 0.10 kg/m²) y verificación de secciones parciales.'},
  {ico:'water',color:'#22D3EE',title:'AGUAS LLUVIAS',desc:'Cálculo de caudales por Método Racional (Q=C·I·A/360). Coeficientes de escorrentía por tipo de superficie, diseño de bajantes y canales de cubierta según RAS 2000.'},
  {ico:'air',color:'#A3E635',title:'VENTILACIÓN',desc:'Cálculo de diámetros de ventilación según NTC 1500 §9. Diámetro mínimo 1½". Caudal de aire requerido, entrada de aire y mantenimiento de sellos hidráulicos.'},
  {ico:'gas_meter',color:'#A855F7',title:'RED DE GAS',desc:'Diseño de redes por método Renouard (NTC 3728). Pérdida máx 9.81 mbar, velocidad máx 10 m/s. Factor de simultaneidad por N° aparatos. Materiales: PE, cobre, acero.'},
  {ico:'speed',color:'#0ECC7A',title:'EQUIPO PRESIÓN',desc:'Diseño de sistemas hidroneumáticos con bomba y recipiente vejiga. Cálculo de Q medio, Q bombeo, presiones min/max, NPSH y potencia de bomba. Eficiencia 60%.'},
  {ico:'arrow_upward',color:'#0ECC7A',title:'BOMBA AR',desc:'Bombas de aguas residuales para niveles por debajo de la red pública. Cálculo de altura manométrica total, potencia y verificación NPSH disponible vs requerido.'},
  {ico:'local_fire_department',color:'#ffb4ab',title:'CONTRA INCENDIO',desc:'Diseño según NSR-10 Título J y NFPA 13:2022. Cálculo de densidad, área de operación, rociadores y diámetros para redes de acero SCH 40, SCH 10 y CPVC-CI.'},
];

const normasData = [
  {n:'01',c:'#3B82F6',id:'ntc1500',nm:'NTC 1500:2020',t:'CÓDIGO FONTANERÍA',short:'UC, UD, presiones, velocidades, diámetros mínimos, pendientes, ventilación.',
   detail:['Unidades de Consumo (UC) y Unidades de Descarga (UD) por tipo de aparato sanitario.','Presiones mínimas por aparato: Lavamanos 0.51, Ducha 1.02, Inodoro tanque 0.71, Fluxómetro 0.71 m.c.a.','Velocidades en tuberías: mín 0.60 m/s (autolimpieza), máx 3.00 m/s (recomendada), 5.00 m/s (absoluta).','Diámetros mínimos de suministro y desagüe por tipo de aparato.','Pendientes mínimas sanitarias: 2% para Ø2-6", 0.5% para Ø8"+.','Fuerza tractiva mínima: 0.10 kg/m². Recomendado: 0.15 kg/m².','Diámetro mínimo de ventilación: 1½" (38 mm).','Cálculo de bajantes sanitarios por método de Hunter modificado.']},
  {n:'02',c:'#22D3EE',id:'ras2000',nm:'RAS 2000',t:'AGUA Y SANEAMIENTO',short:'Dotaciones por uso, coeficientes maning, método racional IDF, escorrentía, tanques.',
   detail:['Dotaciones: Residencial 150–200, Hotel 250–400, Comercial 80–120, Institucional 100–150 L/hab/día.','Coeficientes maning: PVC n=0.009, Concreto n=0.013, Hierro n=0.013, Acero n=0.015.','Método Racional: Q = C·I·A/360 para aguas lluvias.','Coeficientes de escorrentía C: Cubierta impermeable 0.95-1.00, Jardín 0.10-0.25, Pavimento 0.70-0.95.','Períodos de retorno: Residencial 5-10, Comercial 10-25, Crítico 25-100 años.','Presión estática máxima en redes: 50 m.c.a. Presión dinámica mínima: 3.00 m.c.a.','Volumen de tanques: V = Población × Dotación × Factor reserva.']},
  {n:'03',c:'#A855F7',id:'ntc3728',nm:'NTC 3728',t:'GAS COMBUSTIBLE',short:'Renouard baja presión, caudales por aparato, factor simultaneidad, materiales.',
   detail:['Método Renouard: ΔP = 48620·K·L·Q^1.82 / (Pat·D^4.82).','Límite ΔP ≤ 9.81 mbar (1 m.c.a.). Velocidad máx 10 m/s.','Presión mín acometida: 17 mbar. Máx interior: 25 mbar.','Factor simultaneidad: 1-2 ap fs=1.0, 3-5 fs=0.8, 6-10 fs=0.7, 11-20 fs=0.6, >20 fs=0.5.','Caudales: Estufa 4Q 1.35, Calentador 6-26 LPM, Secadora 0.54-0.81, Jacuzzi 3.38 m³/h.','Materiales: PE K=49, Acero Galv K=57.5, Cobre K=54.2.','Accesorios Le: Codo 90° K=30, Tee K=20, Válvula bola K=8.']},
  {n:'04',c:'#ffb4ab',id:'nsr10',nm:'NSR-10 TÍTULO J + NFPA 13',t:'CONTRA INCENDIO',short:'Rociadores, densidad, área de operación, bombas CI, gabinetes, reserva de agua.',
   detail:['Clasificación de edificaciones según grupo de ocupación y riesgo NSR-10 J.','Densidad de diseño y área de operación según NFPA 13:2022.','Rociadores: cobertura, factor K, temperatura de activación.','Tuberías CI: Acero SCH 40, SCH 10, CPVC-CI. Hazen-Williams C=120.','Sistemas de bombeo: bombas jockey y principales.','Reserva de agua exclusiva para sistema contra incendio.','Gabinetes clase I, II, III según NSR-10 J.4.3.']},
  {n:'05',c:'#0ECC7A',id:'ntc382',nm:'NTC 382',t:'PVC PRESIÓN',short:'Tubería PVC a presión, RDE, diámetros, espesores, presión de trabajo.',
   detail:['Especificaciones para tubería de PVC rígido a presión para conducción de agua.','Clasificación por RDE (Relación Dimensión Estándar): RDE 13.5, 21, 26.','Diámetros: ½" a 12" con presión de trabajo hasta 25 kg/cm².','Uniones: soldadura solvente, unión mecánica, brida.','Aplicación en redes de agua fría a presión.']},
  {n:'06',c:'#F5A623',id:'ntc1087',nm:'NTC 1087',t:'PVC SANITARIO',short:'Tubería PVC para alcantarillado sanitario y aguas lluvias por gravedad.',
   detail:['Especificaciones para tubería PVC de pared estructural para redes de alcantarillado.','Diámetros nominales: 2" a 24".','Uniones: espiga-campana con empaque de caucho.','Aplicación en redes sanitarias y aguas lluvias a gravedad.']},
  {n:'07',c:'#A3E635',id:'ntc3733',nm:'NTC 3733',t:'INSTALACIONES GAS',short:'Requisitos para instalaciones residenciales de gas combustible.',
   detail:['Complementa NTC 3728 con requisitos específicos para instalaciones residenciales.','Distancia de seguridad entre tubería de gas y otras instalaciones.','Ventilación de recintos con artefactos a gas.','Protección contra corrosión de tuberías metálicas.']},
];

const metodosCarousel = [
  {id:'hw',c:'#3B82F6',cat:'AGUA FRÍA / CALIENTE / RCI',nombre:'Hazen-Williams',
   desc:'Ecuación empírica para flujo de agua en tuberías a presión. Ampliamente usada en distribución de agua potable, redes contra incendio y sistemas de bombeo. Relaciona caudal, diámetro, longitud y coeficiente de rugosidad C.',
   aplica:'Redes de agua fría, caliente, contra incendio, equipos de presión y bombas.',
   norma:'NTC 1500 · NFPA 13 · RAS 2000 §B.6.4.2',
   coef:'C PVC=150, C PE=140, C Cobre=130, C Acero=120',ico:'ac_unit'},
  {id:'man',c:'#F5A623',cat:'SANITARIA / VENTILACIÓN / LLUVIAS',nombre:'maning',
   desc:'Ecuación para flujo a superficie libre en canales abiertos y tuberías parcialmente llenas. Relaciona velocidad, radio hidráulico, pendiente y coeficiente de rugosidad n. Fundamental para el diseño de redes por gravedad.',
   aplica:'Bajantes sanitarios, colectores, canales de cubierta, tuberías de ventilación, aguas lluvias.',
   norma:'NTC 1500 §8 · RAS 2000',
   coef:'n PVC=0.009, n Concreto=0.013, n Hierro=0.013, n Acero=0.015',ico:'plumbing'},
  {id:'ren',c:'#A855F7',cat:'GAS COMBUSTIBLE',nombre:'Renouard',
   desc:'Ecuación específica para el cálculo de pérdidas de presión en redes de gas de baja presión. Considera propiedades del gas, presión atmosférica local y factor de fricción del material. Verifica ΔP ≤ 9.81 mbar y V ≤ 10 m/s.',
   aplica:'Redes de gas natural y GLP en edificaciones residenciales, comerciales e industriales.',
   norma:'NTC 3728',
   coef:'K PE=49, K Acero Galv=57.5, K Cobre=54.2',ico:'gas_meter'},
  {id:'hunt',c:'#22D3EE',cat:'SIMULTANEIDAD',nombre:'Método de Hunter',
   desc:'Método probabilístico para estimar el caudal máximo probable en sistemas con múltiples aparatos sanitarios. Basado en la probabilidad de uso simultáneo según el número de conexiones. Usa el factor K = 1/√(N−1).',
   aplica:'Dimensionamiento de redes de agua fría, caliente y desagües sanitarios.',
   norma:'NTC 1500 · ASHRAE',
   coef:'K = 1/√(N−1), Q_UD = 0.1163·UD^0.6875 (UD<240)',ico:'group'},
  {id:'rac',c:'#22D3EE',cat:'AGUAS LLUVIAS',nombre:'Método Racional',
   desc:'Método para calcular el caudal pico de escorrentía pluvial en función del área de drenaje, intensidad de lluvia y coeficiente de escorrentía de la superficie. Q = C·I·A/360.',
   aplica:'Bajantes de aguas lluvias, canales de cubierta, sistemas de drenaje pluvial urbano.',
   norma:'RAS 2000 · Curvas IDF (IDEAM/CDMB)',
   coef:'C cubierta=0.95, C jardín=0.15, C pavimento=0.85, I diseño=100 mm/h',ico:'rainy'},
  {id:'dw',c:'#0ECC7A',cat:'PÉRDIDAS UNIVERSALES',nombre:'Darcy-Weisbach / Colebrook-White',
   desc:'Ecuación universal para pérdidas de carga por fricción en tuberías. Aplicable a cualquier fluido y régimen mediante el factor de fricción f calculado con Colebrook-White. Complemento riguroso a Hazen-Williams.',
   aplica:'Verificación de pérdidas en cualquier tipo de red hidráulica. Válido para agua, gas y otros fluidos.',
   norma:'Mecánica de Fluidos · ASHRAE',
   coef:'ε PVC=0.0015mm, ε Acero=0.046mm, ε Concreto=0.25mm',ico:'science'},
  {id:'fr',c:'#F5A623',cat:'RÉGIMEN DE FLUJO',nombre:'Número de Froude',
   desc:'Número adimensional que relaciona fuerzas de inercia y gravedad. Determina el régimen de flujo: subcrítico (Fr<1, lento), crítico (Fr≈1) o supercrítico (Fr>1, rápido). Esencial para diseño de canales y bajantes.',
   aplica:'Clasificación de flujo en bajantes sanitarios, canales de aguas lluvias y colectores.',
   norma:'NTC 1500 · RAS 2000',
   coef:'Fr = V/√(g·DH), g=9.81 m/s²',ico:'straighten'},
  {id:'ft',c:'#F5A623',cat:'AUTOLIMPIEZA',nombre:'Fuerza Tractiva',
   desc:'Fuerza que el fluido ejerce sobre el fondo del canal, responsable del arrastre de partículas sedimentadas. Debe ser suficiente para garantizar la autolimpieza de la tubería evitando obstrucciones.',
   aplica:'Verificación de autolimpieza en redes sanitarias y de aguas lluvias.',
   norma:'NTC 1500 (τ ≥ 0.10 kg/m², recomendado 0.15 kg/m²)',
   coef:'τ₀ = 1000·Rh·S [kg/m²]',ico:'cleaning'},
  {id:'bom',c:'#0ECC7A',cat:'BOMBAS Y EQUIPOS',nombre:'Cálculo de Bombas y NPSH',
   desc:'Dimensionamiento de equipos de bombeo: potencia hidráulica (Ph=ρ·g·Q·Hm), potencia en eje (Pe=Ph/η), altura manométrica total y verificación de NPSH disponible contra cavitación.',
   aplica:'Bombas de agua potable, aguas residuales, contra incendio y equipos de presión.',
   norma:'NTC 1500 §8.5 · RAS 2000 Título D',
   coef:'HP = Q·Hm/(76·η), η típica=60-70%',ico:'precision_manufacturing'},
  {id:'baj',c:'#A3E635',cat:'CAPACIDAD DE BAJANTES',nombre:'Velocidad Terminal y Capacidad',
   desc:'Cálculo de la velocidad terminal en bajantes (Vt=2.76·D^0.4) y la longitud necesaria para alcanzarla (Lt=0.17·Vt²). La capacidad del bajante se calcula con maning para llenado parcial r=7/24.',
   aplica:'Dimensionamiento de bajantes sanitarios y de aguas lluvias en edificaciones en altura.',
   norma:'NTC 1500 §8',
   coef:'Qmáx=1.754·r^(5/3)·D^(8/3), r=7/24, Vt=2.76·D^0.4',ico:'vertical_align_center'},
];

const flujo = [
  ['01','DATOS PROYECTO','Nombre, ubicación, uso, empresa prestadora'],
  ['02','NIVELES NPT','Generador de sótanos, pisos, cubierta'],
  ['03','MATERIALES','PVC, CPVC, cobre, PE, acero por red'],
  ['04','APARATOS','UC, UD, Q gas según NTC 1500/3728'],
  ['05','CÁLCULO','Hazen-Williams, maning, Renouard'],
  ['06','GAS','Tramos Renouard, accesorios, Le'],
  ['07','CALENTADOR','HACEB, BOSCH, RHEEM, RINNAI'],
  ['08','VALIDACIÓN','Verificación automática de normas'],
  ['09','EXCEL SAN','Exportar Red Sanitaria .xlsx','#F5A623'],
  ['10','EXCEL HID','Exportar Red Hidráulica .xlsx','#3B82F6'],
];

function LandingPage() {
  const gridRef = useRef(null);
  const [selNorma, setSelNorma] = useState('ntc1500');
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const grid = gridRef.current;
      if (!grid) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      grid.style.backgroundPosition = `${x * 10}px ${y * 10}px`;
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const goToSlide = useCallback((idx) => setCarouselIdx(idx), []);

  const activeNorma = normasData.find(n => n.id === selNorma);
  const currentMethod = metodosCarousel[carouselIdx];

  return (
    <>
      <style>{G}</style>
      <div className="landing-page selection:bg-primary-container selection:text-on-primary-container"
        style={{ background: '#111317', color: '#e2e2e8', minHeight: '100vh', overflowX: 'hidden' }}
      >
        <Navbar />

        <main className="pt-16">
          {/* HERO */}
          <section className="relative min-h-[800px] flex items-center tech-grid" ref={gridRef}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111317]"></div>
            <div className="container mx-auto px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 space-y-6">
                <h1 className="font-bold text-[56px] leading-[1.08] text-primary max-w-xl" style={{fontFamily:'Hanken Grotesk,sans-serif'}}>
                  Diseño Hidrosanitario de Precisión
                </h1>
                <p className="text-base text-on-surface-variant max-w-lg leading-relaxed hero-text">
                  Aplicativo web para el cálculo completo de redes hidrosanitarias: Agua Fría, Agua Caliente, Sanitaria, Aguas Lluvias, Ventilación, Gas Combustible y Contra Incendio. Basado en NTC 1500, RAS 2000, NTC 3728 y NSR-10. Cada módulo de cálculo verifica automáticamente los parámetros contra la normatividad colombiana vigente, garantizando memorias de cálculo conformes sin esfuerzo manual.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link to="/dashboard" className="bg-primary text-on-primary px-8 py-4 uppercase text-[11px] tracking-[0.1em] font-bold hover:bg-primary-container transition-all glow-border" style={{fontFamily:'Geist,monospace'}}>
                    Iniciar Proyecto
                  </Link>
                  <Link to="/docs" className="border border-primary text-primary px-8 py-4 uppercase text-[11px] tracking-[0.1em] font-bold hover:bg-primary/10 transition-all" style={{fontFamily:'Geist,monospace'}}>
                    Ver Documentación
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="aspect-square border border-outline-variant p-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-900/40 via-transparent to-cyan-900/20 mix-blend-screen"></div>
                  <div className="relative z-10 border border-primary/30 h-full w-full flex items-center justify-center">
                    <div className="p-8 backdrop-blur-md border border-outline-variant space-y-4 max-w-xs" style={{background:'rgba(17,19,23,0.8)'}}>
                      <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                        <span className="text-[10px] text-outline" style={{fontFamily:'Geist,monospace'}}>CIVIL_FLOW_CHECK</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-error"></div>
                          <div className="w-2 h-2 rounded-full bg-secondary"></div>
                        </div>
                      </div>
                      <div className="space-y-1" style={{fontSize:'13px',fontFamily:'Geist,monospace',color:'#00f5ff'}}>
                        <p>&gt; INIT SYSTEM_CHECK...</p>
                        <p>&gt; AGUA_FRÍA: <span style={{color:'#3B82F6'}}>Hazen-Williams OK</span></p>
                        <p>&gt; SANITARIA: <span style={{color:'#F5A623'}}>maning n=0.009</span></p>
                        <p>&gt; GAS_RED: <span style={{color:'#A855F7'}}>Renouard READY</span></p>
                        <p>&gt; LLUVIAS: <span style={{color:'#22D3EE'}}>Método Racional OK</span></p>
                        <p>&gt; CONTRA INCENDIO: <span style={{color:'#ffb4ab'}}>NSR-10 + NFPA13 LOADED</span></p>
                        <p className="cursor-blink">_</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary"></div>
                </div>
              </div>
            </div>
          </section>

          {/* MÓDULOS */}
          <section id="modulos" className="py-24 border-y border-outline-variant" style={{background:'#0c0e12'}}>
            <div className="container mx-auto px-6 lg:px-8">
              <div className="flex items-center mb-16">
                <div className="inline-block px-4 py-1.5 border border-primary text-primary" style={{fontSize:13,fontWeight:700,fontFamily:'Geist,monospace',letterSpacing:'0.08em'}}>MÓDULOS DE CÁLCULO</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {modulos.map(m => (
                  <div key={m.title} className="border border-outline-variant hover:border-primary transition-all group" style={{background:'#111317',padding:32}}>
                    <div className="w-12 h-12 flex items-center justify-center mb-6 transition-colors" style={{border:`1px solid ${m.color}33`}}>
                      <span className="material-symbols-outlined" style={{color:m.color,fontSize:30}}>{m.ico}</span>
                    </div>
                    <h3 className="mb-4 uppercase" style={{fontSize:18,fontWeight:600,fontFamily:'Hanken Grotesk,sans-serif',color:'#e9feff'}}>{m.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* NORMATIVIDAD — Master-Detail */}
          <section id="normas" className="py-24">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="mb-12">
                <div className="inline-block px-4 py-1.5 border border-primary text-primary" style={{fontSize:13,fontWeight:700,fontFamily:'Geist,monospace',letterSpacing:'0.08em'}}>NORMATIVIDAD COLOMBIANA</div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: list of normas */}
                <div className="border border-outline-variant" style={{background:'#1e2024'}}>
                  <div className="px-5 py-3 border-b border-outline-variant text-outline tracking-widest uppercase" style={{fontSize:10,fontWeight:700,fontFamily:'Geist,monospace'}}>
                    Normas y reglamentos
                  </div>
                  <div>
                    {normasData.map(x => (
                      <div key={x.id}
                        onClick={() => setSelNorma(x.id)}
                        className={`flex gap-4 p-4 border-l-2 norma-item ${selNorma === x.id ? 'sel' : ''}`}
                        style={{
                          background: selNorma === x.id ? '#1a1c20' : '#111317',
                          borderLeftColor: selNorma === x.id ? x.c : 'transparent',
                        }}>
                        <div className="text-lg flex-shrink-0" style={{fontFamily:'Geist,monospace',color:x.c}}>{x.n}</div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-outline tracking-widest" style={{fontFamily:'Geist,monospace'}}>{x.t}</span>
                          </div>
                          <div style={{fontFamily:'Geist,monospace',color:'#e2e2e8',fontSize:13}}>{x.nm}</div>
                          <div className="text-[11px] text-on-surface-variant leading-relaxed">{x.short}</div>
                        </div>
                        <span className="material-symbols-outlined text-outline text-sm flex-shrink-0 mt-1">arrow_forward</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right: detail of selected norma */}
                <div className="border border-outline-variant p-8" style={{background:'#1e2024'}}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center border" style={{borderColor:activeNorma.c+'44',background:activeNorma.c+'11'}}>
                      <span className="text-2xl" style={{fontFamily:'Geist,monospace',color:activeNorma.c}}>{activeNorma.n}</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-outline tracking-widest uppercase" style={{fontFamily:'Geist,monospace'}}>{activeNorma.t}</div>
                      <h3 className="text-lg font-bold" style={{fontFamily:'Hanken Grotesk,sans-serif',color:activeNorma.c}}>{activeNorma.nm}</h3>
                    </div>
                  </div>
                  <p className="text-[13px] text-on-surface-variant mb-8 pb-6 border-b border-outline-variant">{activeNorma.short}</p>
                  <div className="space-y-3">
                    {activeNorma.detail.map((d,i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{background:activeNorma.c}}></div>
                        <span className="text-[13px] text-on-surface-variant leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MÉTODOS — Carrusel */}
          <section id="metodos" className="py-24 border-y border-outline-variant" style={{background:'#0c0e12'}}>
            <div className="container mx-auto px-6 lg:px-8">
              <div className="space-y-4 mb-12">
                <div className="inline-block px-4 py-1.5 border border-primary text-primary" style={{fontSize:13,fontWeight:700,fontFamily:'Geist,monospace',letterSpacing:'0.08em'}}>MÉTODOS APLICADOS</div>
                
              </div>

              {/* Single method view */}
              <div className="relative border border-outline-variant p-8 lg:p-12" style={{background:'#111317'}}>
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                  <div className="flex-shrink-0 w-20 h-20 border flex items-center justify-center" style={{borderColor:currentMethod.c+'44',background:currentMethod.c+'08'}}>
                    <span className="material-symbols-outlined" style={{fontSize:36,color:currentMethod.c}}>{currentMethod.ico}</span>
                  </div>
                  <div className="flex-1 space-y-5">
                    <div>
                      <div className="tracking-widest text-[10px] font-bold mb-1" style={{fontFamily:'Geist,monospace',color:currentMethod.c}}>
                        {currentMethod.cat}
                      </div>
                      <h3 style={{fontSize:28,fontWeight:700,fontFamily:'Hanken Grotesk,sans-serif',color:'#e9feff'}}>
                        {currentMethod.nombre}
                      </h3>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{currentMethod.desc}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm flex-shrink-0" style={{color:currentMethod.c}}>check_circle</span>
                        <span className="text-[13px] text-on-surface-variant"><strong className="text-on-surface">Aplica a:</strong> {currentMethod.aplica}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm flex-shrink-0" style={{color:currentMethod.c}}>menu_book</span>
                        <span className="text-[13px] text-on-surface-variant"><strong className="text-on-surface">Norma:</strong> {currentMethod.norma}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm flex-shrink-0" style={{color:currentMethod.c}}>tune</span>
                        <span className="text-[13px] text-on-surface-variant"><strong className="text-on-surface">Parámetros:</strong> {currentMethod.coef}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-outline-variant">
                  <button onClick={() => goToSlide((carouselIdx - 1 + metodosCarousel.length) % metodosCarousel.length)}
                    className="p-2 border border-outline-variant hover:border-primary transition-colors" style={{background:'transparent'}}>
                    <span className="material-symbols-outlined text-outline">chevron_left</span>
                  </button>
                  <div className="flex gap-3 items-center">
                    {metodosCarousel.map((m, i) => (
                      <div key={i} className={`carousel-dot ${i === carouselIdx ? 'act' : ''}`}
                        onClick={() => goToSlide(i)} title={m.nombre} />
                    ))}
                  </div>
                  <button onClick={() => goToSlide((carouselIdx + 1) % metodosCarousel.length)}
                    className="p-2 border border-outline-variant hover:border-primary transition-colors" style={{background:'transparent'}}>
                    <span className="material-symbols-outlined text-outline">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FLUJO DE TRABAJO */}
          <section className="py-24 border-y border-outline-variant" style={{background:'#0c0e12'}}>
            <div className="container mx-auto px-6 lg:px-8">
              <div className="flex items-center justify-between mb-16">
                <div className="inline-block px-4 py-1.5 border border-primary text-primary" style={{fontSize:13,fontWeight:700,fontFamily:'Geist,monospace',letterSpacing:'0.08em'}}>FLUJO DE TRABAJO</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {flujo.map(([n,t,s,c]) => (
                  <div key={n} className="border border-outline-variant p-5 text-center" style={{background:'#111317'}}>
                    <div className="font-bold mb-2 text-2xl" style={{fontFamily:'Geist,monospace',color:c||'#e9feff'}}>{n}</div>
                    <div className="tracking-widest" style={{fontSize:11,fontWeight:700,fontFamily:'Geist,monospace',color:'#e2e2e8'}}>{t}</div>
                    <div className="text-[12px] text-on-surface-variant mt-2">{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section id="documentacion" className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary opacity-[0.02]"></div>
            <div className="container mx-auto px-6 lg:px-8 relative">
              <div className="border border-primary/30 p-12 md:p-24 text-center space-y-8 backdrop-blur-sm" style={{background:'rgba(17,19,23,0.5)'}}>
                <h2 className="text-primary uppercase max-w-2xl mx-auto" style={{fontSize:32,fontWeight:700,fontFamily:'Hanken Grotesk,sans-serif'}}>
                  ¿Listo para elaborar sus memorias de cálculo?
                </h2>
                <p className="text-base text-on-surface-variant max-w-xl mx-auto">
                  Civil Flow — de los datos del proyecto a la memoria de cálculo exportable, con verificación normativa automática.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                  <Link to="/dashboard" className="bg-primary text-on-primary px-12 py-5 uppercase tracking-widest text-lg font-extrabold hover:bg-primary-container transition-all glow-border" style={{fontFamily:'Geist,monospace'}}>
                    Empezar ahora
                  </Link>
                  <Link to="/docs" className="border border-outline text-on-surface-variant px-12 py-5 uppercase tracking-widest text-lg font-extrabold hover:bg-surface-container-highest transition-all" style={{fontFamily:'Geist,monospace'}}>
                    Documentación Técnica
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-outline-variant mt-24" style={{background:'#0c0e12'}}>
          <div className="flex flex-col md:flex-row justify-between items-center py-8 px-6 lg:px-8 gap-3 w-full mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <span className="text-2xl font-bold text-outline" style={{fontFamily:'Hanken Grotesk,sans-serif'}}>CIVIL FLOW</span>
              <nav className="flex gap-6">
                <Link to="/docs" className="text-outline uppercase tracking-widest transition-colors hover:text-on-surface" style={{fontSize:11,fontWeight:700,fontFamily:'Geist,monospace'}}>Documentación</Link>
                <Link to="/pricing" className="text-outline uppercase tracking-widest transition-colors hover:text-on-surface" style={{fontSize:11,fontWeight:700,fontFamily:'Geist,monospace'}}>Precios</Link>
                <a className="text-outline uppercase tracking-widest transition-colors hover:text-on-surface cursor-pointer" style={{fontSize:11,fontWeight:700,fontFamily:'Geist,monospace'}}>NTC 1500</a>
                <a className="text-outline uppercase tracking-widest transition-colors hover:text-on-surface cursor-pointer" style={{fontSize:11,fontWeight:700,fontFamily:'Geist,monospace'}}>Contacto Técnico</a>
              </nav>
            </div>
            <div className="text-outline text-sm">
              © 2026 KML Ingeniería. Ing. Camilo Cárdenas Chacón. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default LandingPage;
