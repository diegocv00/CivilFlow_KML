import { useState, useRef, useMemo } from "react";
import { useSanitario } from "../context/SanitarioContext";
import { usePlanos } from "../context/PlanosContext";
import { useFloorGenerator } from "../hooks/useFloorGenerator";
import { useAnalysis } from "../hooks/useAnalysis";
import CollapsibleNav from "./CollapsibleNav";
import { G } from "./styles";
import { REDES, USOS, EMPRES, NAV_TABS, INFO_SUBTABS, REQ_ITEMS, pisoLbl } from "./constants";
import { parseDecimalInput } from "../utils/parseDecimal";
import { validateTramo } from "../utils/validateTramo";
import CalculoUD from "./UdCalculation";
import DisenosSanitarios from "./SanitaryDesign";
import BajantesTable from "./DownpipesTable";
import DisenoLluvias from "./RainwaterDesign";
import ChequeoBajantesLluvias from "./RainDownpipesCheck";
import ChequeoCanalesLluvias from "./RainChannelsCheck";
import CalculoHidraulicoLluvias from "./RainwaterHydraulicCalc";
import CalculoHidraulicoSanitario from "./SanitaryHydraulicCalc";

import DisenoUDPanel from "./UdDesignPanel";
import PanelValoresUD from "./UdValuesPanel";
import PanelBajantesLluvias from "./RainDownpipesPanel";
import PanelCanalesLluvias from "./RainChannelsPanel";
import BaseDatos from "./Database";
import Normativa from "./Normativa";

