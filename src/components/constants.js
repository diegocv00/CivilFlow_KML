export function pisoLbl(n) {
  if (n < 0) return `Sótano ${Math.abs(n)}`;
  return `Piso ${n}`;
}

export const APARATOS_DEF = [
  {id:'lvm', sigla:'Lvm:', nombre:'Lavamanos', grupo:'h', uc_af:0.5, uc_ac:0.5, ud:2, pmin:0.51, pmax:5.63, qgas:0, norma:'NTC 1500 T1'},
  {id:'san', sigla:'San:', nombre:'Sanitario c/tanque', grupo:'h', uc_af:2.2, uc_ac:0, ud:4, pmin:0.71, pmax:14.10, qgas:0, norma:'NTC 1500 T1'},
  {id:'lvp', sigla:'Lvp:', nombre:'Lavaplatos', grupo:'h', uc_af:1.0, uc_ac:1.0, ud:2, pmin:0.51, pmax:5.63, qgas:0, norma:'NTC 1500 T1'},
  {id:'duc', sigla:'Duc:', nombre:'Ducha', grupo:'h', uc_af:1.0, uc_ac:1.0, ud:2, pmin:1.02, pmax:5.63, qgas:0, norma:'NTC 1500 T1'},
  {id:'tin', sigla:'Tin:', nombre:'Tina de baño', grupo:'h', uc_af:1.0, uc_ac:1.0, ud:2, pmin:0.51, pmax:14.10, qgas:0, norma:'NTC 1500 T1'},
  {id:'lvra',sigla:'Lvra:', nombre:'Lavadora', grupo:'h', uc_af:1.0, uc_ac:0, ud:4, pmin:0.51, pmax:5.63, qgas:0, norma:'NTC 1500 T1'},
  {id:'lvro',sigla:'Lvro:', nombre:'Lavadero', grupo:'h', uc_af:0.75,uc_ac:0.75,ud:2, pmin:0.51, pmax:5.63, qgas:0, norma:'NTC 1500 T1'},
  {id:'ori', sigla:'Ori:', nombre:'Orinal/Urinal', grupo:'h', uc_af:2.2, uc_ac:0, ud:5, pmin:0.71, pmax:14.10, qgas:0, norma:'NTC 1500 T1'},
  {id:'flu', sigla:'Flu:', nombre:'Sanitario fluxómetro', grupo:'h', uc_af:6.0, uc_ac:0, ud:6, pmin:0.71, pmax:14.10, qgas:0, norma:'NTC 1500 T1'},
  {id:'est4', sigla:'Est:', nombre:'Estufa 4 quemadores', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.35, norma:'NTC 3728 T1'},
  {id:'est2', sigla:'Est2:', nombre:'Estufa 2 quemadores', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.68, norma:'NTC 3728 T1'},
  {id:'hor_g',sigla:'Hor:', nombre:'Horno grande', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.15, norma:'NTC 3728 T1'},
  {id:'hor_m',sigla:'HorM:', nombre:'Horno mediano', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.81, norma:'NTC 3728 T1'},
  {id:'hor_p',sigla:'HorP:', nombre:'Horno pequeño', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.54, norma:'NTC 3728 T1'},
  {id:'sec_g',sigla:'SecG:', nombre:'Secadora grande', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.81, norma:'NTC 3728 T1'},
  {id:'sec_p',sigla:'SecP:', nombre:'Secadora pequeña', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:0.54, norma:'NTC 3728 T1'},
  {id:'cal_b',sigla:'Cal:', nombre:'Caldera pequeña', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.76, norma:'NTC 3728 T1'},
  {id:'jac', sigla:'Jac:', nombre:'Jacuzzi', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:3.38, norma:'NTC 3728 T1'},
  {id:'pisc', sigla:'Pis:', nombre:'Calentador piscina', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:6.08, norma:'NTC 3728 T1'},
  {id:'sauna',sigla:'Sau:', nombre:'Baño sauna', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.08, norma:'NTC 3728 T1'},
  {id:'turco',sigla:'Tur:', nombre:'Baño turco', grupo:'g', uc_af:0,uc_ac:0,ud:0, pmin:17,pmax:25, qgas:1.35, norma:'NTC 3728 T1'},
];

