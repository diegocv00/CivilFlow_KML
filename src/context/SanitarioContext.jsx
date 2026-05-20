import { useState, createContext, useContext } from "react";
import { UD_BASE_INIT } from "../components/constants";

const SanitarioContext = createContext(null);

export function SanitarioProvider({ children }) {
  const [udBase, setUdBase] = useState([...UD_BASE_INIT]);

  const [tramosSan, setTramosSan] = useState([
    {id:'BAN-1',piso:2,pisoDesde:2,pisoHasta:1,fixtures:{sif:2,lvm:2,san:2,duc:2},recibeDe:[],esBajante:true,descripcion:'',diamDisPulg:0,nSalidas:2,nmaning:0,sPercent:2,bajR:(7/24),bajLong:3,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
    {id:'BAN-2',piso:2,pisoDesde:2,pisoHasta:1,fixtures:{sif:3,lvm:2,san:1,duc:1,tin:1},recibeDe:[],esBajante:true,descripcion:'',diamDisPulg:0,nSalidas:2,nmaning:0,sPercent:2,bajR:(7/24),bajLong:3,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
    {id:'R-1',piso:1,pisoDesde:1,pisoHasta:1,fixtures:{sif:1,lvm:2,san:1,lvp:2,lvra:1},recibeDe:['BAN-2'],esBajante:false,descripcion:'BAN 2',diamDisPulg:0,nSalidas:2,nmaning:0,sPercent:2,bajR:(7/24),bajLong:0,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
    {id:'R-2',piso:1,pisoDesde:1,pisoHasta:1,fixtures:{sif:1,lvm:2,san:2,duc:1},recibeDe:[],esBajante:false,descripcion:'',diamDisPulg:0,nSalidas:2,nmaning:0,sPercent:2,bajR:(7/24),bajLong:0,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
    {id:'R-3',piso:1,pisoDesde:1,pisoHasta:1,fixtures:{},recibeDe:['BAN-1','R-1','R-2'],esBajante:false,descripcion:'BAN-1+R-1+R-2',diamDisPulg:0,nSalidas:2,nmaning:0,sPercent:2,bajR:(7/24),bajLong:0,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
  ]);

  const [pisos, setPisos] = useState([
    {id:1,n:-1,npt:-3.00,ok:false,tipo:'sotano'},
    {id:2,n:1, npt: 0.00,ok:false,tipo:'piso'},
    {id:3,n:2, npt: 3.10,ok:false,tipo:'piso'},
    {id:4,n:99,npt: 6.20,ok:false,tipo:'cubierta'},
  ]);

  const [proy, setProy] = useState({
    nombre:'Casa No. 26 CR Monte Real', dir:'CR 10 No. 25-40',
    mun:'Floridablanca', dep:'Santander',
    uso:'Vivienda unifamiliar', empresa:'EMAB - Floridablanca',
    p_red:'20', dot:'280',
    mat_af:'PVC presión', mat_ac:'CPVC', mat_rci:'Acero SCH 40',
    mat_san:'PVC sanitario', mat_ll:'PVC sanitario',
    mat_ven:'PVC sanitario', mat_gas:'PE al PE',
    altitud:'959', p_atm:'90.32',
    poblFija:6, poblFlot:10, areaPiscina:40.12, areaVerdes:50,
    C_escorrentia:0.95, pendienteSan:0.02,
  });

  const addTramoSan = () => setTramosSan(p => [...p, {
    id:`T-${p.length+1}`,piso:1,pisoDesde:1,pisoHasta:1,fixtures:{sif:0,lvm:0,san:0,duc:0,lvra:0,tin:0,lvp:0,lvro:0},recibeDe:[],esBajante:false,descripcion:'',diamDisPulg:0,nSalidas:2,nmaning:0,sPercent:parseFloat(proy.pendienteSan)*100||2,bajR:(7/24),bajLong:3,bajFDarcy:0.025,bajDprop:0,ventDprop:0,
  }]);
  const delTramoSan = (id) => setTramosSan(p => p.filter(t => t.id !== id));
  const updTramoSan = (id, field, val) => setTramosSan(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));
  const updTramoSanFix = (id, fix, val) => setTramosSan(p => p.map(t => t.id === id ? { ...t, fixtures: { ...t.fixtures, [fix]: val } } : t));
  const setP = (k, v) => setProy(p => ({ ...p, [k]: v }));

  return (
    <SanitarioContext.Provider value={{
      tramosSan, udBase, pisos, proy,
      addTramoSan, delTramoSan, updTramoSan, updTramoSanFix,
      setUdBase, setPisos, setProy, setP,
    }}>
      {children}
    </SanitarioContext.Provider>
  );
}

export function useSanitario() {
  const ctx = useContext(SanitarioContext);
  if (!ctx) throw new Error("useSanitario debe usarse dentro de <SanitarioProvider>");
  return ctx;
}
