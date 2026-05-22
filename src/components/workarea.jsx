import { useState, useRef, useCallback } from "react";
import { SanitarioProvider, useSanitario } from "../context/SanitarioContext";
import { LOGO_SRC, G } from "./styles";
import { pisoLbl, APARATOS_DEF, REDES, MATERIALES, MATS_DEFAULT, USOS, EMPRES, NAV_TABS, INFO_SUBTABS, FILTROS_NORM, NORM_COL, MAT_COL, CRIT0 } from "./constants";
import { NumIn } from "./utils";
import CalculoUD from "./CalculoUD";
import DisenosSanitarios from "./DisenosSanitarios";
import BajantesTable from "./BajantesTable";
import DisenoLluvias from "./DisenoLluvias";
import ChequeoBajantesLluvias from "./ChequeoBajantesLluvias";
import ChequeoCanalesLluvias from "./ChequeoCanalesLluvias";
import CalculoHidraulicoLluvias from "./CalculoHidraulicoLluvias";
import CalculoHidraulicoSanitario from "./CalculoHidraulicoSanitario";
import { generarExcelLluvias } from "../utils/generarExcelLluvias";
import { generarExcelRedSanitaria } from "../utils/generarExcelRedSanitaria";
import PdfViewer from "./PdfViewer";
import DisenoUDPanel from "./DisenoUDPanel";
import PanelValoresUD from "./PanelValoresUD";
import PanelBajantesLluvias from "./PanelBajantesLluvias";
import PanelCanalesLluvias from "./PanelCanalesLluvias";
import BaseDatos from "./BaseDatos";
import Normativa from "./Normativa";

function SubNav({items,val,set}){
  const [open,setOpen]=useState(true);
  const cur=items.find(i=>i.id===val)||items[0];
  if(!open) return(
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      <button onClick={()=>setOpen(true)}
        style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'var(--body)',fontSize:13,color:'var(--acc2)',fontWeight:600,transition:'all .15s',width:'100%'}}>
        <span style={{fontSize:12,opacity:.6}}>▶</span>
        <span>{cur.l}</span>
        <span style={{fontSize:10,fontFamily:'var(--mono)',opacity:.6,fontWeight:400}}>{cur.s}</span>
      </button>
    </div>
  );
  return(
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat('+items.length+',1fr)',gap:6,padding:'12px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r2)'}}>
        {items.map(st=>(
          <button key={st.id} onClick={()=>set(st.id)}
            style={{padding:'12px 16px',borderRadius:'var(--r)',border:'1px solid',fontSize:13,cursor:'pointer',fontFamily:'var(--body)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,background:val===st.id?'rgba(27,110,243,.08)':'transparent',borderColor:val===st.id?'var(--acc2)':'var(--line)',color:val===st.id?'var(--acc2)':'var(--txt3)',fontWeight:val===st.id?600:400,transition:'all .15s',textAlign:'center',minWidth:0}}>
            <span>{st.l}</span>
            <span style={{fontSize:11,fontFamily:'var(--mono)',opacity:.7,fontWeight:400,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'100%'}}>{st.s}</span>
          </button>
        ))}
      </div>
      <button onClick={()=>setOpen(false)} title="Colapsar"
        style={{display:'flex',alignItems:'center',alignSelf:'flex-end',padding:'4px 12px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r)',color:'var(--txt3)',cursor:'pointer',fontSize:18,fontFamily:'var(--mono)',transition:'all .15s'}}>▲</button>
    </div>
  );
}

function RedesNav({items,active,set}){
  const [open,setOpen]=useState(true);
  const cur=items.find(i=>i.id===active)||items[0];
  if(!open) return(
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      <button onClick={()=>setOpen(true)}
        style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'var(--body)',fontSize:13,color:cur.col,fontWeight:600,transition:'all .15s',width:'100%'}}>
        <span style={{fontSize:12,opacity:.6}}>▶</span>
        <span style={{fontSize:20}}>{cur.ico}</span>
        <span>{cur.lbl}</span>
        <span style={{fontSize:10,fontFamily:'var(--mono)',opacity:.6,fontWeight:400}}>{cur.sub}</span>
      </button>
    </div>
  );
  return(
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <div style={{display:'flex',gap:5,padding:'10px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r2)',justifyContent:'space-evenly'}}>
        {items.map(r=>(
          <button key={r.id} onClick={()=>set(r.id)}
            style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:'var(--r)',border:'1px solid',cursor:'pointer',fontSize:14,fontFamily:'var(--body)',flex:1,justifyContent:'center',
            borderColor:active===r.id?r.col:'var(--line)',color:active===r.id?r.col:'var(--txt3)',
            background:active===r.id?'rgba(0,0,0,.15)':'transparent',fontWeight:active===r.id?700:400}}>
            <span style={{fontSize:22}}>{r.ico}</span>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:1}}>
              <span>{r.lbl}</span>
              <span style={{fontSize:10,fontFamily:'var(--mono)',opacity:.7}}>{r.sub}</span>
            </div>
          </button>
        ))}
      </div>
      <button onClick={()=>setOpen(false)} title="Colapsar"
        style={{display:'flex',alignItems:'center',alignSelf:'flex-end',padding:'4px 12px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r)',color:'var(--txt3)',cursor:'pointer',fontSize:18,fontFamily:'var(--mono)',transition:'all .15s'}}>▲</button>
    </div>
  );
}

