import { useSanitario } from "../context/SanitarioContext";
import { calcUDparcial, calcUDacumulado } from "./utils";

const DIAM_BAN=[
  { pulg:1.5, mm:42.68, nom:'1½"' },
  { pulg:2, mm:54.48, nom:'2"' },
  { pulg:3, mm:76.20, nom:'3"' },
  { pulg:4, mm:107.70,nom:'4"' },
  { pulg:6, mm:160.04,nom:'6"' },
  { pulg:8, mm:213.20,nom:'8"' },
];

const DIAM_VENT=[
  { pulg:1.5, mm:42.68, nom:'1½"' },
  { pulg:2, mm:54.48, nom:'2"' },
  { pulg:3, mm:76.20, nom:'3"' },
  { pulg:4, mm:107.70,nom:'4"' },
  { pulg:6, mm:160.04,nom:'6"' },
];

export default function BajantesTable() {
  const { tramosSan, udBase, updTramoSan } = useSanitario();

  return (
    <div className="card">
      <div className="card-h">
        <span className="card-t">📊 Bajantes A.N. y Ventilación</span>
        <span className="card-s">Hoja 3 · Capacidad · NTC 1500</span>
      </div>
      <div className="card-b" style={{overflowX:'auto'}}>
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
              <th className="col-h ven" colSpan={2} style={{textAlign:'center'}}>D</th>
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
                const rVal=t.bajR!==undefined?t.bajR:(7/24);
                const rStr=Math.abs(rVal-7/24)<0.001?'7/24':'1/4';
                const udParcial=calcUDparcial(t,udBase);
                const descArr=(t.recibeDe||[]).join('+');
                const udOtros=(t.recibeDe||[]).reduce((s,id)=>s+(acumMapALL[id]||0),0);
                const udAcum=udParcial+udOtros;
                const n=t.nmaning!==undefined?t.nmaning:0;
                const Q=(udAcum>0?0.1163*Math.pow(udAcum,0.6875):0);
                const DcalcMm=(Q>0?Math.pow(Q/(1.754*Math.pow(rVal,5/3)),3/8)*25.4:0);
                const DcalcPulg=DcalcMm/25.4;
                const Dprop=DIAM_BAN.find(d=>Number(d.pulg)===Number(t.bajDprop))||null;
                const DpropPulg=Dprop?Dprop.pulg:0;
                const DpropMm=Dprop?Dprop.mm:0;
                const chequeo=(DcalcMm>0&&DpropPulg>0)?(DcalcPulg<=DpropPulg?'O.K.':'NO CUMPLE'):'—';
                const QmaxB=(DpropPulg>0?1.754*Math.pow(rVal,5/3)*Math.pow(DpropPulg,8/3):0);
                const Vt=Math.round((DpropPulg>0&&Q>0?2.76*Math.pow(Q/DpropPulg,0.4):0)*100)/100;
                const Ltcalc=(Vt>0?0.17*Vt*Vt:0);
                const Ltmin=(DpropPulg>0?Math.max(Ltcalc,10*DpropPulg*2.54/100):0);
                const fDarcy=t.bajFDarcy!==undefined?t.bajFDarcy:0.025;
                const Vair=Vt;
                const Qair=(DpropPulg>0?1000*Vair*(17/24)*(Math.PI/4)*Math.pow(DpropPulg*2.54/100,2):0);
                const Lbaj=t.bajLong||3;
                const DventPulgRaw=(Lbaj>0&&Qair>0?Math.pow((Lbaj*fDarcy*Qair*Qair)/3.25,1/5):0);
                const DventMm=DventPulgRaw*25.4;
                const DventCalcPulg=DventMm/25.4;
                const DventProp=DIAM_VENT.find(d=>Number(d.pulg)===Number(t.ventDprop))||null;
                const DventPropPulg=DventProp?DventProp.pulg:0;
                return(
                  <tr key={t.id}>
                    <td><span className="sigla" style={{fontSize:10}}>{t.id}</span></td>
                    <td className="c" style={{minWidth:80}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" className="ni" style={{width:32,padding:'2px 3px',fontSize:10,textAlign:'center'}} value={t.pisoDesde!==undefined?String(t.pisoDesde):(t.piso?'2':'1')} onChange={e=>updTramoSan(t.id,'pisoDesde',parseInt(e.target.value.replace(/\D/g,''))||0)}/>
                        <span style={{color:'var(--txt3)',fontSize:9}}>-</span>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" className="ni" style={{width:32,padding:'2px 3px',fontSize:10,textAlign:'center'}} value={t.pisoHasta!==undefined?String(t.pisoHasta):'1'} onChange={e=>updTramoSan(t.id,'pisoHasta',parseInt(e.target.value.replace(/\D/g,''))||0)}/>
                      </div>
                    </td>
                    <td className="c" style={{fontFamily:'var(--mono)'}}>{udParcial}</td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--san)'}}>{udAcum}</td>
                    <td className="c">
                      <select className="ni" style={{width:44,padding:'2px 3px',fontSize:10}}
                        value={rStr} onChange={e=>updTramoSan(t.id,'bajR',e.target.value==='7/24'?7/24:1/4)}>
                        <option value="7/24">7/24</option>
                        <option value="1/4">1/4</option>
                      </select>
                    </td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600}}>{Q>0?Q.toFixed(3):'—'}</td>
                    <td className="c" style={{fontSize:10}}>{n}</td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontSize:10}}>{DcalcMm>0?DcalcPulg.toFixed(2)+'"':'—'}</td>
                    <td className="c">
                      <select className="ni" style={{width:54,padding:'2px 3px',fontSize:11,textAlign:'center'}} value={t.bajDprop||''} onChange={e=>updTramoSan(t.id,'bajDprop',parseFloat(e.target.value)||0)}>
                        <option value="">—</option>
                        {DIAM_BAN.map(d=><option key={d.pulg} value={d.pulg}>{d.nom}</option>)}
                      </select>
                    </td>
                    <td className="c" style={{color:chequeo==='O.K.'?'var(--ok)':'var(--err)'}}>{chequeo}</td>
                    <td className="c" style={{fontFamily:'var(--mono)'}}>{QmaxB>0?QmaxB.toFixed(2):'—'}</td>
                    <td className="c">{Vt>0?Vt.toFixed(2):'—'}</td>
                    <td className="c">{Ltcalc>0?Ltcalc.toFixed(2):'—'}</td>
                    <td className="c">{Ltmin>0?Ltmin.toFixed(2):'—'}</td>
                    <td className="c">{Vair>0?Vair.toFixed(2):'—'}</td>
                    <td className="c">
                      <input type="number" className="ni" style={{width:46,padding:'2px 3px',fontSize:10}} value={fDarcy} step="0.001" min="0" onChange={e=>updTramoSan(t.id,'bajFDarcy',parseFloat(e.target.value)||0.025)}/>
                    </td>
                    <td className="c" style={{fontFamily:'var(--mono)'}}>{Qair>0?Qair.toFixed(2):'—'}</td>
                    <td className="c">
                      <input type="text" inputMode="decimal" className="ni" style={{width:46,padding:'2px 3px',fontSize:10,textAlign:'center'}} value={t.bajLong!==undefined?String(t.bajLong):'3'} onChange={e=>{const v=e.target.value.replace(/[^0-9.]/g,'');updTramoSan(t.id,'bajLong',v===''?0:parseFloat(v)||3);}}/>
                    </td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontSize:10}}>{DventMm>0?DventCalcPulg.toFixed(2)+'"':'—'}</td>
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
  );
}
