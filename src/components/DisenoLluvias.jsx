import { useSanitario } from "../context/SanitarioContext";
import { pisoLbl, DIAM_OPTIONS } from "./constants";

export default function DisenoLluvias() {
  const { tramosLl, pisos, updTramoLL, addTramoLL, delTramoLL } = useSanitario();

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
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>De</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>A</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center',minWidth:100}}>Bajantes</th>
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
        DcalcPulg=Math.round(1.548*Math.pow((n*Q/1000/Math.sqrt(S)),3/8)*1000/25.4*100)/100;
        if(DdisPulg>0){chequeo=DcalcPulg<=DdisPulg?'O.K.':'NO CUMPLE';}
      }
      if(Q>0&&S!=null&&S>0&&n!=null&&n>0&&DintMm>0){
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
              const bajantes=tramosLl.filter(o=>o.esBajante);
              const descIds=(t.descripcion||'').split('+').map(s=>s.trim()).filter(Boolean);
              return(
                <tr key={t.id}>
                  <td className="c"><input className="ni" style={{width:72,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.id} onChange={e=>updTramoLL(t.id,'id',e.target.value)}/></td>
                  <td className="c" style={{fontSize:12}}>{pisos.find(p=>p.n===t.piso)?pisoLbl(t.piso):t.piso}</td>
                  <td className="c"><input className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.desde||''} onChange={e=>updTramoLL(t.id,'desde',e.target.value)}/></td>
                  <td className="c"><input className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.hasta||''} onChange={e=>updTramoLL(t.id,'hasta',e.target.value)}/></td>
                  <td className="c" style={{minWidth:120,maxWidth:200}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(48px, 1fr))',gap:3,fontSize:10}}>
                      {bajantes.map(b=>{
                        const sel=descIds.includes(b.id);
                        return(<span key={b.id} onClick={()=>{const next=sel?descIds.filter(x=>x!==b.id):[...descIds,b.id];updTramoLL(t.id,'descripcion',next.join('+'));}} style={{padding:'3px 6px',borderRadius:8,cursor:'pointer',background:sel?'var(--ll)':'var(--bg4)',color:sel?'#fff':'var(--txt)',border:`1.5px solid ${sel?'var(--ll)':'var(--line)'}`,fontWeight:sel?600:400,textAlign:'center',userSelect:'none',boxShadow:sel?'0 1px 3px rgba(0,0,0,0.12)':'none'}}>{b.id}</span>);
                      })}
                    </div>
                  </td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:12,textAlign:'center'}} defaultValue={t.qLps||''} key={t.id+'q'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updTramoLL(t.id,'qLps',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updTramoLL(t.id,'qLps',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:12,textAlign:'center'}} defaultValue={t.nmaning||''} key={t.id+'nm'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updTramoLL(t.id,'nmaning',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updTramoLL(t.id,'nmaning',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:36,padding:'2px 3px',fontSize:10,textAlign:'center'}} defaultValue={sVal||''} key={t.id+'sp'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updTramoLL(t.id,'sPercent',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updTramoLL(t.id,'sPercent',v);}}/></td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontSize:10}}>{DcalcPulg>0?DcalcPulg.toFixed(2)+'"':'—'}</td>
                  <td className="c">
                    <select className="ni" style={{width:56,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={t.diamDisPulg||''} onChange={e=>updTramoLL(t.id,'diamDisPulg',parseFloat(e.target.value))}>
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
                    <button onClick={()=>delTramoLL(t.id)} style={{background:'var(--err-bg)',border:'1px solid var(--err-b)',borderRadius:'var(--r)',color:'var(--err)',padding:'1px 5px',fontSize:10,cursor:'pointer'}}>✕</button>
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