export const REDES=[
  {id:'san',lbl:'Red Sanitaria', sub:'RAS D · maning n=0.009', ico:'♻️'},
  {id:'ven',lbl:'Ventilación', sub:'NTC 1500 §9 · D mín 1½"', ico:'💨'},
  {id:'ll', lbl:'Aguas Lluvias', sub:'Método Racional · IDF', ico:'🌧️'},
  {id:'af', lbl:'Agua Fría', sub:'NTC 1500 · Hazen-Williams', ico:'💧'},
  {id:'ac', lbl:'Agua Caliente', sub:'NTC 1500 · CPVC RDE 11', ico:'🔥'},
  {id:'ep', lbl:'Equipo Presión', sub:'Bomba + recipiente vejiga', ico:'⚡'},
  {id:'bom',lbl:'Bomba AR', sub:'Aguas residuales presión', ico:'⬆️'},
  {id:'rec',lbl:'Recirculación AC',sub:'Solo si L > 15 m', ico:'🔄'},
  {id:'rci',lbl:'Contra Incendio', sub:'NSR-10 J · NFPA 13:2022', ico:'🔴'},
];

export const TABS=[
  {id:'plano', lbl:'Planos', ico:'📐'},
  {id:'mats', lbl:'Caract. Materiales', ico:'📋'},
  {id:'apars', lbl:'Dispositivos', ico:'🚿'},
  {id:'cud', lbl:'Cálculo UD', ico:'📊'},
];

export const MATERIALES = {
  af: {lbl:'Agua Fría', opts:['PVC presión','CPVC','Cobre rígido','Polipropileno PP-R']},
  ac: {lbl:'Agua Caliente', opts:['CPVC','Cobre rígido','Polipropileno PP-R','PEX']},
  san: {lbl:'Sanitaria', opts:['PVC sanitario','Novatec','Hierro fundido','Concreto']},
  ll: {lbl:'Aguas Lluvias', opts:['PVC sanitario','Novatec','Hierro fundido','Concreto','Gres cerámico']},
  ven: {lbl:'Ventilación', opts:['PVC sanitario','Novatec']},
  rci: {lbl:'Contra Incendio', opts:['Acero SCH 40','Acero SCH 10','Acero galvanizado','CPVC CPVC-CI','PVC C900']},
};

export const MATS_DEFAULT=Object.fromEntries(Object.entries(MATERIALES).map(([k,v])=>[k,v.opts.map((o,i)=>({id:k+i,val:o}))]));
export const USOS=['Vivienda unifamiliar','Vivienda multifamiliar','Comercial','Institucional','Mixto'];
export const EMPRES=['EMAB - Floridablanca','Aguas de Bucaramanga','EAAB - Bogotá','EPM - Medellín','Otra'];

export const UD_BASE_INIT=[
  {id:'sif',nombre:'Sifones',ud:2},
  {id:'lvm',nombre:'Lavamanos',ud:2},
  {id:'san',nombre:'Sanitarios',ud:4},
  {id:'duc',nombre:'Duchas',ud:2},
  {id:'lvra',nombre:'Lavadoras',ud:4},
  {id:'tin',nombre:'Tina',ud:2},
  {id:'lvp',nombre:'Lavaplatos',ud:2},
  {id:'lvro',nombre:'Lavadero',ud:2},
];

export const UD_PISO_MAP={
  sif:'Sifones',lvm:'Lavamanos',san:'Sanitarios',duc:'Duchas',
  lvra:'Lavadoras',tin:'Tina',lvp:'Lavaplatos',lvro:'Lavadero',
};

export const DIAM_OPTIONS=[
  {pulg:1.5,label:'1 1/2"',mm:42.68},
  {pulg:2,label:'2"',mm:54.48},
  {pulg:3,label:'3"',mm:76.20},
  {pulg:4,label:'4"',mm:107.70},
  {pulg:6,label:'6"',mm:160.04},
];
