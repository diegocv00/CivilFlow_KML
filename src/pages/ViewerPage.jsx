import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PdfViewer from '../components/PdfViewer';
import { usePlanos } from '../context/PlanosContext';
import DisenoUDPanel from '../components/UdDesignPanel';
import PanelValoresUD from '../components/UdValuesPanel';
import PanelBajantesLluvias from '../components/RainDownpipesPanel';
import PanelCanalesLluvias from '../components/RainChannelsPanel';

function ViewerInner() {
  const { planos, addPlanos, removePlano } = usePlanos();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDisenoUD, setShowDisenoUD] = useState(false);
  const [showValoresUD, setShowValoresUD] = useState(false);
  const [showBajantesLL, setShowBajantesLL] = useState(false);
  const [showCanalesLL, setShowCanalesLL] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const files = planos.map(p => ({ id: p.id, file: p.file }));

  const handleAddPlan = () => {
    fileRef.current?.click();
  };

  const handleFileInput = (e) => {
    addPlanos(e.target.files);
    e.target.value = '';
  };

  const handleRemovePlan = (idx) => {
    removePlano(planos[idx].id);
    if (activeIndex >= planos.length - 1) {
      setActiveIndex(Math.max(0, planos.length - 2));
    }
  };

  const handleSelectPlan = (idx) => {
    setActiveIndex(idx);
    setDropdownOpen(false);
  };

  if (planos.length === 0) {
    return (
      <div className="h-screen flex flex-col" style={{ background: '#0a0e14', color: '#e2e2e8' }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="text-5xl mb-4">📐</div>
            <div className="text-sm font-bold uppercase tracking-widest mb-2"
              style={{ color: '#e8f4fd', fontFamily: 'Geist, monospace' }}>
              No hay planos cargados
            </div>
            <div className="text-xs mb-6" style={{ color: '#6b8cae', fontFamily: 'Geist, monospace' }}>
              Sube planos PDF para comenzar a trabajar
            </div>
            <button onClick={() => navigate('/planos')}
              className="px-6 py-3 font-bold text-[11px] tracking-widest uppercase border rounded-lg transition-colors"
              style={{ background: 'rgba(0,220,229,0.08)', borderColor: '#00dce555', color: '#00dce5', fontFamily: 'Geist, monospace' }}>
              IR A CARGA DE PLANOS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0a0e14' }}>
      <input ref={fileRef} type="file" accept=".pdf" multiple style={{ display: 'none' }}
        onChange={handleFileInput} />

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <Navbar />
        <div style={{
          height: 36, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px',
          background: '#111317', borderBottom: '1px solid #3a494a', position: 'relative',
        }}>
          <span style={{ fontFamily: 'Geist, monospace', fontSize: 10, color: '#6b8cae', textTransform: 'uppercase', letterSpacing: 1 }}>
            Plano:
          </span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setDropdownOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', background: '#1e2024',
                border: '1px solid #3a494a', borderRadius: 3,
                color: '#e2e2e8', cursor: 'pointer',
                fontFamily: 'Geist, monospace', fontSize: 11,
              }}>
              <span style={{ color: '#00dce5' }}>📄</span>
              <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {planos[activeIndex]?.name || 'Seleccionar'}
              </span>
              <span style={{ fontSize: 8, color: '#6b8cae' }}>▼</span>
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                minWidth: 240, background: '#15171b', border: '1px solid #3a494a',
                borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                overflow: 'hidden', zIndex: 100,
              }}>
                {planos.map((p, i) => (
                  <div key={p.id}
                    onClick={() => handleSelectPlan(i)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', cursor: 'pointer',
                      background: i === activeIndex ? 'rgba(0,220,229,0.06)' : 'transparent',
                      borderLeft: i === activeIndex ? '3px solid #00dce5' : '3px solid transparent',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={(e) => { if (i !== activeIndex) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={(e) => { if (i !== activeIndex) e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#00dce5' }}>📄</span>
                      <span style={{
                        fontFamily: 'Geist, monospace', fontSize: 11, color: '#e2e2e8',
                        maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {p.name}
                      </span>
                    </div>
                    {i === activeIndex && (
                      <span style={{ fontFamily: 'Geist, monospace', fontSize: 9, color: '#00dce5' }}>●</span>
                    )}
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #3a494a', padding: '6px 12px', display: 'flex', gap: 8 }}>
                  <button onClick={handleAddPlan}
                    style={{
                      flex: 1, padding: '5px 8px', background: '#1e2024',
                      border: '1px dashed #3a494a', borderRadius: 3,
                      color: '#b9caca', cursor: 'pointer', fontSize: 10,
                      fontFamily: 'Geist, monospace', fontWeight: 600, textAlign: 'center',
                    }}>
                    + Agregar
                  </button>
                  <button onClick={() => navigate('/planos')}
                    style={{
                      padding: '5px 8px', background: '#1e2024',
                      border: '1px solid #3a494a', borderRadius: 3,
                      color: '#849495', cursor: 'pointer', fontSize: 10,
                      fontFamily: 'Geist, monospace', textAlign: 'center',
                    }}>
                    📐 Planos
                  </button>
                </div>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: 'Geist, monospace', fontSize: 9, color: '#6b8cae' }}>
            {activeIndex + 1} / {planos.length}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, paddingTop: 100, overflow: 'hidden', position: 'relative' }}
        onClick={() => setDropdownOpen(false)}>
        <PdfViewer
          files={files}
          activeIndex={activeIndex}
          onSelectPlan={handleSelectPlan}
          onAddPlan={handleAddPlan}
          onRemovePlan={handleRemovePlan}
          pisos={[]}
        />

        {/* Floating design panels */}
        {showDisenoUD && <DisenoUDPanel onClose={() => setShowDisenoUD(false)} />}
        {showValoresUD && <PanelValoresUD onClose={() => setShowValoresUD(false)} />}
        {showBajantesLL && <PanelBajantesLluvias onClose={() => setShowBajantesLL(false)} />}
        {showCanalesLL && <PanelCanalesLluvias onClose={() => setShowCanalesLL(false)} />}

        {/* Panel toggle buttons */}
        <div style={{
          position: 'absolute', bottom: 8, right: 8, zIndex: 60,
          display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%',
        }}>
          {!showDisenoUD && <MiniBtn onClick={() => setShowDisenoUD(true)}>📊 Diseño UD</MiniBtn>}
          {!showValoresUD && <MiniBtn onClick={() => setShowValoresUD(true)}>📊 UD base</MiniBtn>}
          {!showBajantesLL && <MiniBtn onClick={() => setShowBajantesLL(true)}>🌧️ Bajantes</MiniBtn>}
          {!showCanalesLL && <MiniBtn onClick={() => setShowCanalesLL(true)}>🌧️ Canales</MiniBtn>}
        </div>
      </div>
    </div>
  );
}

function MiniBtn({ onClick, children }) {
  return <button onClick={onClick}
    style={{
      padding: '5px 10px', background: 'rgba(24,26,30,0.92)', border: '1px solid #3a494a',
      borderRadius: 6, color: '#e2e2e8', fontSize: 11, cursor: 'pointer',
      fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 4,
      boxShadow: '0 4px 16px rgba(0,0,0,.4)',
    }}>{children}</button>;
}

export default function ViewerPage() {
  return <ViewerInner />;
}
