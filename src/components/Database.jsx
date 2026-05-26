import { useState } from "react";

const MAT = {
  af:  { l: 'Agua Fría',       opts: ['PVC presión','CPVC','Cobre rígido','PP-R'] },
  ac:  { l: 'Agua Caliente',   opts: ['CPVC','Cobre rígido','PP-R','PEX'] },
  san: { l: 'Sanitaria',       opts: ['PVC sanitario','Novatec','Hierro fundido'] },
  ll:  { l: 'Aguas Lluvias',   opts: ['PVC sanitario','Novatec','Concreto'] },
  ven: { l: 'Ventilación',     opts: ['PVC sanitario','Novatec'] },
  gas: { l: 'Gas',             opts: ['PE al PE','Polietileno PEAD','Cobre rígido','Acero galvanizado'] },
  rci: { l: 'Contra Incendio', opts: ['Acero SCH 40','Acero SCH 10','CPVC-CI'] },
};

const CALS = [
  { l: 'HACEB 6 LPM',  lpm: 6,  kw: 11.5, m3h: 1.11, ef: 87 },
  { l: 'BOSCH 8 LPM',  lpm: 8,  kw: 14.5, m3h: 1.40, ef: 88 },
  { l: 'HACEB 10 LPM', lpm: 10, kw: 20.5, m3h: 1.98, ef: 89 },
  { l: 'HACEB 12 LPM', lpm: 12, kw: 24.0, m3h: 2.32, ef: 88 },
  { l: 'RHEEM 16 LPM', lpm: 16, kw: 31.0, m3h: 3.00, ef: 90 },
  { l: 'BOSCH 21 LPM', lpm: 21, kw: 45.0, m3h: 4.35, ef: 88 },
];

const BD_SUBTABS = [
  { id:'mats',   l:'📦 Materiales por red', s:'Tipos de tubería editables' },
  { id:'apars',  l:'🚿 Aparatos',            s:'UC · UD · Presiones · Q gas' },
  { id:'calent', l:'♨️ Calentadores',         s:'Catálogo a gas' },
  { id:'profs',  l:'📏 Profundidades',        s:'Instalación por red' },
];

