import { useSanitario } from "../context/SanitarioContext";
import { pisoCorto, DIAM_BAN, DIAM_VENT } from "./constants";
import { calcUDparcial, calcUDacumulado } from "./utils";
import { parseDecimalInput } from "../utils/parseDecimal";
import { calcularBajanteVentilacion, caudalHunterLPS } from "../utils/calcSanitario";

export default function BajantesTable() {
  const { tramosSan, udBase, pisos, updTramoSan } = useSanitario();

  return (
    <div className="card">
      <div className="card-h">
          <span className="card-t">📊 Bajantes A.N. y Ventilación</span>
      </div>
      <div className="scroll-top" style={{padding:'16px'}}>
        <div className="scroll-inner" style={{minWidth:'max-content'}}>
        <table className="tbl" style={{fontSize:13}}>
          <thead>
            <tr>
              <th className="col-h san" colSpan={7} style={{textAlign:'center'}}>INFORMACIÓN COMÚN</th>
              <th className="col-h ok" colSpan={7} style={{textAlign:'center'}}>BAJANTES A.N.</th>
              <th className="col-h ven" colSpan={6} style={{textAlign:'center'}}>TUBERIA DE VENTILACION</th>
            </tr>
            <tr>
              <th className="col-h san" rowSpan={2} style={{textAlign:'center'}}>Bajante<br/>No.</th>
              <th className="col-h san" rowSpan={2} style={{textAlign:'center'}}>Piso</th>
              <th className="col-h san" colSpan={2} style={{textAlign:'center'}}>Unidades de<br/>Descarga</th>
              <th className="col-h san" rowSpan={2} style={{textAlign:'center'}}>r</th>
              <th className="col-h san" rowSpan={2} style={{textAlign:'center'}}>Q<br/><small>lps</small></th>
              <th className="col-h san" rowSpan={2} style={{textAlign:'center',minWidth:70}}>Maning</th>
              <th className="col-h ok" colSpan={2} style={{textAlign:'center'}}>Diametro</th>
              <th className="col-h ok" rowSpan={2} style={{textAlign:'center'}}>Chequeo<br/><small>Dcal&lt;Dprop</small></th>
              <th className="col-h ok" rowSpan={2} style={{textAlign:'center'}}>Q max<br/><small>Bajante</small></th>
              <th className="col-h ok" rowSpan={2} style={{textAlign:'center'}}>Velocidad<br/>Terminal<br/><small>m/s</small></th>
              <th className="col-h ok" colSpan={2} style={{textAlign:'center'}}>Longitud<br/>Terminal (m)</th>
              <th className="col-h ven" rowSpan={2} style={{textAlign:'center'}}>Velocidad<br/>Aire<br/><small>m/s</small></th>
              <th className="col-h ven" rowSpan={2} style={{textAlign:'center'}}>ƒ<br/><small>Darcy</small></th>
              <th className="col-h ven" rowSpan={2} style={{textAlign:'center'}}>Q aire<br/><small>LPS</small></th>
              <th className="col-h ven" rowSpan={2} style={{textAlign:'center'}}>Longitud<br/>bajante<br/><small>m</small></th>
              <th className="col-h ven" colSpan={2} style={{textAlign:'center'}}>Diámetro</th>
            </tr>
            <tr>
              <th className="col-h san" style={{textAlign:'center'}}>Parcial<br/><small>UD</small></th>
              <th className="col-h san" style={{textAlign:'center'}}>Acum.<br/><small>UD</small></th>
              <th className="col-h ok" style={{textAlign:'center'}}>Calculado<br/><small>Pulg.</small></th>
              <th className="col-h ok" style={{textAlign:'center'}}>Propuesto<br/><small>Pulg.</small></th>
              <th className="col-h ok" style={{textAlign:'center'}}>calculada</th>
              <th className="col-h ok" style={{textAlign:'center'}}>Minima</th>
              <th className="col-h ven" style={{textAlign:'center'}}>Calculado<br/><small>Pulg.</small></th>
              <th className="col-h ven" style={{textAlign:'center'}}>Propuesto<br/><small>Pulg.</small></th>
            </tr>
          </thead>
          <tbody>
            {(()=>{
              const acumMapALL=calcUDacumulado(tramosSan,udBase);
              const banTramos=tramosSan.filter(t=>t.esBajante);
              if(banTramos.length===0) return <tr><td colSpan={20} style={{textAlign:'center',color:'var(--txt3)',padding:20}}>No hay bajantes definidos. Marque un tramo como "Bajante" en la tabla de Cálculo UD.</td></tr>;
              return banTramos.map(t=>{
const rVal=t.bajR;
const rStr=rVal!=null?(Math.abs(rVal-7/24)<0.001?'7/24':'1/4'):null;
const udParcial=calcUDparcial(t,udBase);
const descArr=(t.recibeDe||[]).join('+');
const udOtros=(t.recibeDe||[]).reduce((s,id)=>s+(acumMapALL[id]||0),0);
const udAcum=udParcial+udOtros;
const n=t.nmaning;
const res=calcularBajanteVentilacion({
bajante:t.id,
pisos:`${t.pisoDesde||''}-${t.pisoHasta||''}`,
UD_propias:udParcial,
UD_otros:udOtros,
UD_acum:udAcum,
r:t.bajR,
n:t.nmaning||0.009,
bajDprop:t.bajDprop||0,
bajLong:t.bajLong||3,
bajFDarcy:t.bajFDarcy||0.025,
ventDprop:t.ventDprop||0,
});
const Q=res.Q_Ls;
const DcalcPulg=res.Dcalc_pulg;
const chequeo=res.chequeoDiam;
const QmaxB=res.QmaxBajante;
const Vt=res.Vt;
const Ltcalc=res.Lt_calc;
const Ltmin=res.Lt_min;
const fDarcy=t.bajFDarcy;
const Vair=res.V_aire;
const Qair=res.Q_aire_Ls;
const Lbaj=res.longBajante_m;
const DventCalcPulg=res.D_vent_calc_pulg;
const DventPropPulg=res.D_vent_prop_pulg;
const chequeoVent=res.D_vent_prop_pulg>0?(res.D_vent_calc_pulg<=res.D_vent_prop_pulg?'O.K.':'NO CUMPLE'):(res.D_vent_calc_pulg>0?'Sin diseño':'—');
                return(
                  <tr key={t.id}>
                    <td className="c"><span className="sigla" style={{fontSize:10}}>{t.id}</span></td>
                    <td className="c" style={{minWidth:80}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>
                        <select className="ni" style={{width:50,padding:'2px 3px',fontSize:10,textAlign:'center'}} value={t.pisoDesde||''} onChange={e=>updTramoSan(t.id,'pisoDesde',parseInt(e.target.value)||0)}>
                          <option value="">—</option>
                          {pisos.map(p=><option key={p.id} value={p.n}>{pisoCorto(p.n)}</option>)}
                        </select>
                        <span style={{color:'var(--txt3)',fontSize:9}}>-</span>
                        <select className="ni" style={{width:50,padding:'2px 3px',fontSize:10,textAlign:'center'}} value={t.pisoHasta||''} onChange={e=>updTramoSan(t.id,'pisoHasta',parseInt(e.target.value)||0)}>
                          <option value="">—</option>
                          {pisos.map(p=><option key={p.id} value={p.n}>{pisoCorto(p.n)}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="c" style={{fontFamily:'var(--mono)'}}>{udParcial}</td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontWeight:700}}>{udAcum}</td>
                    <td className="c">
                      <select className="ni" style={{width:44,padding:'2px 3px',fontSize:10}}
                        value={rStr} onChange={e=>updTramoSan(t.id,'bajR',e.target.value==='7/24'?7/24:1/4)}>
                        <option value="7/24">7/24</option>
                        <option value="1/4">1/4</option>
                      </select>
                    </td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600}}>{Q>0?Q.toFixed(3):'—'}</td>
                    <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:50,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={n||''} key={t.id+'nm'} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoSan(t.id,'nmaning',v);}}/></td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontSize:10}}>{DcalcPulg>0?DcalcPulg.toFixed(2)+'"':'—'}</td>
                    <td className="c">
                      <select className="ni" style={{width:54,padding:'2px 3px',fontSize:11,textAlign:'center'}} value={t.bajDprop||''} onChange={e=>updTramoSan(t.id,'bajDprop',parseFloat(e.target.value)||0)}>
                        <option value="">—</option>
                        {DIAM_BAN.map(d=><option key={d.pulg} value={d.pulg}>{d.nom}</option>)}
                      </select>
                    </td>
                    <td className="c">{chequeo}</td>
                    <td className="c" style={{fontFamily:'var(--mono)'}}>{QmaxB>0?QmaxB.toFixed(2):'—'}</td>
                    <td className="c">{Vt>0?Vt.toFixed(2):'—'}</td>
                    <td className="c">{Ltcalc>0?Ltcalc.toFixed(2):'—'}</td>
                    <td className="c">{Ltmin>0?Ltmin.toFixed(2):'—'}</td>
                    <td className="c">{Vair>0?Vair.toFixed(2):'—'}</td>
                    <td className="c">
                      <input type="text" inputMode="decimal" className="ni" style={{width:46,padding:'2px 3px',fontSize:10,textAlign:'center'}} defaultValue={fDarcy||''} key={t.id+'fd'} onBlur={e=>{const v=parseDecimalInput(e.target.value);if(v!==null)updTramoSan(t.id,'bajFDarcy',v);}}/>
                    </td>
                    <td className="c" style={{fontFamily:'var(--mono)'}}>{Qair>0?Qair.toFixed(2):'—'}</td>
                    <td className="c">
                      <input type="text" inputMode="decimal" className="ni" style={{width:46,padding:'2px 3px',fontSize:10,textAlign:'center'}} value={t.bajLong!==undefined?String(t.bajLong):'3'} onChange={e=>{const v=e.target.value.replace(/[^0-9.]/g,'');updTramoSan(t.id,'bajLong',v===''?0:parseFloat(v)||3);}}/>
                    </td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontSize:10}}>{DventCalcPulg>0?DventCalcPulg.toFixed(2)+'"':'—'}</td>
                    <td className="c">
                      <select className="ni" style={{width:54,padding:'2px 3px',fontSize:11,textAlign:'center'}} value={t.ventDprop||''} onChange={e=>updTramoSan(t.id,'ventDprop',parseFloat(e.target.value)||0)}>
                        <option value="">—</option>
                        {DIAM_VENT.map(d=><option key={d.pulg} value={d.pulg}>{d.nom}</option>)}
                      </select>
                    </td>
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
