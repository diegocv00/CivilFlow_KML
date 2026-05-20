import { useState, useRef, useCallback } from "react";
import { SanitarioProvider, useSanitario } from "../context/SanitarioContext";
import { LOGO_SRC, G } from "./styles";
import { pisoLbl, APARATOS_DEF, REDES, TABS, MATERIALES, MATS_DEFAULT, USOS, EMPRES } from "./constants";
import { NumIn } from "./utils";
import CalculoUD from "./CalculoUD";
import DisenosSanitarios from "./DisenosSanitarios";
import BajantesTable from "./BajantesTable";
import DisenoLluvias from "./DisenoLluvias";
import ChequeoBajantesLluvias from "./ChequeoBajantesLluvias";
import ChequeoCanalesLluvias from "./ChequeoCanalesLluvias";
import CalculoHidraulicoLluvias from "./CalculoHidraulicoLluvias";
import CalculoHidraulicoSanitario from "./CalculoHidraulicoSanitario";
import { generarExcelSanitario } from "../utils/generarExcelSanitario";
import PdfViewer from "./PdfViewer";

function CIVILFLOWInner(){
  const { tramosSan, udBase, pisos, proy, setP, setPisos, hidros: ctxHidros } = useSanitario();
  const sanCtx = useSanitario();

  const [tab,setTab]=useState('plano');
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [drag,setDrag]=useState(false);
  const [files,setFiles]=useState([]);
  const [activePlanIndex,setActivePlanIndex]=useState(0);
  const [busy,setBusy]=useState(false);
  const [meta,setMeta]=useState(null);
  const [vals,setVals]=useState([]);
  const [redes,setRedes]=useState('san');
  const [aps,setAps]=useState(APARATOS_DEF);
  const [mats,setMats]=useState(MATS_DEFAULT);
  const [matEdit,setMatEdit]=useState({key:null,newVal:''});
  const [generando,setGenerando]=useState(false);

  const [nSotanos,setNSotanos]=useState(1);
  const [nPisos,setNPisos]=useState(2);
  const [altPiso,setAltPiso]=useState(3.10);
  const [altSotano,setAltSotano]=useState(3.00);
  const [nptPiso1,setNptPiso1]=useState(0.00);
  const [conCubierta,setConCubierta]=useState(true);

  const generarPisos=()=>{
    const lista=[];
    for(let i=nSotanos;i>=1;i--) lista.push({id:'s'+i,n:-i,npt:parseFloat((nptPiso1-(i*altSotano)).toFixed(2)),ok:false,tipo:'sotano'});
    for(let i=1;i<=nPisos;i++) lista.push({id:'p'+i,n:i,npt:parseFloat((nptPiso1+((i-1)*altPiso)).toFixed(2)),ok:false,tipo:'piso'});
    if(conCubierta) lista.push({id:'cub',n:99,npt:parseFloat((nptPiso1+(nPisos*altPiso)).toFixed(2)),ok:false,tipo:'cubierta'});
    setPisos(lista);
  };

  const [tramosAF,setTramosAF]=useState([
    {id:'RAF1',ini:'Duc',fin:'Mon',piso:2,fixtures:{san:3,duc:2,lvra:1},Lh:23.13,Lv:0},
    {id:'RAF2',ini:'Lav',fin:'Mon',piso:1,fixtures:{san:3,duc:2,lvp:2,lvra:1,lvro:1},Lh:23.88,Lv:0},
    {id:'RAF4',ini:'Mon',fin:'Con',piso:1,fixtures:{},UC_otros:25.7,Lh:7.54,Lv:0},
    {id:'RAF5',ini:'Mon',fin:'Cal',piso:1,fixtures:{},UC_otros:13.6,Lh:18.57,Lv:0},
  ]);

  const [tramosAC,setTramosAC]=useState([
    {id:'RAC1',ini:'Cal',fin:'1',piso:1,fixtures:{duc:2,lvp:1,lvm:1,tin:1},Lh:16.93,Lv:0},
    {id:'RAC2',ini:'Duc',fin:'Mon',piso:2,fixtures:{duc:1,lvm:1},Lh:19.55,Lv:0},
    {id:'RAC3',ini:'Duc',fin:'Mon',piso:2,fixtures:{duc:1,lvm:1},Lh:11.36,Lv:0},
    {id:'RAC4',ini:'Mon',fin:'Cal',piso:2,fixtures:{},UC_otros:6,Lh:5.73,Lv:0},
  ]);

  const fileRef=useRef();
  const updAp=(id,field,val)=>setAps(p=>p.map(a=>a.id===id?{...a,[field]:val}:a));

  const hidros=aps.filter(a=>a.grupo==='h');

  const tot={
    uc_af:aps.reduce((s,a)=>s+a.uc_af,0).toFixed(1),
    uc_ac:aps.reduce((s,a)=>s+a.uc_ac,0).toFixed(1),
    ud:aps.reduce((s,a)=>s+a.ud,0),
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

  const togRed=id=>setRedes(id);

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

  const addTramoAF=()=>setTramosAF(p=>[...p,{
    id:`RAF${p.length+1}`,ini:'',fin:'',piso:1,fixtures:{san:1,duc:1},UC_otros:0,Lh:10,Lv:0,
  }]);
  const delTramoAF=(id)=>setTramosAF(p=>p.filter(t=>t.id!==id));
  const updTramoAF=(id,field,val)=>setTramosAF(p=>p.map(t=>t.id===id?{...t,[field]:val}:t));
  const updTramoAFFix=(id,fix,val)=>setTramosAF(p=>p.map(t=>t.id===id?{...t,fixtures:{...t.fixtures,[fix]:val}}:t));

  const addTramoAC=()=>setTramosAC(p=>[...p,{
    id:`RAC${p.length+1}`,ini:'',fin:'',piso:1,fixtures:{duc:1,lvm:1},UC_otros:0,Lh:10,Lv:0,
  }]);
  const delTramoAC=(id)=>setTramosAC(p=>p.filter(t=>t.id!==id));
  const updTramoAC=(id,field,val)=>setTramosAC(p=>p.map(t=>t.id===id?{...t,[field]:val}:t));
  const updTramoACFix=(id,fix,val)=>setTramosAC(p=>p.map(t=>t.id===id?{...t,fixtures:{...t.fixtures,[fix]:val}}:t));

  return(
    <div className="civilflow-wrapper" style={{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <style>{G}</style>
      <div className="app">

        <div className="nav">
          {TABS.filter(t=>t.id!=='cud'||redes==='san'||redes==='ll').map(t=>(
            <div key={t.id} className={`ntab ${tab===t.id?'on':''}`}
              onClick={()=>setTab(t.id)}>
              <span className="ntab-ico">{t.ico}</span>
              {t.id==='cud'&&redes==='ll'?'Cálculo Aguas Lluvias':t.lbl}

            </div>
          ))}
        </div>

        <div className="layout">
          {!sidebarOpen&&<div onClick={()=>setSidebarOpen(true)} style={{width:28,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'var(--bg2)',borderRight:'1px solid var(--line)',flexShrink:0,color:'var(--txt3)',fontSize:'14px',transition:'all .15s'}}>▶</div>}
          <div className="sb" style={{width:sidebarOpen?360:0,minWidth:0,transition:'width .2s',flexShrink:0}}>
          {sidebarOpen&&(<div style={{minWidth:360,height:'100%',display:'flex',flexDirection:'column',overflow:'hidden auto'}}>
          <div style={{display:'flex',justifyContent:'flex-end',padding:'6px 8px',borderBottom:'1px solid var(--line)',background:'var(--bg2)'}}>
            <span onClick={()=>setSidebarOpen(false)} style={{cursor:'pointer',fontSize:'16px',color:'var(--txt3)',lineHeight:1}}>◀</span>
          </div>

            <div className="sb-sec">
              <div className="sb-hdr">Proyecto</div>
              <div className="f"><label>Nombre</label>
                <input value={proy.nombre} onChange={e=>setP('nombre',e.target.value)}/></div>
              <div className="f"><label>Dirección</label>
                <input value={proy.dir} onChange={e=>setP('dir',e.target.value)}/></div>
              <div className="f2">
                <div className="f"><label>Municipio</label>
                  <input value={proy.mun} onChange={e=>setP('mun',e.target.value)}/></div>
                <div className="f"><label>Dpto.</label>
                  <input value={proy.dep} onChange={e=>setP('dep',e.target.value)}/></div>
              </div>
              <div className="f"><label>Uso</label>
                <select value={proy.uso} onChange={e=>setP('uso',e.target.value)}>
                  {USOS.map(u=><option key={u}>{u}</option>)}</select></div>
              <div className="f"><label>Empresa prestadora</label>
                <select value={proy.empresa} onChange={e=>setP('empresa',e.target.value)}>
                  {EMPRES.map(u=><option key={u}>{u}</option>)}</select></div>
              <div className="f2">
                <div className="f"><label>P red (m.c.a.)</label>
                  <input type="text" inputMode="decimal" defaultValue={proy.p_red??''} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setP('p_red',v);}}/></div>
                <div className="f"><label>Dotación (L/h/d)</label>
                  <input type="text" inputMode="decimal" defaultValue={proy.dot??''} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setP('dot',v);}}/></div>
              </div>
              <div className="f2">
                <div className="f"><label>Población fija</label>
                  <input type="number" value={proy.poblFija} onChange={e=>setP('poblFija',e.target.value)}/></div>
                <div className="f"><label>Población flotante</label>
                  <input type="number" value={proy.poblFlot} onChange={e=>setP('poblFlot',e.target.value)}/></div>
              </div>
              <div className="f2">
                <div className="f"><label>Área piscina (m²)</label>
                  <input type="text" inputMode="decimal" defaultValue={proy.areaPiscina??''} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setP('areaPiscina',v);}}/></div>
                <div className="f"><label>Área verdes (m²)</label>
                  <input type="text" inputMode="decimal" defaultValue={proy.areaVerdes??''} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setP('areaVerdes',v);}}/></div>
              </div>
              <div className="f2">
                <div className="f"><label>Pendiente sanitaria</label>
                  <input type="text" inputMode="decimal" defaultValue={proy.pendienteSan??''} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setP('pendienteSan',v);}}/></div>
                <div className="f"><label>C escorrentía</label>
                  <input type="text" inputMode="decimal" defaultValue={proy.C_escorrentia??''} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setP('C_escorrentia',v);}}/></div>
              </div>
            </div>

            <div className="sb-sec">
              <div className="sb-hdr">Características de los materiales</div>
              {Object.entries(MATERIALES).map(([key,{lbl,opts}])=>(
                <div key={key} className="f">
                  <label>{lbl}</label>
                  <select value={proy[`mat_${key}`]||opts[0]}
                    onChange={e=>setP(`mat_${key}`,e.target.value)}>
                    {opts.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="sb-sec">
              <div className="sb-hdr">Red a calcular</div>
              <div className="tg-grid">
                {REDES.map(r=>(
                  <div key={r.id}
                    className={`tg ${redes===r.id?'on':''}`}
                    onClick={()=>togRed(r.id)}>
                    <div className="tg-dot"/>
                    <span style={{fontSize:13}}>{r.ico}</span>
                    <div style={{flex:1}}>
                      <div className="tg-nm">{r.lbl}</div>
                      <div className="tg-sb">{r.sub}</div>
                    </div>
                    {redes===r.id&&<span className="tg-on">ON</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-sec">
              <div className="sb-hdr">Niveles del proyecto</div>
              <div style={{background:'var(--bg)',border:'1px solid rgba(37,99,235,.25)',borderRadius:'var(--r)',padding:'9px',marginBottom:8}}>
                <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--acc2)',marginBottom:8,textTransform:'uppercase',fontWeight:600}}>Generador</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:5}}>
                  <div className="f" style={{marginBottom:0}}><label>N° sótanos</label><input type="number" min="0" max="10" value={nSotanos} style={{textAlign:'center'}} onChange={e=>setNSotanos(Math.max(0,parseInt(e.target.value)||0))}/></div>
                  <div className="f" style={{marginBottom:0}}><label>N° pisos</label><input type="number" min="1" max="50" value={nPisos} style={{textAlign:'center'}} onChange={e=>setNPisos(Math.max(1,parseInt(e.target.value)||1))}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:5}}>
                  <div className="f" style={{marginBottom:0}}><label>H. entrepiso</label><input type="text" inputMode="decimal" defaultValue={altPiso??''} style={{textAlign:'center'}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setAltPiso(v);}}/></div>
                  <div className="f" style={{marginBottom:0}}><label>H. sótano</label><input type="text" inputMode="decimal" defaultValue={altSotano??''} style={{textAlign:'center'}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setAltSotano(v);}}/></div>
                </div>
                <div className="f" style={{marginBottom:6}}><label>NPT Piso 1 (m)</label><input type="text" inputMode="decimal" defaultValue={nptPiso1??''} style={{textAlign:'center'}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setNptPiso1(v);}}/></div>
<label style={{display:'flex',alignItems:'center',gap:7,fontFamily:'var(--mono)',fontSize:11,color:'var(--txt2)',cursor:'pointer',marginBottom:7}}>
<input type="checkbox" checked={conCubierta} onChange={e=>setConCubierta(e.target.checked)} style={{width:18,height:18,accentColor:'var(--acc)',cursor:'pointer'}}/>Incluir cubierta
</label>
                <button onClick={generarPisos} style={{width:'100%',padding:'6px',background:'var(--acc)',border:'none',borderRadius:'var(--r)',color:'#fff',fontWeight:600,fontSize:11,cursor:'pointer'}}> Generar niveles</button>
              </div>
{[...pisos].sort((a,b)=>a.n-b.n).map(p=>(
<div key={p.id} className="piso-r" style={{padding:'6px 8px'}}>
<span className={p.tipo==='cubierta'?'piso-tag cub':p.n<0?'piso-tag sot':'piso-tag'} style={{fontSize:11,padding:'3px 8px'}}>{p.tipo==='cubierta'?'Cubierta':p.n<0?'Sótano '+Math.abs(p.n):'Piso '+p.n}</span>
<input type="text" inputMode="decimal" defaultValue={p.npt??''} key={p.id+'npt'} className="npt-in" style={{fontSize:12,width:70}}
onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')setPisos(prev=>prev.map(x=>
x.id===p.id?{...x,npt:v}:x));}}/>
<span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>m</span>
<div className={`pdot ${p.ok?'ok':''}`}/>
</div>
))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginTop:4}}>
                <button className="btn-xs" onClick={addSotano}>+ Sótano</button>
                <button className="btn-xs" onClick={addPiso}>+ Piso</button>
              </div>
