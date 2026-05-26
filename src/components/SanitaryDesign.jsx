import { useSanitario } from "../context/SanitarioContext";
import { calcUDparcial, calcUDacumulado } from "./utils";
import { pisoLbl, pisoCorto, DIAM_OPTIONS, V_MIN, V_MAX, Y_D_MAX, FR_SUBCRITICO, FR_SUPERCRITICO, FUERZA_TRACTIVA_MIN } from "./constants";
import { parseDecimalInput } from "../utils/parseDecimal";
import { parseDescripcion } from "../utils/parseDescripcion";
import { relacionesHidraulicas, caudalTuboLleno, velocidadTuboLleno, diametromaning, tipoRegimen, numeroFroude, tiranteCritico, caudalHunterLPS, factorSimultaneidad, GRAVEDAD } from "../utils/calcSanitario";

export default function DisenosSanitarios() {
const { tramosSan, udBase, pisos, updTramoSan } = useSanitario();

const pisosSelect = pisos.filter(p => p.tipo !== 'cubierta');

return (
  <div className="card">
    <div className="card-h">
      <span className="card-t">📊 Diseño Red Sanitaria</span>
    </div>
    <div className="scroll-top" style={{padding:'16px'}}>
      <div className="scroll-inner" style={{minWidth:'max-content'}}>
        <table className="tbl" style={{fontSize:13}}>
          <thead>
            <tr>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Tramo<br/>o Ramal</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Piso</th>
              <th className="col-h san" colSpan={4} style={{textAlign:'center',fontSize:11}}>UNIDADES DE DESCARGA</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>#<br/>Salidas</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>K</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Q<br/><small>LPS</small></th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center',minWidth:70}}>Maning</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>S %</th>
              <th className="col-h ok" colSpan={3} style={{textAlign:'center',fontSize:11}}>Diámetro</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Qo<br/><small>LPS</small></th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Vo<br/><small>m/s</small></th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Q/Qo</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Vreal<br/><small>m/s</small></th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Chequeo<br/><small>0.45&lt;Vr&lt;4.0</small></th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Yc<br/><small>mm</small></th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Yn<br/><small>mm</small></th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Froude</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Tipo de<br/>Flujo</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Ymax= 0.75D mm</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Yn vs Yc</th>
              <th className="col-h ven" colSpan={2} style={{textAlign:'center',fontSize:11}}>Fuerza Tractiva</th>
            </tr>
            <tr>
              <th className="col-h san" style={{fontSize:10,textAlign:'center'}}>Propias</th>
              <th className="col-h san" style={{fontSize:10,textAlign:'center'}}>Otros<br/>Ramales</th>
              <th className="col-h san" style={{fontSize:10,textAlign:'center'}}>Ramas<br/>conectadas</th>
              <th className="col-h san" style={{fontSize:10,textAlign:'center'}}>Total</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Calc.<br/>pulg</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Diseño<br/>pulgada</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Interno<br/>mm</th>
              <th className="col-h ven" style={{fontSize:10,textAlign:'center'}}>Vr<br/><small>kg/m2</small></th>
              <th className="col-h ven" style={{fontSize:10,textAlign:'center'}}>&gt;0.15</th>
            </tr>
          </thead>
          <tbody>
            {(()=>{
              const acumMap=calcUDacumulado(tramosSan,udBase);
              return tramosSan.map(t=>{
                const udPropias=calcUDparcial(t,udBase);
                const descIds=parseDescripcion(t.descripcion);
                const udOtros=descIds.reduce((s,id)=>s+(acumMap[id]||0),0);
                const udAcum=udPropias+udOtros;
        const nSalidas=t.nSalidas;
const K=nSalidas!=null&&nSalidas>0?Math.round(factorSimultaneidad(nSalidas)*100)/100:null;
const n=t.nmaning;
const sVal=t.sPercent;
const S=sVal!=null&&sVal>0?sVal/100:null;
const Q=udAcum>0&&K!=null?Math.round(caudalHunterLPS(udAcum,K)*1000)/1000:null;
                const dSel=DIAM_OPTIONS.find(d=>d.pulg===(t.diamDisPulg||0))||null;
        let DcalcPulg=0,DdisPulg=dSel?dSel.pulg:0,DintMm=dSel?dSel.mm:0,chequeo='—';
        let Qo=0,Vo=0,qqo=0,Vreal=0,chequeoV='—';
        let Yc=0,Yn=0,Froude=0,tipoFlujo='—',Ymax=0,chequeoYn='—';
        let fuerzaTractiva=0,chequeoFT='—';
if(Q!=null&&Q>0&&S!=null&&S>0&&n!=null&&n>0){
DcalcPulg=Math.round(diametromaning(Q/1000,n,S)*1000/25.4*100)/100;
if(DdisPulg>0){chequeo=DcalcPulg<=DdisPulg?'O.K.':'NO CUMPLE';}
}
if(Q!=null&&Q>0&&S!=null&&S>0&&n!=null&&n>0&&DintMm>0){
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
        const otrosTramos=tramosSan.filter(o=>o.id!==t.id && o.piso===t.piso);
        return(
        <tr key={t.id}>
          <td className="c"><span className="sigla" style={{fontSize:10}}>{t.id}</span></td>
          <td className="c">
          <select className="ni" style={{width:50,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.piso} onChange={e=>updTramoSan(t.id,'piso',parseInt(e.target.value))}>
          {pisosSelect.map(p=><option key={p.id} value={p.n}>{pisoCorto(p.n)}</option>)}
          </select>
          </td>
          <td className="c" style={{fontFamily:'var(--mono)'}}>{udPropias}</td>
          <td className="c" style={{fontFamily:'var(--mono)',color:'var(--txt3)'}}>{udOtros||'—'}</td>
          <td className="c" style={{minWidth:120,maxWidth:200}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(48px, 1fr))',gap:3,fontSize:10}}>
          {otrosTramos.map(o=>{
          const sel=descIds.includes(o.id);
          return(<span key={o.id} onClick={()=>{const next=sel?descIds.filter(x=>x!==o.id):[...descIds,o.id];updTramoSan(t.id,'descripcion',next.join('+'));}} style={{padding:'3px 6px',borderRadius:8,cursor:'pointer',background:sel?'var(--san)':'var(--bg4)',color:sel?'#fff':'var(--txt)',border:`1.5px solid ${sel?'var(--san)':'var(--line)'}`,fontWeight:sel?600:400,textAlign:'center',userSelect:'none',boxShadow:sel?'0 1px 3px rgba(0,0,0,0.12)':'none'}}>{o.id}</span>);
          })}
          </div>
          </td>
          <td className="c" style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:13}}>{udAcum}</td>
          <td className="c"><input type="text" inputMode="numeric" pattern="[0-9]*" className="ni" style={{width:36,padding:'2px 3px',fontSize:10,textAlign:'center'}} value={t.nSalidas!==undefined&&t.nSalidas!==0?String(t.nSalidas):''} onChange={e=>{const v=e.target.value.replace(/\D/g,'');updTramoSan(t.id,'nSalidas',v===''?0:parseInt(v)||0);}}/></td>
          <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600}}>{K!=null?K.toFixed(2):'—'}</td>
          <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600}}>{Q>0?Q.toFixed(3):'—'}</td>
          <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:70,padding:'2px 4px',fontSize:12,textAlign:'center'}} defaultValue={t.nmaning||''} key={t.id+'nm'} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoSan(t.id,'nmaning',v);}}/></td>
          <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:36,padding:'2px 3px',fontSize:10,textAlign:'center'}} defaultValue={sVal||''} key={t.id+'sp'} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoSan(t.id,'sPercent',v);}}/></td>
          <td className="c" style={{fontFamily:'var(--mono)',fontSize:10}}>{DcalcPulg>0?DcalcPulg.toFixed(2)+'"':'—'}</td>
          <td className="c">
          <select className="ni" style={{width:56,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.diamDisPulg||''} onChange={e=>updTramoSan(t.id,'diamDisPulg',parseFloat(e.target.value))}>
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
        </tr>
        );
      });
      })()}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