function CIVILFLOWInner(){
const { tramosSan, tramosLl, udBase, pisos, proy, setP, setPisos } = useSanitario();
const { planos, addPlanos, removePlano } = usePlanos();

  const [tab,setTab]=useState('info');
  const [infoTab,setInfoTab]=useState('gral');
  const [redes,setRedes]=useState(new Set(['san','ll']));
  const redesActivas=useMemo(()=>REDES.filter(r=>redes.has(r.id)),[redes]);
  const [redActiva,setRedActiva]=useState('san');
const [planDrag,setPlanDrag]=useState(false);

const { nSotanos, setNSotanos, nPisos, setNPisos, altPiso, setAltPiso, altSotano, setAltSotano, nptPiso1, setNptPiso1, conCubierta, setConCubierta, generarPisos, addPiso, addSotano } = useFloorGenerator(pisos, setPisos);
const { busy, meta, vals, analizar } = useAnalysis(setPisos);

const fileRef=useRef();

return(
    <div className="civilflow-wrapper" style={{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <style>{G}</style>
      <div className="app">
        <div className="nav">{NAV_TABS.map(t=>(
          <div key={t.id} className={`ntab ${tab===t.id?'on':''}`} onClick={()=>setTab(t.id)}>
            <span className="ntab-ico">{t.ico}</span>{t.l}
          </div>
        ))}</div>
        <div className="layout"><div className="content">

{/* ── INFO GENERAL ── */}
{tab==='info'&&(
<div className="fu info-gral" style={{display:'flex',flexDirection:'column',gap:16,flex:1,minHeight:0}}>
        <CollapsibleNav items={INFO_SUBTABS} collapsedLabel={INFO_SUBTABS.find(t=>t.id===infoTab)?.l || INFO_SUBTABS[0].l} renderTab={(st)=>(<button key={st.id} onClick={()=>setInfoTab(st.id)} style={{padding:'12px 16px',borderRadius:'var(--r)',border:'1px solid',fontSize:13,cursor:'pointer',fontFamily:'var(--body)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,background:infoTab===st.id?'rgba(27,110,243,.08)':'transparent',borderColor:infoTab===st.id?'var(--acc2)':'var(--line)',color:infoTab===st.id?'var(--acc2)':'var(--txt3)',fontWeight:infoTab===st.id?600:400,transition:'all .15s',textAlign:'center',minWidth:0}}><span>{st.l}</span><span style={{fontSize:11,fontFamily:'var(--mono)',opacity:.7,fontWeight:400,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'100%'}}>{st.s}</span></button>)} mode="grid" />

{infoTab==='gral'&&(
<div className="fu" style={{display:'flex',flexDirection:'column',gap:16,flex:1,minHeight:0,overflow:'hidden'}}>
<div className="card card-gral">
  <div className="card-h"><span className="card-t">📋 Identificación del proyecto</span><span className="card-s">Datos para memorias de cálculo</span></div>
  <div className="card-b" style={{flex:1,display:'flex',flexDirection:'column',minHeight:0}}>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
    <div className="f"><label>Nombre del proyecto</label><input value={proy.nombre} onChange={e=>setP('nombre',e.target.value)}/></div>
    <div className="f"><label>Dirección / Sector</label><input value={proy.dir} onChange={e=>setP('dir',e.target.value)}/></div>
    <div className="f"><label>Municipio</label><input value={proy.mun} onChange={e=>setP('mun',e.target.value)}/></div>
    <div className="f"><label>Departamento</label><input value={proy.dep} onChange={e=>setP('dep',e.target.value)}/></div>
    <div className="f"><label>Uso / Destinación</label>
      <select value={proy.uso} onChange={e=>setP('uso',e.target.value)}><option value="">—</option>{USOS.map(u=><option key={u}>{u}</option>)}</select></div>
    <div className="f"><label>Empresa prestadora</label>
      <select value={proy.empresa} onChange={e=>setP('empresa',e.target.value)}><option value="">—</option>{EMPRES.map(u=><option key={u}>{u}</option>)}</select></div>
    <div className="f"><label>Presión disponible red (m.c.a.)</label>
      <input type="text" inputMode="decimal" defaultValue={proy.p_red??''} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)setP('p_red',v);}}/></div>
    <div className="f"><label>Dotación de diseño (L/hab/día)</label>
      <input type="text" inputMode="decimal" defaultValue={proy.dot??''} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)setP('dot',v);}}/></div>
  </div></div></div></div>
)}

{infoTab==='niveles'&&(
<div className="fu" style={{display:'flex',flexDirection:'column',gap:12,minHeight:0}}>
  <div style={{display:'grid',gridTemplateColumns:pisos.length>0?'1fr 1fr':'1fr',gap:12,flex:1,minHeight:0,overflow:'hidden'}}>
<div className="card" style={{overflow:'auto'}}>
<div className="card-h"><span className="card-t">🏢 Generador de niveles</span><span className="card-s">Nomenclatura colombiana</span></div>
<div className="card-b" style={{overflow:'visible'}}>
<div style={{display:'flex',flexDirection:'column',justifyContent:'space-between',gap:6}}>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:4}}>
<div className="f" style={{marginBottom:0}}><label>N° sótanos</label><input type="text" inputMode="numeric" pattern="[0-9]*" value={nSotanos} style={{textAlign:'center'}} onChange={e=>setNSotanos(e.target.value.replace(/\D/g,''))}/></div>
      <div className="f" style={{marginBottom:0}}><label>N° pisos</label><input type="text" inputMode="numeric" pattern="[0-9]*" value={nPisos} style={{textAlign:'center'}} onChange={e=>setNPisos(e.target.value.replace(/\D/g,''))}/></div>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:4}}>
    <div className="f" style={{marginBottom:0}}><label>Altura entrepiso</label><input type="text" inputMode="decimal" defaultValue={altPiso||''} style={{textAlign:'center'}} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)setAltPiso(v);}}/></div>
    <div className="f" style={{marginBottom:0}}><label>Altura sótano</label><input type="text" inputMode="decimal" defaultValue={altSotano||''} style={{textAlign:'center'}} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)setAltSotano(v);}}/></div>
  </div>
  <div className="f" style={{marginBottom:4}}><label>NPT Piso 1 (m)</label><input type="text" inputMode="decimal" defaultValue={nptPiso1||''} style={{textAlign:'center'}} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)setNptPiso1(v);}}/></div>
  <label style={{display:'flex',alignItems:'center',gap:7,fontFamily:'var(--mono)',fontSize:13,color:'var(--txt2)',cursor:'pointer',marginBottom:4}}>
    <input type="checkbox" checked={conCubierta} onChange={e=>setConCubierta(e.target.checked)} style={{width:18,height:18,accentColor:'var(--acc)',cursor:'pointer'}}/>Incluir cubierta
  </label>
