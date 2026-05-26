import { useSanitario } from "../context/SanitarioContext";
import { pisoCorto, DIAM_OPTIONS, V_MIN, V_MAX, Y_D_MAX, FR_SUBCRITICO, FR_SUPERCRITICO, FUERZA_TRACTIVA_MIN } from "./constants";
import { parseDecimalInput } from "../utils/parseDecimal";
import { parseDescripcion } from "../utils/parseDescripcion";
import { relacionesHidraulicas, caudalTuboLleno, velocidadTuboLleno, diametromaning, tipoRegimen, numeroFroude, tiranteCritico, GRAVEDAD } from "../utils/calcSanitario";

export default function DisenoLluvias() {
  const { tramosLl, pisos, updTramoLL, addTramoLL, delTramoLL } = useSanitario();

  const bajantes=tramosLl.filter(o=>o.esBajante);

  return (
    <div className="card">
      <div className="card-h">
        <span className="card-t">🌧️ Diseño Red Agua Lluvias</span>
      </div>
      <div className="scroll-top" style={{padding:'16px'}}>
        <div className="scroll-inner" style={{minWidth:'max-content'}}>
          <table className="tbl" style={{fontSize:13}}>
          <thead>
            <tr>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Tramo<br/>o Ramal</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Piso</th>
<th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Inicio</th>
               <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Fin</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center',minWidth:100}}>Puntos de conexión</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Q<br/><small>LPS</small></th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center',minWidth:70}}>Maning</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>S %</th>
              <th className="col-h ok" colSpan={3} style={{textAlign:'center',fontSize:11}}>Diámetro</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Qo<br/><small>LPS</small></th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Vo<br/><small>m/s</small></th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Q/Qo</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Vreal<br/><small>m/s</small></th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Chequeo<br/><small>0.45&lt;Vr&lt;4.0</small></th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Yc<br/><small>mm</small></th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Yn<br/><small>mm</small></th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Froude</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Tipo de<br/>Flujo</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Ymax= 0.75D mm</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Yn vs Yc</th>
              <th className="col-h ven" colSpan={2} style={{textAlign:'center',fontSize:11}}>Fuerza Tractiva</th>
            </tr>
            <tr>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Calc.<br/>pulg</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Diseño<br/>pulgada</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Interno<br/>mm</th>
              <th className="col-h ven" style={{fontSize:10,textAlign:'center'}}>Vr<br/><small>kg/m2</small></th>
              <th className="col-h ven" style={{fontSize:10,textAlign:'center'}}>&gt;0.15</th>
            </tr>
          </thead>
          <tbody>
            {tramosLl.map(t=>{
const n=t.nmaning;
const sVal=t.sPercent;
const S=sVal!=null&&sVal>0?sVal/100:null;
const Q=t.qLps||0;
              const dSel=DIAM_OPTIONS.find(d=>d.pulg===(t.diamDisPulg||0))||null;
      let DcalcPulg=0,DdisPulg=dSel?dSel.pulg:0,DintMm=dSel?dSel.mm:0,chequeo='—';
      let Qo=0,Vo=0,qqo=0,Vreal=0,chequeoV='—';
      let Yc=0,Yn=0,Froude=0,tipoFlujo='—',Ymax=0,chequeoYn='—';
      let fuerzaTractiva=0,chequeoFT='—';
if(Q>0&&S!=null&&S>0&&n!=null&&n>0){
DcalcPulg=Math.round(diametromaning(Q/1000,n,S)*1000/25.4*100)/100;
if(DdisPulg>0){chequeo=DcalcPulg<=DdisPulg?'O.K.':'NO CUMPLE';}
}
if(Q>0&&S!=null&&S>0&&n!=null&&n>0&&DintMm>0){
Qo=Math.round(caudalTuboLleno(DintMm/1000,n,S)*1000*100)/100;
Vo=Math.round(velocidadTuboLleno(DintMm/1000,n,S)*100)/100;
qqo=Qo>0?Math.round(Q/Qo*100)/100:0;
const q=Qo>0?Q/Qo:0;
const rel=relacionesHidraulicas(q);
Vreal=Math.round(rel.v_V0*Vo*100)/100;
chequeoV=(Vreal<V_MIN||Vreal>V_MAX)?'NO CUMPLE':'O.K.';
const Rh=rel.Rh_D*DintMm;
Yc=Math.round(tiranteCritico(DintMm/1000,Q/1000)*1000*100)/100;
Yn=Math.round(rel.h_D*DintMm*100)/100;
Ymax=Math.round(DintMm*Y_D_MAX*100)/100;
chequeoYn=Math.max(Yc,Yn)<Ymax?'O.K.':'NO CUMPLE';
Froude=Math.round(numeroFroude(Vreal,rel.Rh_D*DintMm/1000)*100)/100;
tipoFlujo=tipoRegimen(Froude)==='Supercritico'?'Supercrítico':tipoRegimen(Froude)==='Subcritico'?'Subcrítico':'Crítico';
fuerzaTractiva=Math.round(1000*Rh/1000*S*100)/100;
chequeoFT=fuerzaTractiva>FUERZA_TRACTIVA_MIN?'O.K.':'NO CUMPLE';
}
const descIds=parseDescripcion(t.descripcion);
              return(
                <tr key={t._key}>
                  <td className="c"><input className="ni" style={{width:72,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.id} onChange={e=>updTramoLL(t._key,'id',e.target.value)}/></td>
                  <td className="c"><select className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.piso||''} onChange={e=>updTramoLL(t._key,'piso',parseInt(e.target.value)||0)}><option value="">—</option>{pisos.map(p=><option key={p.id} value={p.n}>{pisoCorto(p.n)}</option>)}</select></td>
                  <td className="c"><input className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.desde||''} onChange={e=>updTramoLL(t._key,'desde',e.target.value)}/></td>
                  <td className="c"><input className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.hasta||''} onChange={e=>updTramoLL(t._key,'hasta',e.target.value)}/></td>
                  <td className="c" style={{minWidth:120,maxWidth:200}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(48px, 1fr))',gap:3,fontSize:10}}>
                      {bajantes.map(b=>{
                        const sel=descIds.includes(b._key);
                        return(<span key={b._key} onClick={()=>{const next=sel?descIds.filter(x=>x!==b._key):[...descIds,b._key];updTramoLL(t._key,'descripcion',next.join('+'));}} style={{padding:'3px 6px',borderRadius:8,cursor:'pointer',background:sel?'var(--ll)':'var(--bg4)',color:sel?'#fff':'var(--txt)',border:`1.5px solid ${sel?'var(--ll)':'var(--line)'}`,fontWeight:sel?600:400,textAlign:'center',userSelect:'none',boxShadow:sel?'0 1px 3px rgba(0,0,0,0.12)':'none'}}>{b.id || b._key}</span>);
                      })}
                    </div>
                  </td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:12,textAlign:'center'}} defaultValue={t.qLps||''} key={t._key+'q'} onChange={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoLL(t._key,'qLps',v);}} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoLL(t._key,'qLps',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:12,textAlign:'center'}} defaultValue={t.nmaning||''} key={t._key+'nm'} onChange={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoLL(t._key,'nmaning',v);}} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoLL(t._key,'nmaning',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:36,padding:'2px 3px',fontSize:10,textAlign:'center'}} defaultValue={sVal||''} key={t._key+'sp'} onChange={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoLL(t._key,'sPercent',v);}} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoLL(t._key,'sPercent',v);}}/></td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontSize:10}}>{DcalcPulg>0?DcalcPulg.toFixed(2)+'"':'—'}</td>
                  <td className="c">
                    <select className="ni" style={{width:56,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.diamDisPulg||''} onChange={e=>updTramoLL(t._key,'diamDisPulg',parseFloat(e.target.value))}>
                      <option value="">—</option>
                      {DIAM_OPTIONS.map(d=><option key={d.pulg} value={d.pulg}>{d.label}</option>)}
                    </select>
                  </td>
                  <td className="c">{DintMm>0?DintMm:'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{Qo>0?Qo.toFixed(2):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{Vo>0?Vo.toFixed(2):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{qqo>0?qqo.toFixed(2):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{Vreal>0?Vreal.toFixed(2):'—'}</td>
                  <td className="c">{chequeoV}</td>
                  <td className="c">{Yc>0?Yc.toFixed(2):'—'}</td>
                  <td className="c">{Yn>0?Yn.toFixed(2):'—'}</td>
                  <td className="c">{Froude>0?Froude.toFixed(2):'—'}</td>
                  <td className="c" style={{fontSize:10}}>{tipoFlujo}</td>
                  <td className="c">{Ymax>0?Ymax.toFixed(2):'—'}</td>
                  <td className="c">{chequeoYn}</td>
                  <td className="c">{fuerzaTractiva>0?fuerzaTractiva.toFixed(2):'—'}</td>
                  <td className="c">{chequeoFT}</td>
                  <td className="c">
                    <button onClick={()=>delTramoLL(t._key)} style={{background:'var(--err-bg)',border:'1px solid var(--err-b)',borderRadius:'var(--r)',color:'var(--err)',padding:'1px 5px',fontSize:10,cursor:'pointer'}}>✕</button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={28} style={{textAlign:'center',padding:'8px 0'}}>
                <button className="btn-xs" onClick={addTramoLL} style={{width:'auto',display:'inline-flex',alignItems:'center',gap:4}}>+ Agregar tramo</button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
