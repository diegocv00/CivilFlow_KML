import { useSanitario } from "../context/SanitarioContext";
import FloatingPanel from "./FloatingPanel";

export default function PanelBajantesLluvias({ onClose }) {
  const { bajantesLl, addBajanteLL, delBajanteLL, updBajanteLL } = useSanitario();

  return (
    <FloatingPanel title="Bajantes agua lluvias" icon="🌧️" count={`${bajantesLl.length} bajantes`} onClose={onClose} minW={580}>
      <table style={{borderCollapse:'collapse',width:'100%',fontFamily:"'Geist',monospace",fontSize:11,color:'#e2e2e8'}}>
        <thead>
          <tr>
            {['Bajante','Área P','Área A','I mm/hr','C','R','Q LPS','n','D calc','D prop','Chequeo',''].map(h=>
              <th key={h} style={{padding:'4px 3px',fontSize:9,fontWeight:600,textAlign:'center',color:'#849495',borderBottom:'2px solid #3a494a',whiteSpace:'nowrap',position:'sticky',top:0,background:'#121416'}}>{h}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {bajantesLl.map(b=>{
            const Q = (b.areaAcumulada||0) > 0 && (b.intensidad||0) > 0 && (b.coeficienteC||0) > 0
              ? Math.round(b.areaAcumulada * b.intensidad * b.coeficienteC / 100 * 100) / 100 : 0;
            const Rv = b.R === '1/4' ? 0.25 : (b.R === '7/24' ? 7/24 : 7/24);
            const dCalc = Q > 0 && Rv > 0 ? Math.round(Math.pow(Q / (1.754 * Math.pow(Rv, 5/3)), 3/8) * 100) / 100 : 0;
            const chk = dCalc > 0 && (b.diamPropuesto||0) > 0 ? (dCalc < b.diamPropuesto ? 'O.K.' : 'No Cumple') : (dCalc > 0 ? 'Sin diseño' : '—');
            return(
              <tr key={b.id} style={{borderBottom:'1px solid #2a2c30'}}>
                <td style={tdS}><input style={inp(72)} value={b.bajante} onChange={e=>updBajanteLL(b.id,'bajante',e.target.value)}/></td>
                <td style={tdS}><input style={inp(60)} defaultValue={b.areaParcial||''} key={b.id+'ap'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updBajanteLL(b.id,'areaParcial',v);}}/></td>
                <td style={tdS}><input style={inp(60)} defaultValue={b.areaAcumulada||''} key={b.id+'aa'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updBajanteLL(b.id,'areaAcumulada',v);}}/></td>
                <td style={tdS}><input style={inp(56)} defaultValue={b.intensidad||''} key={b.id+'in'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updBajanteLL(b.id,'intensidad',v);}}/></td>
                <td style={tdS}><input style={inp(50)} defaultValue={b.coeficienteC||''} key={b.id+'cc'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updBajanteLL(b.id,'coeficienteC',v);}}/></td>
                <td style={tdS}>
                  <select style={{...inp(52),padding:'2px 2px'}} value={b.R} onChange={e=>updBajanteLL(b.id,'R',e.target.value)}>
                    <option value="1/4">1/4</option><option value="7/24">7/24</option>
                  </select>
                </td>
                <td style={{...tdS,fontWeight:700,fontSize:13}}>{Q>0?Q.toFixed(2):'—'}</td>
                <td style={tdS}><input style={inp(50)} defaultValue={b.manning||''} key={b.id+'mn'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updBajanteLL(b.id,'manning',v);}}/></td>
                <td style={tdS}>{dCalc > 0 ? dCalc.toFixed(2) : '—'}</td>
                <td style={tdS}><input style={inp(56)} defaultValue={b.diamPropuesto||''} key={b.id+'dp'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updBajanteLL(b.id,'diamPropuesto',v);}}/></td>
                <td style={{...tdS,fontWeight:700,color:chk==='O.K.'?'#2ff801':'#ffb4ab'}}>{chk}</td>
                <td style={tdS}><button onClick={()=>delBajanteLL(b.id)} style={{background:'transparent',border:'1px solid rgba(255,100,100,.3)',borderRadius:3,color:'#ffb4ab',padding:'1px 4px',fontSize:9,cursor:'pointer'}}>✕</button></td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={12} style={{textAlign:'center',padding:'6px 0'}}>
              <button onClick={addBajanteLL} style={{padding:'4px 12px',background:'#1e2024',border:'1px dashed #3a494a',borderRadius:4,color:'#b9caca',cursor:'pointer',fontSize:11,fontFamily:"'Hanken Grotesk',sans-serif"}}>+ Agregar bajante</button>
            </td>
          </tr>
        </tbody>
      </table>
    </FloatingPanel>
  );
}

const tdS = {padding:'2px 3px',textAlign:'center',verticalAlign:'middle'};
const inp = (w=56) => ({width:w,padding:'2px 4px',fontSize:11,textAlign:'center',background:'#1a1c20',border:'1px solid #3a494a',borderRadius:3,color:'#e2e2e8'});
