import { useSanitario } from "../context/SanitarioContext";
import { calcUDparcial, calcUDacumulado } from "./utils";
import { pisoLbl, DIAM_OPTIONS } from "./constants";

export default function DisenosSanitarios() {
  const { tramosSan, udBase, pisos, updTramoSan } = useSanitario();

  return (
    <div className="card">
      <div className="card-h">
          <span className="card-t">📊 Diseño Red Sanitaria</span>
      </div>
      <div className="card-b" style={{overflowX:'auto'}}>
        <table className="tbl" style={{fontSize:13}}>
          <thead>
            <tr>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Tramo<br/>o Ramal</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Piso</th>
              <th className="col-h san" colSpan={4} style={{textAlign:'center',fontSize:11}}>UNIDADES DE DESCARGA</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>No.<br/>Salidas</th>
              <th className="col-h" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Coeficiente<br/>K</th>
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
                const descIds=(t.descripcion||'').split('+').map(s=>s.trim()).filter(Boolean);
                const udOtros=descIds.reduce((s,id)=>s+(acumMap[id]||0),0);
                const udAcum=udPropias+udOtros;
                const nSalidas=t.nSalidas||2;
                const K=Math.round(nSalidas<=1?1:1/Math.sqrt(nSalidas-1)*100)/100;
                const n=t.nmaning||0.009;
                const sVal=t.sPercent||2;
                const S=sVal/100;
                const Q=udAcum>0?Math.round(K*(udAcum<240?0.1163*Math.pow(udAcum,0.6875):0.074*Math.pow(udAcum,0.7504))*1000)/1000:0;
                const dSel=DIAM_OPTIONS.find(d=>d.pulg===(t.diamDisPulg||0))||null;
                let DcalcPulg=0,DdisPulg=dSel?dSel.pulg:0,DintMm=dSel?dSel.mm:0,chequeo='—';
                let Qo=0,Vo=0,qqo=0,Vreal=0,chequeoV='—';
                let Yc=0,Yn=0,Froude=0,tipoFlujo='—',Ymax=0,chequeoYn='—';
                let fuerzaTractiva=0,chequeoFT='—';
                if(Q>0&&S>0&&DintMm>0){
                  DcalcPulg=Math.round(1.548*Math.pow((n*Q/1000/Math.sqrt(S)),3/8)*1000/25.4*100)/100;
                  chequeo=DcalcPulg<=DdisPulg?'O.K.':'NO CUMPLE';
                  Qo=Math.round(0.312*Math.pow(DintMm/1000,8/3)*Math.sqrt(S)/n*1000*100)/100;
                  Vo=Math.round(4*Qo/1000/Math.PI/Math.pow(DintMm/1000,2)*100)/100;
                  qqo=Qo>0?Math.round(Q/Qo*100)/100:0;
                  const q=Qo>0?Q/Qo:0;
                  let v=0;
                  if(q>0){v=q<=0.06?Math.pow(10,0.029806+0.29095*Math.log10(q)):q<=0.26?Math.pow(10,0.013778+0.28597*Math.log10(q)):Math.pow(10,0.021763+0.289951*Math.log10(q));}
                  let y_D=0;
                  if(q>0){y_D=q<0.11?0.3827+0.0645*Math.log(q):q<0.21?0.60025+0.15471*Math.log(q):0.225+0.667*q;}
                  Vreal=Math.round(v*Vo*100)/100;
                  chequeoV=(Vreal<0.45||Vreal>4.0)?'NO CUMPLE':'O.K.';
                  const alpha=2*Math.acos(1-2*y_D);
                  const Rh_D=0.25*(1-Math.sin(alpha)/alpha);
                  const Rh=Rh_D*DintMm;
                  Yc=Math.round(0.296938082*DintMm*100)/100;
                  Yn=Math.round(y_D*DintMm*100)/100;
                  Ymax=Math.round(DintMm*0.75*100)/100;
                  chequeoYn=Math.max(Yc,Yn)<Ymax?'O.K.':'NO CUMPLE';
                  Froude=Math.round(Vreal/Math.sqrt(9.806*Rh/1000)*100)/100;
                  tipoFlujo=Froude>1.1?'Supercrítico':Froude<0.9?'Subcrítico':'Crítico';
                  fuerzaTractiva=Math.round(1000*Rh/1000*S*100)/100;
                  chequeoFT=fuerzaTractiva>0.15?'O.K.':'NO CUMPLE';
                }
                const otrosTramos=tramosSan.filter(o=>o.id!==t.id);
                return(
                  <tr key={t.id}>
                    <td className="c"><span className="sigla" style={{fontSize:10}}>{t.id}</span></td>
                    <td className="c" style={{fontSize:12}}>{pisos.find(p=>p.n===t.piso)?pisoLbl(t.piso):t.piso}</td>
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
                    <td className="c"><input type="text" inputMode="numeric" pattern="[0-9]*" className="ni" style={{width:36,padding:'2px 3px',fontSize:10,textAlign:'center'}} value={t.nSalidas!==undefined?String(t.nSalidas):'2'} onChange={e=>{const v=e.target.value.replace(/\D/g,'');updTramoSan(t.id,'nSalidas',v===''?0:parseInt(v)||2);}}/></td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600}}>{K.toFixed(2)}</td>
                    <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600}}>{Q>0?Q.toFixed(3):'—'}</td>
                    <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:70,padding:'2px 4px',fontSize:12,textAlign:'center'}} defaultValue={t.nmaning??''} key={t.id+'nm'} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updTramoSan(t.id,'nmaning',v);}}/></td>
                    <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:36,padding:'2px 3px',fontSize:10,textAlign:'center'}} defaultValue={sVal??''} key={t.id+'sp'} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updTramoSan(t.id,'sPercent',v);}}/></td>
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
  );
}
