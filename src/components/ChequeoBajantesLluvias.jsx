import { useSanitario } from "../context/SanitarioContext";

export default function ChequeoBajantesLluvias() {
  const { bajantesLl, addBajanteLL, delBajanteLL, updBajanteLL } = useSanitario();

  return (
    <div className="card">
      <div className="card-h">
        <span className="card-t">🌧️ Chequeo capacidad bajantes agua lluvias</span>
      </div>
      <div className="card-b" style={{overflowX:'auto'}}>
        <table className="tbl" style={{fontSize:13}}>
          <thead>
            <tr>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Bajante #</th>
              <th className="col-h ll" colSpan={2} style={{textAlign:'center',fontSize:11}}>Área</th>
<th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Intensidad promedio<br/>mm/hr/m²</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Coeficiente de<br/>Escorrentía C</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>R</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Q = C×I×A<br/>LPS</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Manning<br/>n</th>
              <th className="col-h ok" colSpan={2} style={{textAlign:'center',fontSize:11}}>Diámetro</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}>Chequeo<br/>Dcal&lt;Dprop</th>
              <th className="col-h ll" rowSpan={2} style={{fontSize:11,textAlign:'center'}}></th>
            </tr>
            <tr>
              <th className="col-h ll" style={{fontSize:10,textAlign:'center'}}>Parcial<br/>m²</th>
              <th className="col-h ll" style={{fontSize:10,textAlign:'center'}}>Acumulada<br/>m²</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Calculado<br/>(")</th>
              <th className="col-h ok" style={{fontSize:10,textAlign:'center'}}>Propuesto<br/>(")</th>
            </tr>
          </thead>
          <tbody>
            {bajantesLl.map(b=>{
              const areaAcum = b.areaAcumulada || 0;
              const inten = b.intensidad || 0;
              const cVal = b.coeficienteC || 0;
              const R = b.R === '1/4' ? 0.25 : (b.R === '7/24' ? 7/24 : 7/24);
              const Q = areaAcum > 0 && inten > 0 && cVal > 0
                ? Math.round(areaAcum * inten * cVal / 100 * 100) / 100
                : 0;
              const diamCalc = Q > 0 && R > 0
                ? Math.round(Math.pow(Q / (1.754 * Math.pow(R, 5/3)), 3/8) * 100) / 100
                : 0;
              const diamProp = b.diamPropuesto || 0;
              const chequeo = diamCalc > 0 && diamProp > 0
                ? diamCalc < diamProp ? 'O.K.' : 'No Cumple'
                : '—';
              return(
                <tr key={b.id}>
                  <td className="c"><input className="ni" style={{width:80,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={b.bajante} onChange={e=>updBajanteLL(b.id,'bajante',e.target.value)}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={b.areaParcial??''} key={b.id+'ap'} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updBajanteLL(b.id,'areaParcial',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={b.areaAcumulada??''} key={b.id+'aa'} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updBajanteLL(b.id,'areaAcumulada',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:70,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={b.intensidad??''} key={b.id+'in'} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updBajanteLL(b.id,'intensidad',v);}}/></td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={b.coeficienteC??''} key={b.id+'cc'} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updBajanteLL(b.id,'coeficienteC',v);}}/></td>
                  <td className="c">
                    <select className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} value={b.R} onChange={e=>updBajanteLL(b.id,'R',e.target.value)}>
                      <option value="1/4">1/4</option>
                      <option value="7/24">7/24</option>
                    </select>
                  </td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:13}}>{Q.toFixed(2)}</td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={b.manning??''} key={b.id+'mn'} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updBajanteLL(b.id,'manning',v);}}/></td>
                  <td className="c" style={{fontFamily:'var(--mono)',fontWeight:600,fontSize:12}}>{diamCalc > 0 ? diamCalc.toFixed(2) : '—'}</td>
                  <td className="c"><input type="text" inputMode="decimal" className="ni" style={{width:60,padding:'2px 4px',fontSize:11,textAlign:'center'}} defaultValue={b.diamPropuesto??''} key={b.id+'dp'} onBlur={e=>{const raw=e.target.value.replace(/,/g,'.');const v=parseFloat(raw);if(!isNaN(v)&&raw!=='')updBajanteLL(b.id,'diamPropuesto',v);}}/></td>
                  <td className="c" style={{fontWeight:700}}>{chequeo}</td>
                  <td className="c">
                    <button onClick={()=>delBajanteLL(b.id)} style={{background:'var(--err-bg)',border:'1px solid var(--err-b)',borderRadius:'var(--r)',color:'var(--err)',padding:'1px 5px',fontSize:10,cursor:'pointer'}}>✕</button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={12} style={{textAlign:'center',padding:'8px 0'}}>
                <button className="btn-xs" onClick={addBajanteLL} style={{width:'auto',display:'inline-flex',alignItems:'center',gap:4}}>+ Agregar bajante</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
