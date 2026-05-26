import { useSanitario } from "../context/SanitarioContext";
import { calcUDparcial, calcUDacumulado } from "./utils";
import { DIAM_OPTIONS } from "./constants";
import { parseDescripcion } from "../utils/parseDescripcion";
import { relacionesHidraulicas, caudalTuboLleno } from "../utils/calcSanitario";

export default function CalculoHidraulicoSanitario() {
  const { tramosSan, udBase } = useSanitario();

  const acumMap = calcUDacumulado(tramosSan, udBase);

  return (
    <div className="card">
      <div className="card-h">
        <span className="card-t">♻️ Cálculo de Vreal, Y real, Rh real</span>
      </div>
      <div className="card-b" style={{overflowX:'auto'}}>
        <table className="tbl" style={{fontSize:13}}>
          <thead>
            <tr>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Tramo</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Q/Q0</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>V/Vo</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Y/D</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>α</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Rh/D</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Rh<br/>mm</th>
            </tr>
          </thead>
          <tbody>
            {tramosSan.map(t=>{
              const n=t.nmaning||0.009;
              const sVal=t.sPercent||2;
              const S=sVal/100;
              const nSalidas=t.nSalidas||2;
              const K=Math.round(nSalidas<=1?1:1/Math.sqrt(nSalidas-1)*100)/100;
              const udPropias=calcUDparcial(t,udBase);
              const descIds=parseDescripcion(t.descripcion);
              const udOtros=descIds.reduce((s,id)=>s+(acumMap[id]||0),0);
              const udAcum=udPropias+udOtros;
              const Q=udAcum>0?Math.round(K*(udAcum<240?0.1163*Math.pow(udAcum,0.6875):0.074*Math.pow(udAcum,0.7504))*1000)/1000:0;
              const dSel=DIAM_OPTIONS.find(d=>d.pulg===(t.diamDisPulg||0))||null;
              const DintMm=dSel?dSel.mm:0;

let Qo=0, qqo=0, v=0, y_D=0, alpha=0, Rh_D=0, Rh=0;

if(Q>0&&S>0&&n>0&&DintMm>0){
Qo=Math.round(caudalTuboLleno(DintMm/1000,n,S)*1000*100)/100;
const q=Q/Qo;
qqo=Math.round(q*100)/100;
const rel=relacionesHidraulicas(q);
v=rel.v_V0; y_D=rel.h_D; alpha=rel.alpha; Rh_D=rel.Rh_D; Rh=Rh_D*DintMm;
}

              return(
                <tr key={t.id}>
                  <td className="c"><span className="sigla" style={{fontSize:10}}>{t.id}</span></td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--txt)'}}>{qqo>0?qqo.toFixed(4):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{v>0?v.toFixed(6):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{y_D>0?y_D.toFixed(6):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{alpha>0?alpha.toFixed(6):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{Rh_D>0?Rh_D.toFixed(6):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600,color:'var(--txt)'}}>{Rh>0?Rh.toFixed(4):'—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