</div>
<button onClick={generarPisos} style={{width:'100%',padding:'5px',background:'var(--acc)',border:'none',borderRadius:'var(--r)',color:'#fff',fontWeight:600,fontSize:13,cursor:'pointer',flexShrink:0}}>Generar niveles</button></div></div>
{pisos.length>0&&(
<div className="card" style={{overflow:'auto'}}>
<div className="card-h"><span className="card-t">Niveles generados</span><span className="card-s">{pisos.length} niveles · NPT editable</span></div>
<div className="card-b" style={{display:'grid',gridTemplateColumns:'1fr',gap:6,overflow:'visible'}}>
  {[...pisos].sort((a,b)=>a.n-b.n).map(p=>(
    <div key={p.id} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',background:'var(--bg3)',border:'1px solid var(--line)',borderRadius:'var(--r)',borderLeft:'3px solid '+(p.tipo==='cubierta'?'var(--ll)':p.n<0?'var(--txt3)':'var(--acc2)')}}>
      <span className={p.tipo==='cubierta'?'piso-tag cub':p.n<0?'piso-tag sot':'piso-tag'} style={{fontSize:12,padding:'3px 8px',minWidth:65}}>{pisoLbl(p.n)}</span>
      <input type="text" inputMode="decimal" defaultValue={p.npt||''} key={p.id+'npt'} className="npt-in" style={{fontSize:13,width:60}} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)setPisos(prev=>prev.map(x=>x.id===p.id?{...x,npt:v}:x));}}/>
      <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--txt3)'}}>m</span>
      <div className={`pdot ${p.ok?'ok':''}`} style={{marginLeft:'auto'}}/>
    </div>
  ))}
</div>
<div style={{padding:'6px 10px',borderTop:'1px solid var(--line)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
  <button className="btn-xs" onClick={addSotano}>+ Sótano</button>
  <button className="btn-xs" onClick={addPiso}>+ Piso</button>
</div></div>)}</div></div>)}

{infoTab==='redes'&&(
<div className="fu" style={{display:'flex',flexDirection:'column',gap:16,flex:1,minHeight:0,overflow:'hidden'}}>
  <div className="ib info"><span>ℹ</span><span>Active las redes del proyecto. Determinan los módulos de cálculo disponibles.</span></div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
{REDES.map(r=>{
  const on=redes.has(r.id);
  return(
    <div key={r.id} onClick={()=>{const n=new Set(redes);on?n.delete(r.id):n.add(r.id);setRedes(n);}}
      style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',
      background:on?'rgba(27,110,243,.06)':'var(--bg3)',
      border:'1px solid '+(on?'rgba(27,110,243,.35)':'var(--line)'),borderRadius:'var(--r2)',transition:'all .15s'}}>
      <span style={{fontSize:24}}>{r.ico}</span>
      <div style={{flex:1}}>
        <div style={{fontWeight:600,fontSize:15,color:on?'var(--acc2)':'var(--txt2)'}}>{r.lbl}</div>
        <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--txt3)',marginTop:3}}>{r.sub}</div>
      </div>
      <div style={{width:22,height:22,borderRadius:'50%',border:'2px solid '+(on?'var(--acc2)':'var(--line2)'),
        background:on?'var(--acc2)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {on&&<span style={{color:'#fff',fontSize:12,fontWeight:700}}>✓</span>}
      </div>
    </div>
  );
})}</div></div>)}

