import { useState, useCallback } from "react";
import { useSanitario } from "../context/SanitarioContext";
import { calcUDparcial, calcUDacumulado } from "./utils";
import { pisoCorto } from "./constants";

export default function DisenoUDPanel({ onClose }) {
  const { tramosSan, udBase, pisos, addTramoSan, delTramoSan, updTramoSan, updTramoSanFix } = useSanitario();

  const [pos, setPos] = useState({ x: 40, y: 40 });
  const [collapsed, setCollapsed] = useState(false);

  const pisosSelect = pisos.filter(p => p.tipo !== 'cubierta');

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('.no-drag')) return;
    if (e.target.closest('input') || e.target.closest('select') || e.target.closest('button') || e.target.closest('label')) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = pos.x;
    const origY = pos.y;
    const onMove = (ev) => {
      setPos({ x: origX + ev.clientX - startX, y: origY + ev.clientY - startY });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos]);

  const acumMap = calcUDacumulado(tramosSan, udBase);
  const colCount = 2 + udBase.length + 2 + 1 + 1;

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        zIndex: 50,
        minWidth: collapsed ? 180 : 520,
        maxWidth: '95vw',
        maxHeight: '80vh',
        background: 'rgba(18,20,24,0.96)',
        border: '1px solid #3a494a',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,.6)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Hanken Grotesk',sans-serif",
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', background: '#1a1c20',
        borderBottom: collapsed ? 'none' : '1px solid #3a494a',
        cursor: 'grab', userSelect: 'none',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e8', display: 'flex', alignItems: 'center', gap: 6 }}>
          📊 Diseño UD por tramos
          <span style={{ fontSize: 10, color: '#849495', fontWeight: 400 }}>{tramosSan.length} tramos</span>
        </span>
        <div style={{ display: 'flex', gap: 4 }} className="no-drag">
          <button onClick={() => setCollapsed(c => !c)} style={{
            padding: '2px 8px', background: 'transparent', border: '1px solid #3a494a',
            borderRadius: 4, color: '#849495', cursor: 'pointer', fontSize: 12,
          }}>{collapsed ? '▾' : '_'}</button>
          <button onClick={onClose} style={{
            padding: '2px 8px', background: 'transparent', border: '1px solid #3a494a',
            borderRadius: 4, color: '#ffb4ab', cursor: 'pointer', fontSize: 12,
          }}>✕</button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ overflow: 'auto', flex: 1, padding: 8 }}>
          <table style={{
            borderCollapse: 'collapse', width: '100%',
            fontFamily: "'Geist',monospace", fontSize: 11, color: '#e2e2e8',
          }}>
            <thead>
              <tr>
                <th style={thS}>Tramo</th>
                <th style={thS}>Piso</th>
                {udBase.map(d => (
                  <th key={d.id} style={{...thS, minWidth: 44}}>
                    {d.nombre}<br/>
                    <span style={{fontSize:8,fontWeight:400,color:'#849495'}}>{d.ud} UD</span>
                  </th>
                ))}
                <th style={thS}>Parc.</th>
                <th style={thS}>Total</th>
                <th style={thS}>Bajante</th>
                <th style={{...thS, width: 30}}></th>
              </tr>
            </thead>
            <tbody>
              {tramosSan.map((t) => {
                const parcial = calcUDparcial(t, udBase);
                const acum = acumMap[t.id] || 0;
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #2a2c30' }}>
                    <td style={tdS}>
                      <input className="ni" style={{width:56,padding:'2px 4px',fontSize:11,textAlign:'center',background:'#1a1c20',border:'1px solid #3a494a',borderRadius:3,color:'#e2e2e8'}}
                      value={t.id} onChange={e=>updTramoSan(t.id,'id',e.target.value)}/>
                    </td>
                    <td style={tdS}>
                      <select className="ni" style={{width:44,padding:'2px 3px',fontSize:11,textAlign:'center',background:'#1a1c20',border:'1px solid #3a494a',borderRadius:3,color:'#e2e2e8'}}
                      value={t.piso} onChange={e=>updTramoSan(t.id,'piso',parseInt(e.target.value))}>
                        {pisosSelect.map(p=><option key={p.id} value={p.n}>{pisoCorto(p.n)}</option>)}
                      </select>
                    </td>
                    {udBase.map(d=>(
                      <td key={d.id} style={{...tdS, padding:'2px 2px'}}>
                        <input type="number" className="ni" style={{width:40,textAlign:'center',padding:'2px 3px',fontSize:11,background:'#1a1c20',border:'1px solid #3a494a',borderRadius:3,color:'#e2e2e8'}}
                        value={t.fixtures[d.id]===0?'':t.fixtures[d.id]??''} min={0}
                        onChange={e=>updTramoSanFix(t.id,d.id,e.target.value===''?0:parseInt(e.target.value)||0)}/>
                      </td>
                    ))}
                    <td style={{...tdS, fontWeight:700, color:'#e2e2e8', fontSize:12}}>{parcial}</td>
                    <td style={{...tdS, fontWeight:700, color:'#e2e2e8', fontSize:13}}>{acum}</td>
                    <td style={{...tdS, textAlign:'center'}}>
                      <input type="checkbox" checked={t.esBajante||false} onChange={e=>updTramoSan(t.id,'esBajante',e.target.checked)} style={{cursor:'pointer',width:14,height:14,accentColor:'#2563EB'}}/>
                    </td>
                    <td style={{...tdS, textAlign:'center'}}>
                      <button onClick={()=>delTramoSan(t.id)} style={{
                        background:'transparent',border:'1px solid rgba(255,100,100,.3)',borderRadius:3,
                        color:'#ffb4ab',padding:'1px 4px',fontSize:9,cursor:'pointer',
                      }}>✕</button>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={colCount} style={{ padding: '6px 0', textAlign: 'center' }}>
                  <button onClick={addTramoSan} style={{
                    padding: '4px 12px', background: '#1e2024', border: '1px dashed #3a494a',
                    borderRadius: 4, color: '#b9caca', cursor: 'pointer', fontSize: 11,
                    fontFamily: "'Hanken Grotesk',sans-serif",
                  }}>+ Agregar tramo</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thS = {
  padding: '6px 6px', fontSize: 10, fontWeight: 600, textAlign: 'center',
  color: '#849495', borderBottom: '2px solid #3a494a', whiteSpace: 'nowrap',
  position: 'sticky', top: 0, background: '#121416',
};

const tdS = {
  padding: '3px 4px', textAlign: 'center', verticalAlign: 'middle',
};