</div>


          </div>)}
          </div>

          <div className="content">

            {tab==='mats'&&(
              <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
                <div className="ib info"><span>ℹ</span><span>Edite, agregue o elimine tipos de material por red.</span></div>
                {Object.entries(mats).map(([key,items])=>{
                  var inf={af:{l:'Agua Fría',c:'var(--acc2)'},ac:{l:'Agua Caliente',c:'var(--ac)'},san:{l:'Sanitaria',c:'var(--san)'},ll:{l:'Aguas Lluvias',c:'var(--ll)'},ven:{l:'Ventilación',c:'var(--ven)'},gas:{l:'Gas',c:'var(--gas)'},rci:{l:'Contra Incendio',c:'#F87171'}};
                  var nfo=inf[key]||{l:key,c:'var(--txt2)'};
                  return(
                    <div key={key} className="card">
                      <div className="card-h">
                        <span className="card-t"><span style={{width:9,height:9,borderRadius:'50%',background:nfo.c,display:'inline-block',marginRight:6}}/>{nfo.l}</span>
                        <span className="card-s">{items.length} tipos</span>
                      </div>
                      <div style={{overflowX:'auto'}}>
                        <table className="tbl">
                          <thead><tr><th className="col-h" style={{width:32,textAlign:'center'}}>#</th><th className="col-h">Material</th><th className="col-h" style={{width:90,textAlign:'center'}}>Acción</th></tr></thead>
                          <tbody>
                            {items.map((item,ix)=>(
                              <tr key={item.id}>
                                <td style={{textAlign:'center',fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>{ix+1}</td>
                                <td><input className="ni" style={{width:'100%',textAlign:'left'}} value={item.val}
                                  onChange={e=>setMats(prev=>({...prev,[key]:prev[key].map(x=>x.id===item.id?{...x,val:e.target.value}:x)}))}/></td>
                                <td style={{textAlign:'center'}}>
                                  <button onClick={()=>{if(items.length<=1){alert('Mínimo 1');return;}setMats(prev=>({...prev,[key]:prev[key].filter(x=>x.id!==item.id)}));}}
                                    style={{background:'var(--err-bg)',border:'1px solid var(--err-b)',borderRadius:'var(--r)',color:'var(--err)',padding:'2px 8px',fontSize:10,cursor:'pointer'}}>✕</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{padding:'9px 13px',background:'var(--bg3)',borderTop:'1px solid var(--line)',display:'flex',gap:8,alignItems:'center'}}>
                        <input className="ni" style={{flex:1,textAlign:'left'}} placeholder={'Nuevo — '+nfo.l+'...'}
                          value={matEdit.key===key?matEdit.newVal:''}
                          onFocus={()=>setMatEdit({key:key,newVal:matEdit.key===key?matEdit.newVal:''})}
                          onChange={e=>setMatEdit({key:key,newVal:e.target.value})}/>
                        <button onClick={()=>{if(!matEdit.newVal.trim()||matEdit.key!==key)return;setMats(prev=>({...prev,[key]:[...prev[key],{id:key+Date.now(),val:matEdit.newVal.trim()}]}));setMatEdit({key:null,newVal:''}); }}
                          style={{padding:'5px 12px',background:'var(--acc)',border:'none',borderRadius:'var(--r)',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:500}}>+ Agregar</button>
                      </div>
                      <div style={{padding:'5px 13px',background:'var(--bg)',borderTop:'1px solid var(--line)',textAlign:'right'}}>
                        <button onClick={()=>{if(!window.confirm('Restaurar?'))return;setMats(prev=>({...prev,[key]:MATERIALES[key].opts.map((o,ii)=>({id:key+ii,val:o}))}));}}
                          style={{background:'none',border:'none',cursor:'pointer',color:'var(--txt3)',fontSize:9}}>↺ Restaurar defaults</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab==='plano'&&(
          <div className="tab-content">
            <input
              id="add-plan-input"
              ref={fileRef}
              type="file"
              accept=".pdf"
              multiple
              style={{display:'none'}}
              onChange={(e) => { addFiles(e.target.files); e.target.value=''; }}
            />
            {files.length > 0 ? (
                  <PdfViewer
                    files={files}
                    activeIndex={activePlanIndex}
                    onSelectPlan={setActivePlanIndex}
                    onAddPlan={() => document.getElementById('add-plan-input').click()}
                    onRemovePlan={(index) => {
                      const newFiles = files.filter((_, i) => i !== index);
                      setFiles(newFiles);
                      if (activePlanIndex >= newFiles.length) {
                        setActivePlanIndex(Math.max(0, newFiles.length - 1));
                      }
                      if (newFiles.length === 0) {
                        setMeta(null);
                        setVals([]);
                        setPisos(p => p.map(x => ({...x, ok: false})));
                      }
                    }}
                  />
                ) : (
                  <div className="card fu" style={{flex:1,display:'flex',flexDirection:'column'}}>
                    <div className="card-h">
                      <span className="card-t">📐 Carga de planos</span>
                      <span className="card-s">Solo archivos PDF</span>
                    </div>
                    <div className="card-b" style={{flex:1,display:'flex',flexDirection:'column'}}>
                      {files.length === 0 && (
                        <div className={`dz ${drag?'drag':''}`}
                          onDragOver={e=>{e.preventDefault();setDrag(true)}}
                          onDragLeave={()=>setDrag(false)}
                          onDrop={onDrop}
onClick={()=>fileRef.current?.click()}>
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
                    <div className="card-b" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      {[
                        ['📏','Escala explícita','Barra gráfica o nota 1:50 · 1:75 · 1:100'],
                        ['📄','Plantas separadas','Una página por nivel (Sótano 1, 2... / Piso 1, 2...)'],
                        ['🏷️','Cotas NPT','Nivel piso terminado en cada planta'],
                        ['🎨','Redes por color','AF · AC · SAN · LL · VEN · GAS con leyenda'],
                        ['🚿','Símbolos NTC','Lvm · San · Duc · Lvp · Tin · Lvra'],
                        ['🔥','Puntos gas','Est · Cal · Hor · Sec marcados en plano'],
                      ].map(([ico,t,s])=>(
                        <div key={t} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'8px 10px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--line)'}}>
                          <span style={{fontSize:16,flexShrink:0}}>{ico}</span>
                          <div>
                            <div style={{fontSize:11,fontWeight:500}}>{t}</div>
                            <div style={{fontSize:9,color:'var(--txt3)',marginTop:1}}>{s}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab==='apars'&&(
              <div className="card fu">
                <div className="card-h">
                  <span className="card-t">🚿 Base de aparatos — editable</span>
                  <span className="card-s">NTC 1500 · NTC 3728 · RAS 2000</span>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th className="col-h" rowSpan={2} style={{textAlign:'center'}}>Sigla</th>
                        <th className="col-h" rowSpan={2} style={{textAlign:'center'}}>Aparato</th>
                        <th colSpan={2} className="col-h af" style={{textAlign:'center'}}>UC</th>
                        <th className="col-h san" style={{textAlign:'center'}}>UD</th>
                        <th colSpan={2} className="col-h ok" style={{textAlign:'center'}}>Presión (m.c.a.)</th>
                        <th className="col-h gas" style={{textAlign:'center'}}>Q Gas</th>
                        <th className="col-h" rowSpan={2} style={{textAlign:'center',fontSize:8}}>Norma</th>
                      </tr>
                      <tr>
                        <th className="col-h af" style={{fontSize:8}}>AF</th>
                        <th className="col-h af" style={{fontSize:8}}>AC</th>
                        <th className="col-h san" style={{fontSize:8}}>UD</th>
                        <th className="col-h ok" style={{fontSize:8}}>Mín</th>
                        <th className="col-h ok" style={{fontSize:8}}>Máx</th>
                        <th className="col-h gas" style={{fontSize:8}}>m³/hr</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="tbl-sec"><td colSpan={9}>APARATOS HIDRÁULICOS — NTC 1500</td></tr>
                      {hidros.map(a=>(
                        <tr key={a.id}>
                          <td><span className="sigla">{a.sigla}</span></td>
                          <td><div className="ap-nm">{a.nombre}</div><div className="ap-ref">{a.norma}</div></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.uc_af} step={0.1} onChange={v=>updAp(a.id,'uc_af',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.uc_ac} step={0.1} onChange={v=>updAp(a.id,'uc_ac',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.ud} step={1} onChange={v=>updAp(a.id,'ud',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.pmin} step={0.01} w={58} onChange={v=>updAp(a.id,'pmin',v)}/></td>
                          <td style={{textAlign:'center'}}><NumIn val={a.pmax} step={0.01} w={58} onChange={v=>updAp(a.id,'pmax',v)}/></td>
                          <td style={{textAlign:'center'}}><span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>—</span></td>
                          <td style={{textAlign:'center'}}><span className="ap-ref">{a.norma.split(' ')[0]}</span></td>
                        </tr>
                      ))}
                     </tbody>
                  </table>
                </div>
                <div className="tot-bar">
                  {[
                    {l:'UC AF total',v:tot.uc_af,cls:'af',s:'→ Q diseño AF'},
                    {l:'UC AC total',v:tot.uc_ac,cls:'ac',s:'→ Q diseño AC'},
                    {l:'UD Sanitaria',v:tot.ud,cls:'san',s:'→ Q maning'},
                  ].map(t=>(
                    <div key={t.l} className="tot">
                      <div className="tot-l">{t.l}</div>
                      <div className={`tot-v ${t.cls}`}>{t.v}</div>
                      <div className="tot-s">{t.s}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab==='cud'&&redes==='san'&&(
              <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
                <CalculoUD />
                <DisenosSanitarios />
                <BajantesTable />
                <CalculoHidraulicoSanitario />
              </div>
            )}
            {tab==='cud'&&redes==='ll'&&(
              <div className="fu" style={{display:'flex',flexDirection:'column',gap:12}}>
                <DisenoLluvias />
                <ChequeoBajantesLluvias />
                <ChequeoCanalesLluvias />
                <CalculoHidraulicoLluvias />
              </div>
            )}

          </div>
        </div>

<div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',padding:'8px 14px',background:'var(--bg2)',borderTop:'1px solid var(--line)',flexShrink:0,gap:8}}>
<div style={{fontSize:9,color:'var(--txt3)',fontFamily:'var(--mono)',flex:1}}>
{REDES.find(r=>r.id===redes)?.lbl||'—'} · {aps.length} dispositivos · {pisos.length} niveles
</div>
{redes==='san' && (
<button
className="btn-pri"
disabled={!proy.nombre || !!generando}
onClick={() => {
if (generando) return;
setGenerando(true);
const proyecto = {
nombre: proy.nombre || "Proyecto",
direccion: proy.dir || "",
municipio: proy.mun || "",
departamento: proy.dep || "",
uso: proy.uso || "",
empresa: proy.empresa || "",
ingeniero: "Ing. Camilo C\u00e1rdenas Chac\u00f3n",
normas: "NTC 1500 \u00b7 RAS 2000 \u00b7 NSR-10",
};
const a = document.createElement('a');
a.style.display = 'none';
document.body.appendChild(a);
generarExcelSanitario({
proyecto, hidros, tieneSotano: pisos.some(p => p.n < 0), pisos,
tramosSan, pendienteSan: parseFloat(proy.pendienteSan) || 0.02,
poblFija: parseInt(proy.poblFija) || 6, poblFlot: parseInt(proy.poblFlot) || 10,
areaPiscina: parseFloat(proy.areaPiscina) || 0, areaVerdes: parseFloat(proy.areaVerdes) || 0,
})
.then(({ blob, nombreArchivo, prefijo }) => {
const url = URL.createObjectURL(blob);
a.href = url;
a.download = `${prefijo}_${nombreArchivo}.xlsx`;
a.click();
document.body.removeChild(a);
setTimeout(() => URL.revokeObjectURL(url), 100);
setGenerando(false);
})
.catch(e => {
document.body.removeChild(a);
alert("Error: " + e.message);
console.error(e);
setGenerando(false);
});
}}
style={{
padding: '7px 15px',
background: generando
? 'linear-gradient(135deg, #b45309 0%, #92400e 100%)'
: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
border: 'none', borderRadius: 'var(--r)',color: '#fff',fontWeight: 600,fontSize: 11,
cursor: proy.nombre && !generando ? 'pointer' : 'not-allowed',
display: 'flex',
alignItems: 'center',
gap: 5,
opacity: proy.nombre && !generando ? 1 : 0.5,
transition: 'all 0.2s',
}}
>
<span className="ntab-ico" style={{ fontSize: 14, filter: 'brightness(1.2)' }}>
{generando ? '⏳' : '🚿'}
</span>
{generando ? 'Generando...' : 'Generar Excel red sanitaria'}
</button>
)}
</div>
      </div>
    </div>
  );
}

export default function CIVILFLOW(){
  return (
    <SanitarioProvider>
      <CIVILFLOWInner />
    </SanitarioProvider>
  );
}