{infoTab==='plano'&&(
<div className="fu" style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',gap:12,overflowY:'auto',overflowX:'hidden',padding:0}}>
  <input id="add-plan-input" ref={fileRef} type="file" accept=".pdf" multiple style={{display:'none'}} onChange={(e) => { addPlanos(e.target.files); e.target.value=''; }}/>

  {/* Upload zone — only when no planos */}
  {planos.length === 0 && (
    <div className="card fu" style={{flex:'none',overflow:'visible'}}>
      <div className="card-h"><span className="card-t">📐 Carga de planos</span><span className="card-s">Solo archivos PDF</span></div>
      <div style={{display:'flex',flexDirection:'column'}}>
        <div className={`dz ${planDrag?'drag':''}`}
          onDragOver={e=>{e.preventDefault();setPlanDrag(true)}}
          onDragLeave={()=>setPlanDrag(false)}
          onDrop={e=>{e.preventDefault();setPlanDrag(false);const fl=e.dataTransfer?.files;if(fl&&fl.length>0)addPlanos(fl);}}
          onClick={()=>fileRef.current?.click()}>
          <div className="dz-ico">📐</div>
          <div className="dz-t">SUBIR PLANOS</div>
          <div style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--txt3)',marginTop:4}}>Arrastra archivos aquí o haz clic · Solo PDF</div>
        </div>
      </div>
    </div>
  )}

  {/* Uploaded list */}
  {planos.length > 0 && (
    <div className="card fu" style={{flex:'none',overflow:'visible'}}>
      <div className="card-h" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span className="card-t">Planos cargados ({planos.length})</span>
        <button onClick={()=>fileRef.current?.click()}
          style={{padding:'3px 10px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r)',color:'#00dce5',cursor:'pointer',fontSize:10,fontFamily:'var(--mono)',fontWeight:600}}>+ AGREGAR</button>
      </div>
      <div style={{padding:0}}>
        {planos.map((p,i)=>(
          <div key={p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid var(--line)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0,flex:1}}>
              <span style={{fontSize:14,flexShrink:0}}>📄</span>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,fontFamily:'var(--mono)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                <div style={{fontSize:10,color:'var(--txt3)',fontFamily:'var(--mono)'}}>{(p.file.size/1024).toFixed(1)} KB</div>
              </div>
            </div>
            <button onClick={()=>removePlano(p.id)}
              style={{background:'none',border:'none',color:'var(--txt3)',cursor:'pointer',fontSize:16,flexShrink:0,padding:'2px 6px'}}
              title="Eliminar plano">✕</button>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Area de Trabajo button */}
  {planos.length > 0 && (
    <a href="#/visor" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px 24px',background:'rgba(0,220,229,0.08)',border:'1px solid rgba(0,220,229,0.3)',borderRadius:'var(--r2)',color:'#00dce5',fontWeight:700,fontSize:12,textTransform:'uppercase',letterSpacing:1,textDecoration:'none',fontFamily:'var(--mono)',transition:'all .15s',boxShadow:'0 0 20px rgba(0,220,229,0.1)'}}>
       ÁREA DE TRABAJO
    </a>
  )}

  {/* Requirements — always visible */}
  <div className="card fu" style={{flex:'none',overflow:'visible'}}>
    <div className="card-h"><span className="card-t">📋 Requisitos del plano</span></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
{REQ_ITEMS.map(([ico,t,s])=>(
        <div key={t} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'10px 14px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--line)'}}>
          <span style={{fontSize:18,flexShrink:0}}>{ico}</span>
          <div><div style={{fontSize:14,fontWeight:500}}>{t}</div><div style={{fontSize:12,color:'var(--txt3)',marginTop:2}}>{s}</div></div>
        </div>
      ))}
    </div>
  </div>
</div>
)}
              </div>
            )}

  {/* ── REDES A DISEÑAR ── */}
{tab==='redes'&&redesActivas.length>0&&(
  <div className="fu" style={{display:'flex',flexDirection:'column',gap:12,flex:1,minHeight:0}}>
    <CollapsibleNav items={redesActivas} collapsedLabel={redesActivas.find(r=>r.id===redActiva)?.lbl || redesActivas[0]?.lbl} renderTab={(r)=>(<button key={r.id} onClick={()=>setRedActiva(r.id)} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:'var(--r)',border:'1px solid',cursor:'pointer',fontSize:14,fontFamily:'var(--body)',flex:1,justifyContent:'center',borderColor:redActiva===r.id?r.col:'var(--line)',color:redActiva===r.id?r.col:'var(--txt3)',background:redActiva===r.id?'rgba(0,0,0,.15)':'transparent',fontWeight:redActiva===r.id?700:400}}><span style={{fontSize:22}}>{r.ico}</span><div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:1}}><span>{r.lbl}</span><span style={{fontSize:10,fontFamily:'var(--mono)',opacity:.7}}>{r.sub}</span></div></button>)} mode="flex" />
  {redActiva==='san'&&redes.has('san')&&(
    <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
      <CalculoUD onTraerPlano={()=>{setTab('info');setInfoTab('plano');}} />
      <DisenosSanitarios /><BajantesTable /><CalculoHidraulicoSanitario />
    </div>
  )}
  {redActiva==='ll'&&redes.has('ll')&&(
    <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
      <ChequeoBajantesLluvias /><ChequeoCanalesLluvias /><DisenoLluvias /><CalculoHidraulicoLluvias />
    </div>
  )}
  {redesActivas.filter(r=>r.id!=='san'&&r.id!=='ll').map(r=>redActiva===r.id&&redes.has(r.id)&&(
    <div key={r.id} className="fu" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,flex:1,minHeight:250}}>
      <div style={{fontSize:48,opacity:.5}}>🚧</div>
      <div style={{fontSize:18,fontWeight:600,color:'var(--txt2)'}}>{r.lbl}</div>
      <div style={{fontSize:13,color:'var(--txt3)',textAlign:'center',maxWidth:380,lineHeight:1.6}}>
        El módulo de <strong>{r.lbl}</strong> está en desarrollo.<br/>Pronto estará disponible para uso en CIVILFLOW.</div>
    </div>
  ))}</div>
)}

