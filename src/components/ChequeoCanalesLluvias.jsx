import { useSanitario } from "../context/SanitarioContext";

export default function ChequeoCanalesLluvias() {
  const { canalesLl, addCanalLL, delCanalLL, updCanalLL } = useSanitario();

  return (
    <div className="card">
      <div className="card-h">
        <span className="card-t">🌧️ Chequeo capacidad canal cubierta aguas lluvias</span>
      </div>
      <div className="scroll-top" style={{padding:'16px'}}>
        <div className="scroll-inner" style={{minWidth:'max-content'}}>
        <table className="tbl" style={{fontSize:13}}>
          <thead>
            <tr>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Sector</th>
              <th className="col-h ll" colSpan={2} style={{textAlign:'center',fontSize:11}}>Área</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Intensidad promedio<br/>mm/hr/m²</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Coeficiente de<br/>Escorrentía C</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Q real<br/>LPS</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Maning<br/>n</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Pendiente<br/>(%)</th>
              <th className="col-h ok" colSpan={4} style={{textAlign:'center',fontSize:11}}>Sección propuesta</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Q max<br/>LPS</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Chequeo<br/>Qreal&lt;Qmax</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}></th>
            </tr>
            <tr>
              <th className="col-h ll" style={{fontSize:10,textAlign:'center'}}>Parcial<br/>m²</th>
              <th className="col-h ll" style={{fontSize:10,textAlign:'center'}}>Acumulada<br/>m²</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>b<br/>(cm)</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>h<br/>(cm)</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>bl<br/>(cm)</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Total<br/>(cm)</th>
            </tr>
          </thead>
          <tbody>
            {canalesLl.map(c=>{
              const areaAcum = c.areaAcumulada || 0;
              const inten = c.intensidad || 0;
              const cVal = c.coeficienteC || 0;
              const n = c.manning || 0.009;
              const S = (c.pendiente || 0) / 100;
              const b_cm = c.b || 0;
              const h_cm = c.h || 0;
              const b_m = b_cm / 100;
              const h_m = h_cm / 100;

              const Qreal = areaAcum > 0 && inten > 0 && cVal > 0
                ? Math.round(areaAcum * inten * cVal / 100 * 100) / 100
                : 0;

              const totalStr = b_cm > 0 || h_cm > 0 ? `${b_cm} x ${h_cm}` : '—';

              const Qmax = b_m > 0 && h_m > 0 && n > 0 && S > 0
                ? Math.round(1000 * b_m * h_m / n * Math.sqrt(S) * Math.pow(b_m * h_m / (b_m + 2 * h_m), 2/3) * 100) / 100
                : 0;

      const chequeo = Qmax > 0 && Qreal > 0
        ? Qmax > Qreal ? 'O.K.' : 'No Cumple'
        : (Qreal > 0 ? 'Sin sección' : '—');

              return(
                <tr key={c.id}>
                  <td className="c"><input className="ni" style={{width:90,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={c.sector} onChange={e=>updCanalLL(c.id,'sector',e.target.value)}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.areaParcial||''} key={c.id+'ap'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'areaParcial',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'areaParcial',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.areaAcumulada||''} key={c.id+'aa'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'areaAcumulada',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'areaAcumulada',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.intensidad||''} key={c.id+'in'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'intensidad',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'intensidad',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.coeficienteC||''} key={c.id+'cc'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'coeficienteC',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'coeficienteC',v);}}/></td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:13}}>{Qreal>0?Qreal.toFixed(2):'—'}</td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.manning||''} key={c.id+'mn'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'manning',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'manning',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.pendiente||''} key={c.id+'pe'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'pendiente',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'pendiente',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.b||''} key={c.id+'b'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'b',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'b',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.h||''} key={c.id+'h'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'h',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'h',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={c.bl||''} key={c.id+'bl'} onChange={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'bl',v);}} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updCanalLL(c.id,'bl',v);}}/></td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600,fontSize:11}}>{totalStr}</td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:12}}>{Qmax > 0 ? Qmax.toFixed(2) : '—'}</td>
                  <td className="c" style={{fontWeight:700}}>{chequeo}</td>
                  <td className="c">
                    <button onClick={()=>delCanalLL(c.id)} style={{background:'var(--err-bg)',border:'1px solid var(--err-b)',borderRadius:'var(--r)',color:'var(--err)',padding:'1px 5px',fontSize:10,cursor:'pointer'}}>✕</button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={15} style={{textAlign:'center',padding:'8px 0'}}>
                <button className="btn-xs" onClick={addCanalLL} style={{width:'auto',display:'inline-flex',alignItems:'center',gap:4}}>+ Agregar canal</button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
