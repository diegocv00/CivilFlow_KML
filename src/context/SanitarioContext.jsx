import { useState, createContext, useContext } from "react";
import { UD_BASE_INIT } from "../components/constants";

const SanitarioContext = createContext(null);

export function SanitarioProvider({ children }) {
  const [udBase, setUdBase] = useState([...UD_BASE_INIT]);

  const [tramosSan, setTramosSan] = useState([
    {id:'BAN-1',piso:2,pisoDesde:2,pisoHasta:1,fixtures:{},recibeDe:[],esBajante:true,descripcion:'',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0,bajR:(7/24),bajLong:3,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
    {id:'BAN-2',piso:2,pisoDesde:2,pisoHasta:1,fixtures:{},recibeDe:[],esBajante:true,descripcion:'',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0,bajR:(7/24),bajLong:3,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
    {id:'R-1',piso:1,pisoDesde:1,pisoHasta:1,fixtures:{},recibeDe:['BAN-2'],esBajante:false,descripcion:'BAN 2',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0,bajR:(7/24),bajLong:0,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
    {id:'R-2',piso:1,pisoDesde:1,pisoHasta:1,fixtures:{},recibeDe:[],esBajante:false,descripcion:'',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0,bajR:(7/24),bajLong:0,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
    {id:'R-3',piso:1,pisoDesde:1,pisoHasta:1,fixtures:{},recibeDe:['BAN-1','R-1','R-2'],esBajante:false,descripcion:'BAN-1+R-1+R-2',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0,bajR:(7/24),bajLong:0,bajFDarcy:0.025,bajDprop:0,ventDprop:0},
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

  const [tramosLl, setTramosLl] = useState([
    {id:'BAJ-1',piso:2,esBajante:true,desde:'',hasta:'',descripcion:'',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0},
    {id:'BAJ-2',piso:1,esBajante:true,desde:'',hasta:'',descripcion:'',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0},
    {id:'RLL-1',piso:1,esBajante:false,desde:'BAJ-1',hasta:'',descripcion:'',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0},
  ]);

  const [bajantesLl, setBajantesLl] = useState([
    {id:'BLL-1',bajante:'Baj 1',areaParcial:0,areaAcumulada:0,intensidad:0,coeficienteC:0,R:'7/24',manning:0,diamPropuesto:0},
    {id:'BLL-2',bajante:'Baj 2',areaParcial:0,areaAcumulada:0,intensidad:0,coeficienteC:0,R:'7/24',manning:0,diamPropuesto:0},
  ]);

  const [canalesLl, setCanalesLl] = useState([
    {id:'CLL-1',sector:'Sector 1',areaParcial:0,areaAcumulada:0,intensidad:0,coeficienteC:0,manning:0,pendiente:0,b:0,h:0,bl:0},
    {id:'CLL-2',sector:'Sector 2',areaParcial:0,areaAcumulada:0,intensidad:0,coeficienteC:0,manning:0,pendiente:0,b:0,h:0,bl:0},
  ]);

  const addCanalLL = () => setCanalesLl(p => [...p, {
    id:`CLL-${p.length+1}`,sector:'',areaParcial:0,areaAcumulada:0,intensidad:0,coeficienteC:0,manning:0,pendiente:0,b:0,h:0,bl:0,
  }]);
  const delCanalLL = (id) => setCanalesLl(p => p.filter(t => t.id !== id));
  const updCanalLL = (id, field, val) => setCanalesLl(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));

  const addBajanteLL = () => setBajantesLl(p => [...p, {
    id:`BLL-${p.length+1}`,bajante:'',areaParcial:0,areaAcumulada:0,intensidad:0,coeficienteC:0,R:'7/24',manning:0,diamPropuesto:0,
  }]);
  const delBajanteLL = (id) => setBajantesLl(p => p.filter(t => t.id !== id));
  const updBajanteLL = (id, field, val) => setBajantesLl(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));

  const addTramoSan = () => setTramosSan(p => [...p, {
    id:`T-${p.length+1}`,piso:1,pisoDesde:1,pisoHasta:1,fixtures:{},recibeDe:[],esBajante:false,descripcion:'',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0,bajR:(7/24),bajLong:3,bajFDarcy:0.025,bajDprop:0,ventDprop:0,
  }]);
  const delTramoSan = (id) => setTramosSan(p => p.filter(t => t.id !== id));
  const updTramoSan = (id, field, val) => setTramosSan(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));
  const updTramoSanFix = (id, fix, val) => setTramosSan(p => p.map(t => t.id === id ? { ...t, fixtures: { ...t.fixtures, [fix]: val } } : t));

  const addTramoLL = () => setTramosLl(p => [...p, {
    id:`RLL-${p.length+1}`,piso:1,esBajante:false,desde:'',hasta:'',descripcion:'',diamDisPulg:0,nSalidas:0,nmaning:0,sPercent:0,
  }]);
  const delTramoLL = (id) => setTramosLl(p => p.filter(t => t.id !== id));
  const updTramoLL = (id, field, val) => setTramosLl(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));

  const setP = (k, v) => setProy(p => ({ ...p, [k]: v }));

  return (
    <SanitarioContext.Provider value={{
      tramosSan, tramosLl, udBase, pisos, proy,
      addTramoSan, delTramoSan, updTramoSan, updTramoSanFix,
      addTramoLL, delTramoLL, updTramoLL,
      bajantesLl, addBajanteLL, delBajanteLL, updBajanteLL,
      canalesLl, addCanalLL, delCanalLL, updCanalLL,
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