{/* ── BASE DATOS ── */}
{tab==='datos'&&(
<BaseDatos />
)}

{/* ── NORMATIVA ── */}
{tab==='crit'&&(
  <Normativa />
)}

{/* ── INFORME ── */}
{tab==='inf'&&(
<div className="fu" style={{display:'flex',flexDirection:'column',gap:12,flex:1,minHeight:0}}>
  {(()=>{
const okSAN=tramosSan.length>0&&tramosSan.every(validateTramo);
const okLL=tramosLl.length>0&&tramosLl.every(validateTramo);
    const items=[
      ['PROYECTO',proy.nombre],['UBICACIÓN',[proy.mun,proy.dep].filter(Boolean).join(', ')],
      ['USO',proy.uso],['EMPRESA',proy.empresa],
      ['P RED',proy.p_red+' mca'],['DOTACIÓN',proy.dot+' L/hab/d'],
      ['REDES',[...redes].join(' · ')],
      ['NIVELES',[...pisos].sort((a,b)=>a.n-b.n).map(p=>pisoLbl(p.n)).join(' · ')],
      ['SANITARIA',okSAN?'✓ OK':'✗ Revisar'],['AGUAS LLUVIAS',okLL?'✓ OK':'✗ Revisar'],
    ];
    return(
      <div className="card">
        <div className="card-h"><span className="card-t">📊 Resumen del proyecto</span><span className="card-s">CIVILFLOW KML 2026 · Ing. Camilo Cárdenas</span></div>
        <div className="card-b">
          {items.map(([k,v])=>(
            <div key={k} style={{display:'flex',gap:10,alignItems:'baseline',padding:'5px 8px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--line)',marginBottom:4}}>
              <span style={{fontFamily:'var(--mono)',fontSize:8,color:'var(--txt3)',minWidth:120,flexShrink:0,textTransform:'uppercase'}}>{k}</span>
              <span style={{fontSize:11,fontWeight:500,color:String(v).includes('✗')?'var(--err)':String(v).includes('✓')?'var(--ok)':'var(--txt)'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  })()}
</div>
)}

          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',background:'var(--bg2)',borderTop:'1px solid var(--line)',flexShrink:0,overflowX:'auto'}}>
  {redesActivas.map(r=>(
    <button key={r.id} onClick={()=>{setTab('redes');setRedActiva(r.id);}}
      style={{display:'flex',alignItems:'center',gap:5,padding:'6px 11px',borderRadius:'var(--r)',border:'1px solid',flexShrink:0,cursor:'pointer',fontSize:11,fontFamily:'var(--body)',fontWeight:600,
      borderColor:tab==='redes'&&redActiva===r.id?r.col:'var(--line2)',
      color:tab==='redes'&&redActiva===r.id?r.col:'var(--txt3)',
      background:tab==='redes'&&redActiva===r.id?'rgba(0,0,0,.15)':'transparent'}}>
      <span style={{fontSize:16}}>{r.ico}</span><span>{r.lbl}</span>
    </button>
  ))}
<div style={{flex:1}}/>
      </div>
      </div>
    </div>
  );
}

function MiniBtn({onClick,children}){
  return <button onClick={onClick}
    style={{padding:'5px 10px',background:'rgba(24,26,30,0.92)',border:'1px solid #3a494a',borderRadius:6,color:'#e2e2e8',fontSize:11,cursor:'pointer',fontFamily:"'Hanken Grotesk',sans-serif",fontWeight:600,display:'flex',alignItems:'center',gap:4,boxShadow:'0 4px 16px rgba(0,0,0,.4)'}}>{children}</button>;
}

export default function CIVILFLOW(){
  return <CIVILFLOWInner />;
}
