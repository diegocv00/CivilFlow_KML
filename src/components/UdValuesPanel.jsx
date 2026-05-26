import { useSanitario } from "../context/SanitarioContext";
import { NumIn } from "./utils";
import FloatingPanel from "./FloatingPanel";

export default function PanelValoresUD({ onClose }) {
  const { udBase, setUdBase } = useSanitario();

  return (
    <FloatingPanel title="Valores base UD" icon="📊" onClose={onClose} minW={380}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'6px 20px',padding:'4px 0'}}>
        {udBase.map(d=>(
          <div key={d.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #2a2c30'}}>
            <span style={{fontWeight:500,fontSize:13,color:'#e2e2e8'}}>{d.nombre}</span>
            <NumIn val={d.ud} step={1} w={64} onChange={v=>setUdBase(prev=>prev.map(x=>x.id===d.id?{...x,ud:v}:x))}/>
          </div>
        ))}
      </div>
    </FloatingPanel>
  );
}
