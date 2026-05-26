import { useSanitario } from "../context/SanitarioContext";
import { DIAM_OPTIONS } from "./constants";

export default function CalculoHidraulicoLluvias() {
  const { tramosLl } = useSanitario();

  return (
    <div style={{display:'none'}}>
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
                Qo=Math.round(0.312*Math.pow(DintMm/1000,8/3)*Math.sqrt(S)/n*1000*100)/100;
                const q=Q/Qo;
                qqo=Math.round(q*100)/100;
                v=q<=0.06?Math.pow(10,0.029806+0.29095*Math.log10(q)):q<=0.26?Math.pow(10,0.013778+0.28597*Math.log10(q)):Math.pow(10,0.021763+0.289951*Math.log10(q));
                y_D=q<0.11?0.3827+0.0645*Math.log(q):q<0.21?0.60025+0.15471*Math.log(q):0.225+0.667*q;
                alpha=2*Math.acos(1-2*y_D);
                Rh_D=0.25*(1-Math.sin(alpha)/alpha);
                Rh=Rh_D*DintMm;
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
    </div>
  );
}