function CIVILFLOWInner(){
  const { tramosSan, tramosLl, bajantesLl, canalesLl, udBase, pisos, proy, setP, setPisos, hidros: ctxHidros } = useSanitario();
  const sanCtx = useSanitario();

  const [tab,setTab]=useState('info');
  const [infoTab,setInfoTab]=useState('gral');
  const [redes,setRedes]=useState(new Set(['san','ll']));
  const redesActivas=REDES.filter(r=>redes.has(r.id));
  const [redActiva,setRedActiva]=useState('san');
  const [critFil,setCritFil]=useState('todos');
  const [crits,setCrits]=useState(CRIT0);
  const [drag,setDrag]=useState(false);
  const [files,setFiles]=useState([]);
  const [activePlanIndex,setActivePlanIndex]=useState(0);
  const [showDisenoUD,setShowDisenoUD]=useState(false);
  const [showValoresUD,setShowValoresUD]=useState(false);
  const [showBajantesLL,setShowBajantesLL]=useState(false);
  const [showCanalesLL,setShowCanalesLL]=useState(false);
  const [busy,setBusy]=useState(false);
  const [meta,setMeta]=useState(null);
  const [vals,setVals]=useState([]);
  const [generando,setGenerando]=useState(false);
  const [aps,setAps]=useState(APARATOS_DEF);
  const [mats,setMats]=useState(MATS_DEFAULT);
  const [matEdit,setMatEdit]=useState({key:null,newVal:''});

  const [nSotanos,setNSotanos]=useState('');
  const [nPisos,setNPisos]=useState('');
  const [altPiso,setAltPiso]=useState(0);
  const [altSotano,setAltSotano]=useState(0);
  const [nptPiso1,setNptPiso1]=useState(0);
  const [conCubierta,setConCubierta]=useState(false);

  const generarPisos=()=>{
    const lista=[];
    const ns=Number(nSotanos)||0;
    const np=Number(nPisos)||0;
    for(let i=ns;i>=1;i--) lista.push({id:'s'+i,n:-i,npt:parseFloat((nptPiso1-(i*altSotano)).toFixed(2)),ok:false,tipo:'sotano'});
    for(let i=1;i<=np;i++) lista.push({id:'p'+i,n:i,npt:parseFloat((nptPiso1+((i-1)*altPiso)).toFixed(2)),ok:false,tipo:'piso'});
    if(conCubierta) lista.push({id:'cub',n:99,npt:parseFloat((nptPiso1+(np*altPiso)).toFixed(2)),ok:false,tipo:'cubierta'});
    setPisos(lista);
  };

  const fileRef=useRef();
  const updAp=(id,field,val)=>setAps(p=>p.map(a=>a.id===id?{...a,[field]:val}:a));

  const hidros=aps.filter(a=>a.grupo==='h');

  const tot={
    uc_af:aps.reduce((s,a)=>s+a.uc_af,0).toFixed(1),
    uc_ac:aps.reduce((s,a)=>s+a.uc_ac,0).toFixed(1),
    ud:aps.reduce((s,a)=>s+a.ud,0),
    qgas:aps.reduce((s,a)=>s+parseFloat(a.qgas||0),0).toFixed(2),
  };

  const analizar=useCallback((f)=>{
    setBusy(true);
    setVals([
      {id:'fmt',st:'idle',msg:'Verificando formato...'},
      {id:'pag',st:'idle',msg:'Contando páginas / plantas...'},
      {id:'esc',st:'idle',msg:'Detectando escala gráfica...'},
      {id:'cap',st:'idle',msg:'Identificando capas AF · AC · SAN · LL · VEN · GAS...'},
      {id:'npt',st:'idle',msg:'Leyendo cotas NPT por planta...'},
      {id:'hid',st:'idle',msg:'Reconociendo aparatos hidráulicos...'},
      {id:'gas',st:'idle',msg:'Detectando puntos de consumo gas...'},
    ]);
    const seq=[
      {d:350,id:'fmt',st:'ok',m:`Válido — ${(f.size/1024).toFixed(0)} KB`},
      {d:800,id:'pag',st:'ok',m:'4 páginas detectadas'},
      {d:1400,id:'esc',st:'warn',m:'Escala 1:75 — confirmar con barra gráfica'},
      {d:2000,id:'cap',st:'ok',m:'AF(azul) · AC(rojo) · SAN(naranja) · LL(cian) · VEN(verde) · GAS(amarillo)'},
      {d:2600,id:'npt',st:'ok',m:'NPT detectados según niveles configurados'},
      {d:3200,id:'hid',st:'ok',m:'18 aparatos hidráulicos detectados'},
      {d:3800,id:'gas',st:'warn',m:'5 puntos de gas — confirmar en editor'},
    ];
    seq.forEach(({d,id,st,m})=>setTimeout(()=>{
      setVals(p=>p.map(v=>v.id===id?{...v,st,msg:m}:v));
      if(id==='gas'){
        setBusy(false);
        setMeta({escala:'1:75',pags:4,ap_hid:18,ap_gas:5,pisos:4,area:'148 m²'});
        setPisos(p=>p.map(x=>({...x,ok:true})));
      }
    },d));
  },[]);

  const addFiles=useCallback((newFiles)=>{
    const pdfs=[];
    for(const f of newFiles){
      const isPdf = f.type === 'application/pdf' || f.name?.toLowerCase().endsWith('.pdf');
      if(isPdf) pdfs.push({id:Date.now()+Math.random(),file:f});
    }
    if(pdfs.length===0&&newFiles.length>0){alert('Solo se permiten archivos PDF.');return;}
    if(pdfs.length===0)return;
    setFiles(prev=>[...prev,...pdfs]);
    setActivePlanIndex(prev=>prev===0&&pdfs.length>0?0:prev);
  },[]);

  const onDrop=useCallback((e)=>{
    e.preventDefault();setDrag(false);
    const fl=e.dataTransfer?.files||e.target?.files;
    if(!fl||fl.length===0)return;
    addFiles(fl);
  },[addFiles]);

  const addPiso=()=>setPisos(prev=>{
    const pisosPOS=prev.filter(p=>p.n>0);
    const maxN=pisosPOS.length?Math.max(...pisosPOS.map(p=>p.n)):0;
    const ln=prev[prev.length-1]?.npt||0;
    return[...prev,{id:Date.now(),n:maxN+1,npt:parseFloat((ln+3.10).toFixed(2)),ok:false}];
  });

  const addSotano=()=>setPisos(prev=>{
    const pisoNEG=prev.filter(p=>p.n<0);
    const minN=pisoNEG.length?Math.min(...pisoNEG.map(p=>p.n)):0;
    const fn=prev[0]?.npt||0;
    return[{id:Date.now(),n:minN-1,npt:parseFloat((fn-3.00).toFixed(2)),ok:false},...prev];
  });

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
        <SubNav items={INFO_SUBTABS} val={infoTab} set={setInfoTab}/>

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
      <input type="text" inputMode="decimal" defaultValue={proy.p_red??''} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setP('p_red',v);}}/></div>
    <div className="f"><label>Dotación de diseño (L/hab/día)</label>
      <input type="text" inputMode="decimal" defaultValue={proy.dot??''} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setP('dot',v);}}/></div>
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
    <div className="f" style={{marginBottom:0}}><label>Altura entrepiso</label><input type="text" inputMode="decimal" defaultValue={altPiso||''} style={{textAlign:'center'}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setAltPiso(v);}}/></div>
    <div className="f" style={{marginBottom:0}}><label>Altura sótano</label><input type="text" inputMode="decimal" defaultValue={altSotano||''} style={{textAlign:'center'}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setAltSotano(v);}}/></div>
  </div>
  <div className="f" style={{marginBottom:4}}><label>NPT Piso 1 (m)</label><input type="text" inputMode="decimal" defaultValue={nptPiso1||''} style={{textAlign:'center'}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setNptPiso1(v);}}/></div>
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
      <span className={p.tipo==='cubierta'?'piso-tag cub':p.n<0?'piso-tag sot':'piso-tag'} style={{fontSize:12,padding:'3px 8px',minWidth:65}}>{p.tipo==='cubierta'?'Cubierta':p.n<0?'Sótano '+Math.abs(p.n):'Piso '+p.n}</span>
      <input type="text" inputMode="decimal" defaultValue={p.npt||''} key={p.id+'npt'} className="npt-in" style={{fontSize:13,width:60}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setPisos(prev=>prev.map(x=>x.id===p.id?{...x,npt:v}:x));}}/>
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
<div className="tab-content" style={{flex:1,minHeight:0,overflow:'hidden'}}>
  <input id="add-plan-input" ref={fileRef} type="file" accept=".pdf" multiple style={{display:'none'}} onChange={(e) => { addFiles(e.target.files); e.target.value=''; }}/>
{files.length > 0 ? (
  <div style={{position:'relative',flex:1,minHeight:0,display:'flex',flexDirection:'column'}}>
                <PdfViewer files={files} activeIndex={activePlanIndex} onSelectPlan={setActivePlanIndex}
                onAddPlan={() => document.getElementById('add-plan-input').click()}
                onRemovePlan={(index) => {
                  const newFiles = files.filter((_, i) => i !== index); setFiles(newFiles);
                  if (activePlanIndex >= newFiles.length) setActivePlanIndex(Math.max(0, newFiles.length - 1));
                  if (newFiles.length === 0) { setMeta(null); setVals([]); setPisos(p => p.map(x => ({...x, ok: false}))); }
                }}
                pisos={pisos}
                />
    {showDisenoUD && <DisenoUDPanel onClose={()=>setShowDisenoUD(false)} />}
    {showValoresUD && <PanelValoresUD onClose={()=>setShowValoresUD(false)} />}
    {showBajantesLL && <PanelBajantesLluvias onClose={()=>setShowBajantesLL(false)} />}
    {showCanalesLL && <PanelCanalesLluvias onClose={()=>setShowCanalesLL(false)} />}
    <div style={{position:'absolute',bottom:8,right:8,zIndex:50,display:'flex',gap:4,flexWrap:'wrap',justifyContent:'flex-end',maxWidth:'50%'}}>
      {!showDisenoUD && <MiniBtn onClick={()=>setShowDisenoUD(true)}>📊 Diseño UD</MiniBtn>}
      {!showValoresUD && <MiniBtn onClick={()=>setShowValoresUD(true)}>📊 UD base</MiniBtn>}
      {!showBajantesLL && <MiniBtn onClick={()=>setShowBajantesLL(true)}>🌧️ Bajantes</MiniBtn>}
      {!showCanalesLL && <MiniBtn onClick={()=>setShowCanalesLL(true)}>🌧️ Canales</MiniBtn>}
    </div>
  </div>
) : (
  <div className="card fu" style={{flex:1,display:'flex',flexDirection:'column'}}>
    <div className="card-h"><span className="card-t">📐 Carga de planos</span><span className="card-s">Solo archivos PDF</span></div>
    <div className="card-b" style={{flex:1,display:'flex',flexDirection:'column'}}>
      {files.length === 0 && (
        <div className={`dz ${drag?'drag':''}`} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop} onClick={()=>fileRef.current?.click()}>
          <div className="dz-ico">📐</div>
          <div className="dz-t">SUBIR PLANO</div>
        </div>
      )}
    </div>
  </div>
)}
{files.length === 0 && (
  <div className="card fu">
    <div className="card-h"><span className="card-t">📋 Requisitos del plano</span></div>
    <div className="card-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
      {[
        ['📏','Escala explícita','Barra gráfica o nota 1:50 · 1:75 · 1:100'],
        ['📄','Plantas separadas','Una página por nivel (Sótano 1, 2... / Piso 1, 2...)'],
        ['🏷️','Cotas NPT','Nivel piso terminado en cada planta'],
        ['🎨','Redes por color','AF · AC · SAN · LL · VEN · GAS con leyenda'],
        ['🚿','Símbolos NTC','Lvm · San · Duc · Lvp · Tin · Lvra'],
        ['🔥','Puntos gas','Est · Cal · Hor · Sec marcados en plano'],
      ].map(([ico,t,s])=>(
        <div key={t} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'10px 14px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--line)'}}>
          <span style={{fontSize:18,flexShrink:0}}>{ico}</span>
          <div><div style={{fontSize:14,fontWeight:500}}>{t}</div><div style={{fontSize:12,color:'var(--txt3)',marginTop:2}}>{s}</div></div>
        </div>
      ))}
    </div>
  </div>
)}</div>)}
              </div>
            )}

  {/* ── REDES A DISEÑAR ── */}
{tab==='redes'&&redesActivas.length>0&&(
  <div className="fu" style={{display:'flex',flexDirection:'column',gap:12,flex:1,minHeight:0}}>
    <RedesNav items={redesActivas} active={redActiva} set={setRedActiva}/>
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
    const okSAN=tramosSan.length>0&&tramosSan.every(t=>{const v=t.v_real||0;const y=t.yD||0;const q=t.qQ0||0;return v>=0.45&&v<=4.0&&y<=0.75&&q<=1.0;});
    const okLL=tramosLl.length>0&&tramosLl.every(t=>{const v=t.v_real||0;const y=t.yD||0;const q=t.qQ0||0;return v>=0.45&&v<=4.0&&y<=0.75&&q<=1.0;});
    const items=[
      ['PROYECTO',proy.nombre],['UBICACIÓN',[proy.mun,proy.dep].filter(Boolean).join(', ')],
      ['USO',proy.uso],['EMPRESA',proy.empresa],
      ['P RED',proy.p_red+' mca'],['DOTACIÓN',proy.dot+' L/hab/d'],
      ['REDES',[...redes].join(' · ')],
      ['NIVELES',pisos.sort((a,b)=>a.n-b.n).map(p=>p.tipo==='cubierta'?'Cubierta':p.n<0?'Sótano '+Math.abs(p.n):'Piso '+p.n).join(' · ')],
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
  {redActiva==='san' && (
    <button className="btn-pri" onClick={async () => {
      document.activeElement?.blur(); await new Promise(r=>setTimeout(r,0));
      const proyecto = {nombre: proy.nombre || "Proyecto", direccion: proy.dir || "", municipio: proy.mun || "", departamento: proy.dep || "", uso: proy.uso || "", empresa: proy.empresa || "", ingeniero: "Ing. Camilo C\u00e1rdenas Chac\u00f3n", normas: "NTC 1500 \u00b7 RAS 2000 \u00b7 NSR-10"};
      try {
        const { generarExcelRedSanitaria } = await import("../utils/generarExcelRedSanitaria");
        const { blob, nombreArchivo, prefijo } = await generarExcelRedSanitaria({proyecto, udBase, tieneSotano: pisos.some(p => p.n < 0), pisos, tramosSan, pendienteSan: parseFloat(proy.pendienteSan) || 0.02, poblFija: parseInt(proy.poblFija) || 6, poblFlot: parseInt(proy.poblFlot) || 10, areaPiscina: parseFloat(proy.areaPiscina) || 0, areaVerdes: parseFloat(proy.areaVerdes) || 0});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${prefijo}_${nombreArchivo}.xlsx`; a.click(); URL.revokeObjectURL(url);
      } catch (e) { alert("Error: " + e.message); console.error(e); }
    }}
    style={{padding:'7px 15px',background:'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',border:'none',borderRadius:'var(--r)',color:'#fff',fontWeight:600,fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',gap:5,transition:'all 0.2s'}}>
      <span className="ntab-ico" style={{fontSize:14,filter:'brightness(1.2)'}}>🚿</span> Generar Excel Red Sanitaria
    </button>
  )}
  {redActiva==='ll' && (
    <button className="btn-pri" disabled={!proy.nombre || !!generando} onClick={() => {
      if (generando) return; document.activeElement?.blur(); setGenerando(true);
      const proyecto = {nombre: proy.nombre || "Proyecto", direccion: proy.dir || "", municipio: proy.mun || "", departamento: proy.dep || "", uso: proy.uso || "", empresa: proy.empresa || "", ingeniero: "Ing. Camilo C\u00e1rdenas Chac\u00f3n", normas: "M\u00e9todo Racional \u00b7 IDF"};
      const a = document.createElement('a'); a.style.display = 'none'; document.body.appendChild(a);
      generarExcelLluvias({proyecto, tramosLl, bajantesLl, canalesLl, pisos})
        .then(({ blob, nombreArchivo, prefijo }) => {
          const url = URL.createObjectURL(blob); a.href = url; a.download = `${prefijo}_${nombreArchivo}.xlsx`; a.click(); document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 100); setGenerando(false);
        })
        .catch(e => { document.body.removeChild(a); alert("Error: " + e.message); console.error(e); setGenerando(false); });
    }}
    style={{padding:'7px 15px',background:generando?'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)':'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',border:'none',borderRadius:'var(--r)',color:'#fff',fontWeight:600,fontSize:11,cursor:proy.nombre&&!generando?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:5,opacity:proy.nombre&&!generando?1:0.5,transition:'all 0.2s'}}>
      <span className="ntab-ico" style={{fontSize:14,filter:'brightness(1.2)'}}>{generando ? '\u23f3' : '\uD83C\uDF27\uFE0F'}</span>
      {generando ? 'Generando...' : 'Generar Excel red lluvias'}
    </button>
  )}
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
  return (
    <SanitarioProvider>
      <CIVILFLOWInner />
    </SanitarioProvider>
  );
}
