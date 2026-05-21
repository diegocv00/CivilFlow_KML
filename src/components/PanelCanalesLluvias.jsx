import { useSanitario } from "../context/SanitarioContext";
import { chequeoCanalLluvia } from "../utils/calcSanitario";
import FloatingPanel from "./FloatingPanel";

export default function PanelCanalesLluvias({ onClose }) {
  const { canalesLl, addCanalLL, delCanalLL, updCanalLL } = useSanitario();

  return (
    <FloatingPanel title="Canales cubierta" icon="🌧️" count={`${canalesLl.length} canales`} onClose={onClose} minW={620}>
      <table style={{borderCollapse:'collapse',width:'100%',fontFamily:"'Geist',monospace",fontSize:11,color:'#e2e2e8'}}>
        <thead>
          <tr>
            {['Sector','Área P','Área A','I mm/hr','C','Q LPS','n','S (%)','b','h','bl','Total','Q max','Chequeo',''].map(h=>
              <th key={h} style={{padding:'4px 3px',fontSize:9,fontWeight:600,textAlign:'center',color:'#849495',borderBottom:'2px solid #3a494a',whiteSpace:'nowrap',position:'sticky',top:0,background:'#121416'}}>{h}</th>
            )}
          </tr>
        </thead>
        <tbody>
{canalesLl.map(c=>{
const { Qreal: Qr, Qmax, chequeo: chk, totalStr } = chequeoCanalLluvia(c);
return(
              <tr key={c.id} style={{borderBottom:'1px solid #2a2c30'}}>
                <td style={tdS}><input style={inp(80)} value={c.sector} onChange={e=>updCanalLL(c.id,'sector',e.target.value)}/></td>
                <td style={tdS}><input style={inp(60)} defaultValue={c.areaParcial||''} key={c.id+'ap'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'areaParcial',v);}}/></td>
                <td style={tdS}><input style={inp(60)} defaultValue={c.areaAcumulada||''} key={c.id+'aa'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'areaAcumulada',v);}}/></td>
                <td style={tdS}><input style={inp(56)} defaultValue={c.intensidad||''} key={c.id+'in'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'intensidad',v);}}/></td>
                <td style={tdS}><input style={inp(50)} defaultValue={c.coeficienteC||''} key={c.id+'cc'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'coeficienteC',v);}}/></td>
                <td style={{...tdS,fontWeight:700,fontSize:13}}>{Qr>0?Qr.toFixed(2):'—'}</td>
                <td style={tdS}><input style={inp(50)} defaultValue={c.manning||''} key={c.id+'mn'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'manning',v);}}/></td>
                <td style={tdS}><input style={inp(50)} defaultValue={c.pendiente||''} key={c.id+'pe'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'pendiente',v);}}/></td>
                <td style={tdS}><input style={inp(50)} defaultValue={c.b||''} key={c.id+'b'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'b',v);}}/></td>
                <td style={tdS}><input style={inp(50)} defaultValue={c.h||''} key={c.id+'h'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'h',v);}}/></td>
                <td style={tdS}><input style={inp(50)} defaultValue={c.bl||''} key={c.id+'bl'} onChange={e=>{const v=parseFloat(e.target.value.replace(/,/g,'.'));if(!isNaN(v))updCanalLL(c.id,'bl',v);}}/></td>
                <td style={tdS}>{totalStr}</td>
                <td style={{...tdS,fontWeight:700}}>{Qmax > 0 ? Qmax.toFixed(2) : '—'}</td>
                <td style={{...tdS,fontWeight:700,color:chk==='O.K.'?'#2ff801':'#ffb4ab'}}>{chk}</td>
                <td style={tdS}><button onClick={()=>delCanalLL(c.id)} style={{background:'transparent',border:'1px solid rgba(255,100,100,.3)',borderRadius:3,color:'#ffb4ab',padding:'1px 4px',fontSize:9,cursor:'pointer'}}>✕</button></td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={15} style={{textAlign:'center',padding:'6px 0'}}>
              <button onClick={addCanalLL} style={{padding:'4px 12px',background:'#1e2024',border:'1px dashed #3a494a',borderRadius:4,color:'#b9caca',cursor:'pointer',fontSize:11,fontFamily:"'Hanken Grotesk',sans-serif"}}>+ Agregar canal</button>
            </td>
          </tr>
        </tbody>
      </table>
    </FloatingPanel>
  );
}

const tdS = {padding:'2px 3px',textAlign:'center',verticalAlign:'middle'};
const inp = (w=56) => ({width:w,padding:'2px 4px',fontSize:11,textAlign:'center',background:'#1a1c20',border:'1px solid #3a494a',borderRadius:3,color:'#e2e2e8'});