function SubNav({ items, val, set }) {
  const [open, setOpen] = useState(true);
  const cur = items.find(i => i.id === val) || items[0];
  if (!open) {
    return (
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        <button onClick={() => setOpen(true)}
          style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r)',cursor:'pointer',fontFamily:'var(--body)',fontSize:13,color:'var(--acc2)',fontWeight:600,transition:'all .15s',width:'100%'}}>
          <span style={{fontSize:12,opacity:.6}}>▶</span>
          <span>{cur.l}</span>
          <span style={{fontSize:10,fontFamily:'var(--mono)',opacity:.6,fontWeight:400}}>{cur.s}</span>
        </button>
      </div>
    );
  }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat('+items.length+',1fr)',gap:6,padding:'12px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r2)'}}>
        {items.map(st => (
          <button key={st.id}
            onClick={() => set(st.id)}
            style={{padding:'10px 14px',borderRadius:'var(--r)',border:'1px solid',fontSize:13,cursor:'pointer',fontFamily:'var(--body)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,background:val===st.id?'rgba(27,110,243,.08)':'transparent',borderColor:val===st.id?'var(--acc2)':'var(--line)',color:val===st.id?'var(--acc2)':'var(--txt3)',fontWeight:val===st.id?600:400,transition:'all .15s',textAlign:'center',minWidth:0}}>
            <span>{st.l}</span>
            <span style={{fontSize:10,fontFamily:'var(--mono)',opacity:.7,fontWeight:400,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'100%'}}>{st.s}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setOpen(false)} title="Colapsar"
        style={{display:'flex',alignItems:'center',alignSelf:'flex-end',padding:'4px 12px',background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r)',color:'var(--txt3)',cursor:'pointer',fontSize:18,fontFamily:'var(--mono)',transition:'all .15s'}}>
        ▲
      </button>
    </div>
  );
}

export default function BaseDatos() {
  const [mats, setMats] = useState(
    Object.fromEntries(
      Object.entries(MAT).map(([k, v]) => [k, v.opts.map((o, i) => ({ id: k + i, val: o }))])
    )
  );
  const [matEdit, setMatEdit] = useState({ key: null, v: '' });

  const [aps, setAps] = useState([
    { id:'lvm',  s:'Lvm:',  n:'Lavamanos',   g:'h', ucaf:0.5, ucac:0.5, ud:2, pmin:0.51, pmax:5.63,  qg:0    },
    { id:'san',  s:'San:',  n:'Sanitario',   g:'h', ucaf:2.2, ucac:0,   ud:4, pmin:0.71, pmax:14.1,  qg:0    },
    { id:'duc',  s:'Duc:',  n:'Ducha',       g:'h', ucaf:1.0, ucac:1.0, ud:2, pmin:1.02, pmax:5.63,  qg:0    },
    { id:'lvp',  s:'Lvp:',  n:'Lavaplatos',  g:'h', ucaf:1.0, ucac:1.0, ud:2, pmin:0.51, pmax:5.63,  qg:0    },
    { id:'tin',  s:'Tin:',  n:'Tina',        g:'h', ucaf:1.0, ucac:1.0, ud:2, pmin:0.51, pmax:14.1,  qg:0    },
    { id:'lvra', s:'Lvra:', n:'Lavadora',    g:'h', ucaf:1.0, ucac:0,   ud:4, pmin:0.51, pmax:5.63,  qg:0    },
    { id:'est4', s:'Est4:', n:'Estufa 4Q',   g:'g', ucaf:0,   ucac:0,   ud:0, pmin:17,   pmax:25,    qg:1.35 },
    { id:'cal',  s:'Cal:',  n:'Calentador',  g:'g', ucaf:0,   ucac:0,   ud:0, pmin:17,   pmax:25,    qg:1.76 },
    { id:'hor',  s:'Hor:',  n:'Horno',       g:'g', ucaf:0,   ucac:0,   ud:0, pmin:17,   pmax:25,    qg:1.15 },
  ]);

  const [calSel, setCalSel] = useState(null);

  const qGas = aps.filter(a => a.g === 'g').reduce((s, a) => s + a.qg, 0);

  const [profs, setProfs] = useState([
    { id:'san', red:'Sanitaria',       col:'var(--san)',   prof:-0.70, norma:'RAS 2000 §D.4.1',   nota:'Bajo losa'       },
    { id:'ll',  red:'Aguas Lluvias',   col:'var(--ll)',    prof:-0.50, norma:'RAS 2000 §D.4.2',   nota:'Bajo losa'       },
    { id:'af',  red:'Agua Fría',       col:'var(--acc2)',  prof: 0.00, norma:'NTC 1500 §5.4',     nota:'A nivel NPT'     },
    { id:'ac',  red:'Agua Caliente',   col:'var(--san)',   prof:-0.10, norma:'NTC 1500 §5.4',     nota:'Bajo NPT'        },
    { id:'gas', red:'Gas',             col:'var(--gas)',   prof:-0.15, norma:'NTC 3728 §4.3',     nota:'Con protección'  },
    { id:'ven', red:'Ventilación',     col:'var(--ven)',   prof: 0.00, norma:'NTC 1500 §9.2',     nota:'A nivel NPT'     },
    { id:'rci', red:'Contra Incendio', col:'#F87171',      prof:-0.45, norma:'NFPA 13 §6',        nota:'Zona protegida'  },
  ]);

  const [datosTab, setDatosTab] = useState('mats');

  return (
    <div className="fu bd-section" style={{display:'flex',flexDirection:'column',gap:16,flex:1,minHeight:0}}>
      <SubNav items={BD_SUBTABS} val={datosTab} set={setDatosTab}/>

      {/* ══════════ SUB-TAB: MATERIALES ══════════ */}
      {datosTab === 'mats' && (
        <div className="fu" style={{display:'flex',flexDirection:'column',gap:16,flex:1,minHeight:0,overflow:'hidden'}}>
          <div className="ib info"><span>ℹ</span><span>Edite, agregue o elimine tipos de material por red. Los cambios aplican en los selectores.</span></div>
          <div style={{flex:1,minHeight:0,overflow:'auto'}}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {Object.entries(mats).map(([key, items]) => {
                const col = {af:'var(--acc2)',ac:'#F04545',san:'var(--san)',ll:'var(--ll)',ven:'var(--ven)',gas:'var(--gas)',rci:'#F87171'}[key]||'var(--txt2)';
                return (
                  <div key={key} className="card">
                    <div className="card-h">
                      <span className="card-t">
                        <span style={{width:9,height:9,borderRadius:'50%',background:col,display:'inline-block',marginRight:6}}/>
                        {MAT[key]?.l||key}
                      </span>
                      <span className="card-s">{items.length} tipos</span>
                    </div>
                    <div style={{padding:'0'}}>
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th style={{width:30,textAlign:'center'}}>#</th>
                            <th>Material</th>
                            <th style={{width:80,textAlign:'center'}}>Acc.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it, ix) => (
                            <tr key={it.id} style={{background:ix%2===0?'var(--bg3)':'var(--bg2)'}}>
                              <td style={{textAlign:'center',fontFamily:'var(--mono)',fontSize:9,color:'var(--txt3)'}}>{ix+1}</td>
                              <td>
                                <input className="ni" style={{width:'100%',textAlign:'left'}} value={it.val}
                                  onChange={e=>{const v=e.target.value;setMats(p=>({...p,[key]:p[key].map(x=>x.id===it.id?{...x,val:v}:x)}));}}/>
                              </td>
                              <td style={{textAlign:'center'}}>
                                <button style={{background:'var(--err-bg)',border:'1px solid var(--err-b)',borderRadius:'var(--r)',color:'var(--err)',padding:'1px 8px',fontSize:12,cursor:'pointer'}}
                                  onClick={()=>{if(items.length<=1){alert('Mínimo 1');return;}setMats(p=>({...p,[key]:p[key].filter(x=>x.id!==it.id)}));}}>✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{padding:'6px 10px',background:'var(--bg3)',borderTop:'1px solid var(--line)',display:'flex',gap:7,alignItems:'center'}}>
                        <input className="ni" style={{flex:1,textAlign:'left',fontSize:12}} placeholder={`Nuevo — ${MAT[key]?.l||key}...`}
                          value={matEdit.key===key?matEdit.v:''}
                          onFocus={()=>setMatEdit({key,v:matEdit.key===key?matEdit.v:''})}
                          onChange={e=>setMatEdit({key,v:e.target.value})}
                          onKeyDown={e=>{if(e.key==='Enter'&&matEdit.v.trim()&&matEdit.key===key){setMats(p=>({...p,[key]:[...p[key],{id:key+Date.now(),val:matEdit.v.trim()}]}));setMatEdit({key:null,v:''});}}}/>
                        <button style={{padding:'3px 10px',background:'var(--acc)',border:'none',borderRadius:'var(--r)',color:'#fff',fontSize:12,cursor:'pointer',fontWeight:600}}
                          onClick={()=>{if(!matEdit.v.trim()||matEdit.key!==key)return;setMats(p=>({...p,[key]:[...p[key],{id:key+Date.now(),val:matEdit.v.trim()}]}));setMatEdit({key:null,v:''});}}>+ Agregar</button>
                      </div>
                      <div style={{padding:'2px 10px',background:'var(--bg)',borderTop:'1px solid var(--line)',textAlign:'right'}}>
                        <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--txt3)',fontSize:10}}
                          onClick={()=>{if(!window.confirm('Restaurar?'))return;setMats(p=>({...p,[key]:MAT[key].opts.map((o,i)=>({id:key+i,val:o}))}));}}>↺ Restaurar defaults</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SUB-TAB: APARATOS ══════════ */}
      {datosTab === 'apars' && (
        <div className="fu" style={{display:'flex',flexDirection:'column',gap:16,flex:1,minHeight:0,overflow:'hidden'}}>
          <div className="card" style={{flex:1,display:'flex',flexDirection:'column',minHeight:0}}>
            <div className="card-h">
              <span className="card-t">🚿 Aparatos sanitarios — NTC 1500:2020 · NTC 3728</span>
            </div>
            <div className="card-b" style={{flex:1,overflow:'auto',padding:'0'}}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Sigla</th>
                    <th>Aparato</th>
                    <th className="c" style={{background:'rgba(27,110,243,.07)',color:'var(--acc2)'}}>UC AF</th>
                    <th className="c" style={{background:'rgba(240,69,69,.07)',color:'#F04545'}}>UC AC</th>
                    <th className="c" style={{background:'var(--san-bg)',color:'var(--san)'}}>UD</th>
                    <th className="c">P mín</th>
                    <th className="c">P máx</th>
                    <th className="c" style={{background:'var(--gas-bg)',color:'var(--gas)'}}>Q gas</th>
                  </tr>
                </thead>
                <tbody>
                  {aps.map((a, ri) => (
                    <tr key={a.id} style={{background:ri%2===0?'var(--bg3)':'var(--bg2)'}}>
                      <td>
                        <span style={{fontFamily:'var(--mono)',fontSize:9,fontWeight:600,color:a.g==='g'?'var(--gas)':'var(--acc2)',background:a.g==='g'?'var(--gas-bg)':'rgba(27,110,243,.1)',padding:'2px 5px',borderRadius:3}}>{a.s}</span>
                      </td>
                      <td style={{fontWeight:500}}>{a.n}</td>
                      {['ucaf','ucac','ud','pmin','pmax','qg'].map(k => (
                        <td key={k} style={{textAlign:'center'}}>
                          <input type="number" step=".01" className="ni"
                            style={{width:52,color:k==='qg'?'var(--gas)':k.startsWith('uc')?'var(--acc2)':k==='ud'?'var(--san)':'var(--txt)'}}
                            value={a[k]}
                            onChange={e=>{const v=parseFloat(e.target.value)||0;setAps(p=>p.map(x=>x.id===a.id?{...x,[k]:v}:x));}}/>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="tot-bar">
                <div className="tot"><div className="tl">UC AF</div><div className="tv" style={{color:'var(--acc2)'}}>{aps.reduce((s,a)=>s+a.ucaf,0).toFixed(1)}</div></div>
                <div className="tot"><div className="tl">UC AC</div><div className="tv" style={{color:'#F04545'}}>{aps.reduce((s,a)=>s+a.ucac,0).toFixed(1)}</div></div>
                <div className="tot"><div className="tl">UD total</div><div className="tv" style={{color:'var(--san)'}}>{aps.reduce((s,a)=>s+a.ud,0)}</div></div>
                <div className="tot"><div className="tl">Q gas</div><div className="tv" style={{color:'var(--gas)'}}>{qGas.toFixed(2)}</div><div className="ts">m³/hr</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SUB-TAB: CALENTADORES ══════════ */}
      {datosTab === 'calent' && (
        <div className="fu" style={{display:'flex',flexDirection:'column',gap:16,flex:1,minHeight:0,overflow:'hidden'}}>
          {calSel && (
            <div className="ib ok2">
              <span>✓</span>
              <div><b>{calSel.l}</b> — {calSel.lpm} LPM · {calSel.kw} kW · {calSel.m3h} m³/hr · Ef. {calSel.ef}%</div>
            </div>
          )}
          <div className="card" style={{flex:1,display:'flex',flexDirection:'column',minHeight:0}}>
            <div className="card-h">
              <span className="card-t">♨️ Catálogo calentadores — NTC 3728 §5</span>
            </div>
            <div className="card-b" style={{flex:1,overflow:'auto'}}>
              <div className="cal-grid">
                {CALS.map((cal, i) => (
                  <div key={i} className={'cal-c'+(calSel===CALS[i]?' sel':'')} onClick={()=>setCalSel(CALS[i])}>
                    <div className="cal-r">{cal.l}</div>
                    <div className="cal-vs">
                      <div className="cal-v">{cal.lpm}<span> LPM</span></div>
                      <div className="cal-v">{cal.ef}<span>% ef</span></div>
                      <div className="cal-v">{cal.kw}<span> kW</span></div>
                      <div className="cal-v">{cal.m3h}<span> m³/hr</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SUB-TAB: PROFUNDIDADES ══════════ */}
      {datosTab === 'profs' && (
        <div className="fu" style={{display:'flex',flexDirection:'column',gap:16,flex:1,minHeight:0,overflow:'hidden'}}>
          <div className="card" style={{flex:1,display:'flex',flexDirection:'column',minHeight:0}}>
            <div className="card-h">
              <span className="card-t">📏 Profundidades de instalación</span>
              <span className="card-s">NTC 1500 · RAS 2000 · NTC 3728 · NFPA 13</span>
            </div>
            <div className="card-b" style={{flex:1,overflow:'auto',padding:'0'}}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Red</th>
                    <th className="c">Prof. (m)</th>
                    <th className="c">Referencia</th>
                    <th>Norma</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {profs.map((p, ri) => (
                    <tr key={p.id} style={{background:ri%2===0?'var(--bg3)':'var(--bg2)'}}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:7}}>
                          <div style={{width:10,height:10,borderRadius:'50%',background:p.col}}/>
                          <span style={{fontWeight:500}}>{p.red}</span>
                        </div>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <input type="number" step=".05" className="ni" style={{width:70,color:p.prof<0?'var(--warn)':'var(--ok)'}}
                          value={p.prof}
                          onChange={e=>{const v=parseFloat(e.target.value)||0;setProfs(prev=>prev.map(x=>x.id===p.id?{...x,prof:v}:x));}}/>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <span className={'badge '+(p.prof<0?'warn':'ok')}>
                          {p.prof<0?p.prof+' m bajo NPT':p.prof===0?'A nivel NPT':p.prof+' m sobre NPT'}
                        </span>
                      </td>
                      <td className="mn9">{p.norma}</td>
                      <td>
                        <input className="ni" style={{width:'100%',textAlign:'left',fontSize:12}} value={p.nota||''}
                          onChange={e=>{const v=e.target.value;setProfs(prev=>prev.map(x=>x.id===p.id?{...x,nota:v}:x));}}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
