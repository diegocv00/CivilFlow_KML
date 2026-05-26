import { useSanitario } from "../context/SanitarioContext";
import { DIAM_OPTIONS } from "./constants";
import { relacionesHidraulicas, caudalTuboLleno } from "../utils/calcSanitario";

export default function CalculoHidraulicoLluvias() {
  const { tramosLl } = useSanitario();

  return (
    <div className="card">
      <div className="card-h">
        <span className="card-t">🌧️ Cálculo de Vreal, Y real, Rh real</span>
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
            {tramosLl.map(t=>{
              const n=t.nmaning||0.009;
              const sVal=t.sPercent||2;
              const S=sVal/100;
              const Q=t.qLps||0;
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
                <tr key={t._key}>
                  <td className="c"><span className="sigla" style={{fontSize:10}}>{t.id || t._key}</span></td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:700}}>{qqo>0?qqo.toFixed(4):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{v>0?v.toFixed(6):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{y_D>0?y_D.toFixed(6):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{alpha>0?alpha.toFixed(6):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)'}}>{Rh_D>0?Rh_D.toFixed(6):'—'}</td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600}}>{Rh>0?Rh.toFixed(4):'—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
  );
}
