import ExcelJS from "exceljs";
import * as CalcHid from "./calcHidraulica";

// ─── HELPER ──────────────────────────────────────────────────────────────
function ensureSheetRows(ws, upTo) {
  for (let i = 1; i <= upTo; i++) {
    ws.getRow(i);
  }
}

// ─── GENERAR EXCEL HIDRÁULICO ────────────────────────────────────────────
export async function generarExcelHidraulico({ 
  proyecto, hidros, pRed,
  tramosAF = [], tramosAC = [], matAF = 'PVC presión', matAC = 'CPVC',
  poblFija = 6, poblFlot = 10, areaPiscina = 0, areaVerdes = 0,
}) {
  console.log("Iniciando generación Excel Hidráulico...");
  const P_red = pRed || 20;

  const tramosRAF = tramosAF.map(t => ({
    id: t.id, ini: t.ini, fin: t.fin, piso: t.piso,
    uc: t.fixtures || {}, UC_otros: t.UC_otros || 0,
    Lh: t.Lh || 0, Lv: t.Lv || 0,
    presionIni: t.ini === 'Duc' ? P_red : null, desc: "",
  }));
  if (tramosRAF.length === 0) {
    tramosRAF.push(
      { id:"RAF1", ini:"Duc", fin:"Mon", piso:2, uc:{san:3,duc:2,lvra:1}, UC_otros:0, Lh:23.13, Lv:0, presionIni:P_red, desc:"" },
      { id:"Mon",  ini:"P2",  fin:"P1",  piso:"P2-P1", uc:{}, UC_otros:12.1, Lh:3.50, Lv:3.5, presionIni:null, desc:"" },
      { id:"RAF2", ini:"Lav", fin:"Mon", piso:1, uc:{san:3,duc:2,lvp:2,lvra:1,lvro:1}, UC_otros:0, Lh:23.88, Lv:0, presionIni:null, desc:"" },
      { id:"RAF4", ini:"Mon", fin:"Con", piso:1, uc:{}, UC_otros:25.7, Lh:7.54, Lv:0, presionIni:null, desc:"" },
      { id:"RAF5", ini:"Mon", fin:"Cal", piso:1, uc:{}, UC_otros:13.6, Lh:18.57, Lv:0, presionIni:null, desc:"" },
    );
  }
  const tramosRAC = tramosAC.map(t => ({
    id: t.id, ini: t.ini, fin: t.fin, piso: t.piso,
    uc: t.fixtures || {}, UC_otros: t.UC_otros || 0,
    Lh: t.Lh || 0, Lv: t.Lv || 0, desc: "",
  }));
  if (tramosRAC.length === 0) {
    tramosRAC.push(
      { id:"RAC1", ini:"Cal", fin:"1",   piso:1, uc:{duc:2,lvp:1,lvm:1,tin:1}, UC_otros:0, Lh:16.93, Lv:0, desc:"" },
      { id:"RAC2", ini:"Duc", fin:"Mon", piso:2, uc:{duc:1,lvm:1}, UC_otros:0, Lh:19.55, Lv:0, desc:"" },
      { id:"RAC3", ini:"Duc", fin:"Mon", piso:2, uc:{duc:1,lvm:1}, UC_otros:0, Lh:11.36, Lv:0, desc:"" },
      { id:"RAC4", ini:"Mon", fin:"Cal", piso:2, uc:{}, UC_otros:6, Lh:5.73, Lv:0, desc:"" },
    );
  }

  const ucMap = {};
  hidros.forEach(a => { ucMap[a.id] = { af: a.uc_af, ac: a.uc_ac, ud: a.ud }; });

  function calcTramos(lista, tipo) {
    const acum = {};
    const rows = [];
    const results = [];
    lista.forEach(t => {
      let UC_prop = 0;
      const propios = {};
      Object.entries(t.uc || {}).forEach(([key, cant]) => {
        const u = ucMap[key]?.[tipo] || 0;
        propios[key] = cant * u;
        UC_prop += cant * u;
      });
      const UC_acum = UC_prop + (t.UC_otros || 0);
      acum[t.id] = UC_acum;
      const numSalidas = Math.max(1, Object.values(t.uc || {}).reduce((s, v) => s + v, 0) || 2);
      rows.push({ id:t.id, piso:t.piso, propios, UC_propias:UC_prop, UC_otros:t.UC_otros||0, UC_acumulado:UC_acum, Lh:t.Lh, numSalidas });
      results.push(CalcHid.calcularTramoHidraulico({
        ramal:t.id, nudoIni:t.ini, nudoFin:t.fin, piso:t.piso,
        UC_propias:UC_prop, UC_otros:t.UC_otros||0, numSalidas,
        Lh_m:t.Lh, Lv_m:t.Lv||0,
        presionRed_mca:t.presionIni||P_red,
        material:tipo==="af"?"PVC":"CPVC", tipo:tipo==="af"?"AF":"AC",
        desc_otros:t.desc||"",
      }));
    });
    return { acum, rows, results };
  }

  const raf = calcTramos(tramosRAF, "af");
  const rac = calcTramos(tramosRAC, "ac");

  // Accesorio Le formula
  const accLe = (C, Dpulg, cantCRC90, cantTPDN, cantTPDR, cantTPL, cantTSB, cantVGA, cantVCA, cantRed, cantAmp, cantCRC45, cantVCH, cantVPC, cantCRM90, cantCRL90, cantVAA, cantOtros) => {
    const f = Math.pow(120/C, 1.85);
    let le = 0;
    if (cantCRC90) le += cantCRC90 * (0.76*Dpulg + 0.17) * f;
    if (cantTPDN) le += cantTPDN * (0.53*Dpulg + 0.04) * f;
    if (cantTPDR) le += cantTPDR * (0.56*Dpulg + 0.33) * f;
    if (cantTPL) le += cantTPL * (1.56*Dpulg + 0.37) * f;
    if (cantTSB) le += cantTSB * (1.56*Dpulg + 0.37) * f;
    if (cantVGA) le += cantVGA * (8.44*Dpulg + 0.50) * f;
    if (cantVCA) le += cantVCA * (0.17*Dpulg + 0.03) * f;
    if (cantRed) le += cantRed * (0.15*Dpulg + 0.01) * f;
    if (cantAmp) le += cantAmp * (0.31*Dpulg + 0.01) * f;
    if (cantCRC45) le += cantCRC45 * (0.38*Dpulg + 0.02) * f;
    if (cantVCH) le += cantVCH * (3.20*Dpulg + 0.03) * f;
    if (cantVPC) le += cantVPC * (6.38*Dpulg + 0.40) * f;
    if (cantCRM90) le += cantCRM90 * (0.67*Dpulg + 0.09) * f;
    if (cantCRL90) le += cantCRL90 * (0.52*Dpulg + 0.04) * f;
    if (cantVAA) le += cantVAA * (4.27*Dpulg + 0.25) * f;
    if (cantOtros) le += cantOtros;
    return parseFloat(le.toFixed(2));
  };

  // Accesorio counts per tramo tipo
  const accCountsAF = {
    RAF1: [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    Mon:  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    RAF2: [2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    RAF4: [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    RAF5: [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  };
  const accCountsAC = {
    RAC1: [1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
    RAC2: [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    RAC3: [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    RAC4: [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  };

  const wb = new ExcelJS.Workbook();
  wb.creator = "Ing. Camilo Cárdenas Chacón";

  const F9 = { name:"Calibri", size:9 };
  const F9B = { name:"Calibri", size:9, bold:true };
  const F9BI = { name:"Calibri", size:9, bold:true, italic:true };
  const F9R = { name:"Calibri", size:9, bold:true, italic:true, color:{argb:"FFFF0000"} };
  const F8 = { name:"Calibri", size:8 };
  const F8BI = { name:"Calibri", size:8, bold:true, italic:true };
  const F11 = { name:"Calibri", size:11 };
  const F11B = { name:"Calibri", size:11, bold:true };
  const F11BI = { name:"Calibri", size:11, bold:true, italic:true };
  const F14BI = { name:"Calibri", size:14, bold:true, italic:true };
  const F10B = { name:"Calibri", size:10, bold:true };
  const AC = { horizontal:"center", vertical:"middle" };
  const ACW = { horizontal:"center", vertical:"middle", wrapText:true };
  const AL = { horizontal:"left", vertical:"middle" };
  const AR = { horizontal:"right", vertical:"middle" };
  const BT = { top:{style:"thin"}, bottom:{style:"thin"}, left:{style:"thin"}, right:{style:"thin"} };
  const BH = { top:{style:"hair"}, bottom:{style:"hair"}, left:{style:"thin"}, right:{style:"thin"} };

  function numToCol(n) {
    let s = '';
    while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
    return s;
  }

  function sc(ws, ref, v, font, fill, align, border) {
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    const colLetter = match[1];
    const rowNum = parseInt(match[2], 10);
    let colNum = 0;
    for (let i = 0; i < colLetter.length; i++) {
      colNum = colNum * 26 + (colLetter.charCodeAt(i) - 64);
    }
    const row = ws.getRow(rowNum);
    ws.getColumn(colLetter);
    const c = row.getCell(colNum);
    if (v !== undefined && v !== null && v !== "") {
      const num = Number(v);
      c.value = isNaN(num) ? String(v) : num;
    }
    if (font) c.font = font;
    if (fill) c.fill = { type:"pattern", pattern:"solid", fgColor:{argb:fill} };
    if (align) c.alignment = align;
    if (border) c.border = border;
    return c;
  }

  // ═══ HOJA 1: Cabezote ═══
  const ws1 = wb.addWorksheet("Cabezote");
  ensureSheetRows(ws1, 10);
  ws1.mergeCells("A1:D7"); ws1.mergeCells("E2:L3"); ws1.mergeCells("E5:L5"); ws1.mergeCells("E7:I7");
  sc(ws1,"E1","Proyecto:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},{left:{style:"thin"},top:{style:"thin"}});
  sc(ws1,"E2",proyecto.nombre,F11B,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},{left:{style:"thin"},right:{style:"thin"},bottom:{style:"thin"}});
  sc(ws1,"E4","Sector:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},{left:{style:"thin"}});
  sc(ws1,"E6","Diseño:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},{left:{style:"thin"}});
  sc(ws1,"J6","Fecha:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},{left:{style:"thin"}});
  sc(ws1,"E7",proyecto.ingeniero,F11BI,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},{left:{style:"thin"},right:{style:"thin"},bottom:{style:"thin"}});
  sc(ws1,"J7",new Date().toISOString().slice(0,10),F11BI,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},{left:{style:"thin"},bottom:{style:"thin"}});

  // ═══ HOJA 2: UC Agua Caliente ═══
  const ws2 = wb.addWorksheet("UC Agua Caliente");
  ensureSheetRows(ws2, 35);
  ws2.mergeCells("A1:B7");
  ws2.mergeCells("E2:P3"); ws2.mergeCells("E5:P5"); ws2.mergeCells("E7:K7"); ws2.mergeCells("L7:O7");
  ws2.mergeCells("A8:P8");
  ws2.mergeCells("A9:A12"); ws2.mergeCells("B9:B12"); ws2.mergeCells("C9:C12"); ws2.mergeCells("D9:D12");
  ws2.mergeCells("E9:E11"); ws2.mergeCells("F9:F11"); ws2.mergeCells("G9:G11"); ws2.mergeCells("H9:H11");
  ws2.mergeCells("I9:I11"); ws2.mergeCells("J9:J11"); ws2.mergeCells("K9:K11"); ws2.mergeCells("L9:L11");
  ws2.mergeCells("M9:N9"); ws2.mergeCells("M10:M12"); ws2.mergeCells("N10:N12");
  ws2.mergeCells("O9:O11"); ws2.mergeCells("P9:P11");
  ws2.mergeCells("Q12:AF12");

  sc(ws2,"E1","Proyecto:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},BT);
  sc(ws2,"E2",proyecto.nombre,F11B,"FFFFFFFF",{horizontal:"left",vertical:"middle",wrapText:true,indent:1},BT);
  sc(ws2,"E4","Sector:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},BT);
  sc(ws2,"E6","Diseño:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},{left:{style:"thin"},top:{style:"thin"}});
  sc(ws2,"L6","Fecha:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},{left:{style:"thin"},top:{style:"thin"}});
  sc(ws2,"E7",proyecto.ingeniero,F11BI,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},{left:{style:"thin"},right:{style:"thin"},bottom:{style:"thin"}});
  sc(ws2,"L7",new Date().toISOString().slice(0,10),F11BI,"FFFFFFFF",AC,{left:{style:"thin"},bottom:{style:"thin"}});
  sc(ws2,"A8","CALCULO UNIDADES DE CONSUMO AGUA CALIENTE",F11BI,"FFFFFFFF",AC,BT);

  // Accesorio headers rotados Q1-AF1
  const accNames = ["Codo radio corto 90","Tee paso Directo normal","Tee paso directo con reduccion","Tee paso Lado","Tee salida bilateral","Valvula de globo abierta","Valvula compuerta abierta","Reduccion","Ampliacion","Codo radio corto 45","Valvula cheque","Valvula de pie con coladera","Codo radio medio 90","Codo radio largo 90","Valvula de angulo abierta","Otros ( definir la Le)"];
  const accCols = "Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF".split(",");
  accNames.forEach((n,i) => {
    ws2.mergeCells(`${accCols[i]}1:${accCols[i]}11`);
    sc(ws2,`${accCols[i]}1`,n,F11B,"FFFFFFFF",{horizontal:"center",textRotation:90},{right:{style:"thin"},top:{style:"thin"},bottom:{style:"thin"}});
  });

  const appUCac = { san:0, lvm:0.5, duc:1, lvp:1, tin:1, lvra:1, lvro:1 };
  const appNamesAC = ["Inodoro","Lavamanos","Ducha","Lavaplatos Cocina","Tina","Lavadora","Lavadero"];
  const appKeysAC = ["san","lvm","duc","lvp","tin","lvra","lvro"];
  const hdrColsAC = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P".split(",");

  sc(ws2,"A9","Tramo",F9B,"FFFFFFFF",{...ACW,textRotation:0},BT);
  sc(ws2,"B9","Piso",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);
  sc(ws2,"C9","Inicia",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);
  sc(ws2,"D9","Termina",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);
  appKeysAC.forEach((k,i) => sc(ws2,`${String.fromCharCode(69+i)}9`,appNamesAC[i],F10B,"FFFFFFFF",{horizontal:"center",wrapText:true,textRotation:90},BT));
  sc(ws2,"M9","Unidades de Consumo",F9B,"FFFFFFFF",ACW,BT);
  sc(ws2,"O9","Longitud de tuberia",F9B,"FFFFFFFF",{...ACW,textRotation:90},BT);
  sc(ws2,"P9","No de salida Simultaneas",F9B,"FFFFFFFF",{horizontal:"left",vertical:"middle",wrapText:true,textRotation:90},BT);
  sc(ws2,"M10","Parcial",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);
  sc(ws2,"N10","Acumulado",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);

  // Row 12 UC values
  sc(ws2,"E12",0,F9B,"FFFFFFFF",AC,BT); sc(ws2,"F12",0.5,F9B,"FFFFFFFF",AC,BT);
  sc(ws2,"G12",1,F9B,"FFFFFFFF",AC,BT); sc(ws2,"H12",1,F9B,"FFFFFFFF",AC,BT);
  sc(ws2,"I12",1,F9B,"FFFFFFFF",AC,BT); sc(ws2,"J12",1,F9B,"FFFFFFFF",AC,BT);
  sc(ws2,"K12",1,F9B,"FFFFFFFF",AC,BT);
  sc(ws2,"O12","m",F9B,"FFFFFFFF",AC,{left:{style:"thin"},top:{style:"thin"}});
  sc(ws2,"P12","No.",F9B,"FFFFFFFF",AC,{left:{style:"thin"},top:{style:"thin"}});
  sc(ws2,"Q12","No Accesorios por Tramo",F14BI,"FFFFFFFF",AC,{left:{style:"thin"},right:{style:"thin"},top:{style:"thin"}});

  // Datos RAC
  let rn = 14;
  rac.rows.forEach((t,i) => {
    const acr = rac.results[i];
    const accs = accCountsAC[t.id] || [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    sc(ws2,`A${rn}`,t.id,F8,"FFFFFFFF",{horizontal:"center"},BH);
    sc(ws2,`B${rn}`,String(t.piso),F8,"FFFFFFFF",AC,BH);
    sc(ws2,`C${rn}`,acr.nudoIni,F8,"FFFFFFFF",AC,BH);
    sc(ws2,`D${rn}`,acr.nudoFin,F8,"FFFFFFFF",AC,BH);
    appKeysAC.forEach((k,j) => sc(ws2,`${String.fromCharCode(69+j)}${rn}`,t.propios[k]?Math.round(t.propios[k]/appUCac[k]):"",F8,"FFFFFFFF",AC,BH));
    sc(ws2,`M${rn}`,t.UC_propias,F9,"FFFFFFFF",AC,BH);
    sc(ws2,`O${rn}`,t.Lh,F9,"FFFFFFFF",AC,BH);
    sc(ws2,`P${rn}`,t.numSalidas,F9,"FFFFFFFF",AC,BH);
    accs.forEach((v,j) => sc(ws2,`${accCols[j]}${rn}`,v,F9,"FFFFFFFF",AC,BH));
    rn += (t.id==="RAC1"?1:2);
  });

  // ═══ HOJA 3: UC Agua Fria ═══
  const ws3 = wb.addWorksheet("UC Agua Fria");
  ensureSheetRows(ws3, 35);
  ws3.mergeCells("A1:B7"); ws3.mergeCells("E2:Q3"); ws3.mergeCells("E5:Q5"); ws3.mergeCells("E7:M7"); ws3.mergeCells("N7:P7");
  ws3.mergeCells("A8:Q8");
  ws3.mergeCells("A9:A12"); ws3.mergeCells("B9:B12"); ws3.mergeCells("C9:C12"); ws3.mergeCells("D9:D12");
  ws3.mergeCells("E9:E11"); ws3.mergeCells("F9:F11"); ws3.mergeCells("G9:G11"); ws3.mergeCells("H9:H11");
  ws3.mergeCells("I9:I11"); ws3.mergeCells("J9:J11"); ws3.mergeCells("K9:K11"); ws3.mergeCells("L9:L11");
  ws3.mergeCells("M9:M11"); ws3.mergeCells("N9:O9"); ws3.mergeCells("N10:N12"); ws3.mergeCells("O10:O12");
  ws3.mergeCells("P9:P11"); ws3.mergeCells("Q9:Q11");
  ws3.mergeCells("R12:AG12");

  sc(ws3,"E1","Proyecto:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},BT);
  sc(ws3,"E2",proyecto.nombre,F11B,"FFFFFFFF",{horizontal:"left",vertical:"middle",wrapText:true,indent:1},BT);
  sc(ws3,"E4","Sector:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},BT);
  sc(ws3,"E6","Diseño:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},{left:{style:"thin"},top:{style:"thin"}});
  sc(ws3,"M6","Fecha:",F8BI,"FFFFFFFF",{horizontal:"left",indent:1},{left:{style:"thin"},top:{style:"thin"}});
  sc(ws3,"E7",proyecto.ingeniero,F11BI,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},{left:{style:"thin"},right:{style:"thin"},bottom:{style:"thin"}});
  sc(ws3,"M7",new Date().toISOString().slice(0,10),F11BI,"FFFFFFFF",AC,{left:{style:"thin"},bottom:{style:"thin"}});
  sc(ws3,"A8","CALCULO UNIDADES DE CONSUMO AGUA FRIA",F11BI,"FFFFFFFF",AC,BT);

  const accColsAF2 = "R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF,AG".split(",");
  const accNamesAF = ["Codo radio corto 90","Tee paso Directo normal","Tee paso directo con reduccion","Tee paso Lado","Tee salida bilateral","Valvula de globo abierta","Valvula compuerta abierta","Reduccion","Ampliacion","Codo radio corto 45","Valvula cheque","Valvula de pie con coladera","Codo radio medio 90","Codo radio largo 90","Valvula de angulo abierta","Otros ( definir la Le)"];
  accNamesAF.forEach((n,i) => {
    ws3.mergeCells(`${accColsAF2[i]}1:${accColsAF2[i]}11`);
    sc(ws3,`${accColsAF2[i]}1`,n,F11B,"FFFFFFFF",{horizontal:"center",textRotation:90},{right:{style:"thin"},top:{style:"thin"},bottom:{style:"thin"}});
  });

  const appUCaf = { san:2.2, lvm:0.5, duc:1, lvp:1, tin:1, lvra:1, lvro:0.75, nev:0.5 };
  const appNamesAF = ["Inodoro","Lavamanos","Ducha","Lavaplatos Cocina","Tina","Lavadora","Lavadero","Nevera"];
  const appKeysAF = ["san","lvm","duc","lvp","tin","lvra","lvro","nev"];

  sc(ws3,"A9","Tramo",F9B,"FFFFFFFF",{...ACW,textRotation:0},BT);
  sc(ws3,"B9","Piso",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);
  sc(ws3,"C9","Inicia",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);
  sc(ws3,"D9","Termina",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);
  appKeysAF.forEach((k,i) => sc(ws3,`${String.fromCharCode(69+i)}9`,appNamesAF[i],F10B,"FFFFFFFF",{horizontal:"center",wrapText:true,textRotation:90},BT));
  sc(ws3,"N9","Unidades de Consumo",F9B,"FFFFFFFF",ACW,BT);
  sc(ws3,"P9","Longitud de tuberia Lh",F9B,"FFFFFFFF",{...ACW,textRotation:90},BT);
  sc(ws3,"Q9","No de salida Simultaneas",F9B,"FFFFFFFF",{horizontal:"left",vertical:"middle",wrapText:true,textRotation:90},BT);
  sc(ws3,"N10","Parcial",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);
  sc(ws3,"O10","Acumulado",F9B,"FFFFFFFF",{...AC,textRotation:90},BT);

  sc(ws3,"E12",2.2,F9B,"FFFFFFFF",AC,BT); sc(ws3,"F12",0.5,F9B,"FFFFFFFF",AC,BT);
  sc(ws3,"G12",1,F9B,"FFFFFFFF",AC,BT); sc(ws3,"H12",1,F9B,"FFFFFFFF",AC,BT);
  sc(ws3,"I12",1,F9B,"FFFFFFFF",AC,BT); sc(ws3,"J12",1,F9B,"FFFFFFFF",AC,BT);
  sc(ws3,"K12",1,F9B,"FFFFFFFF",AC,BT); sc(ws3,"L12",0.5,F9B,"FFFFFFFF",AC,BT);
  sc(ws3,"P12","m",F9B,"FFFFFFFF",AC,{left:{style:"thin"},top:{style:"thin"}});
  sc(ws3,"Q12","No.",F9B,"FFFFFFFF",AC,{left:{style:"thin"},top:{style:"thin"}});
  sc(ws3,"R12","No Accesorios por Tramo",F14BI,"FFFFFFFF",AC,{left:{style:"thin"},right:{style:"thin"},top:{style:"thin"}});

  rn = 14;
  raf.rows.forEach((t,i) => {
    const afr = raf.results[i];
    if (t.id==="Mon") { sc(ws3,`A${rn}`,t.id,F8,"FFFFFFFF",{horizontal:"center"},BH); rn++; }
    if (t.id==="RAF2") rn = 17;
    const accs = accCountsAF[t.id] || [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    sc(ws3,`A${rn}`,t.id,F8,"FFFFFFFF",{horizontal:"center"},BH);
    sc(ws3,`B${rn}`,String(t.piso),F8,"FFFFFFFF",AC,BH);
    sc(ws3,`C${rn}`,afr.nudoIni,F8,"FFFFFFFF",AC,BH);
    sc(ws3,`D${rn}`,afr.nudoFin,F8,"FFFFFFFF",AC,BH);
    appKeysAF.forEach((k,j) => sc(ws3,`${String.fromCharCode(69+j)}${rn}`,t.propios[k]?Math.round(t.propios[k]/appUCaf[k]):"",F8,"FFFFFFFF",AC,BH));
    sc(ws3,`N${rn}`,t.UC_propias,F9,"FFFFFFFF",AC,BH);
    sc(ws3,`P${rn}`,t.Lh,F9,"FFFFFFFF",AC,BH);
    sc(ws3,`Q${rn}`,t.numSalidas,F9,"FFFFFFFF",AC,BH);
    accs.forEach((v,j) => sc(ws3,`${accColsAF2[j]}${rn}`,v,F9,"FFFFFFFF",AC,BH));
    rn++;
  });

  // ═══ HOJA 4: Calculo RAF VF ═══
  const ws4 = wb.addWorksheet("Calculo RAF VF");
  ensureSheetRows(ws4, 60);
  ws4.mergeCells("A1:F7"); ws4.mergeCells("G2:W3"); ws4.mergeCells("G5:W5"); ws4.mergeCells("G7:S7"); ws4.mergeCells("T7:Y7");
  ws4.mergeCells("A8:Y9");
  ws4.mergeCells("A10:C11"); ws4.mergeCells("D10:D12"); ws4.mergeCells("E10:G11"); ws4.mergeCells("H10:H12");
  ws4.mergeCells("I10:I12"); ws4.mergeCells("J10:J11"); ws4.mergeCells("K10:M11"); ws4.mergeCells("N10:N12");
  ws4.mergeCells("O10:O12"); ws4.mergeCells("P10:P11"); ws4.mergeCells("Q10:T10"); ws4.mergeCells("U10:V11");
  ws4.mergeCells("W10:W12"); ws4.mergeCells("X10:Y11"); ws4.mergeCells("Q11:R11"); ws4.mergeCells("S11:S12");
  ws4.mergeCells("T11:T12"); ws4.mergeCells("AC12:AR12");

  sc(ws4,"G1","Proyecto:",F8BI,"FFFFFFFF",AL,null);
  sc(ws4,"G2",proyecto.nombre,F11B,"FFFFFFFF",{horizontal:"left",vertical:"middle",wrapText:true},null);
  sc(ws4,"G4","Sector:",F8BI,"FFFFFFFF",AL,null);
  sc(ws4,"G5","0",F8,"FFFFFFFF",AL,null);
  sc(ws4,"G6","Diseño:",F8BI,"FFFFFFFF",AL,null);
  sc(ws4,"T6","Fecha:",F8BI,"FFFFFFFF",AL,null);
  sc(ws4,"G7",proyecto.ingeniero,F11BI,"FFFFFFFF",{horizontal:"left",vertical:"middle"},null);
  sc(ws4,"T7",new Date().toISOString().slice(0,10),F11BI,"FFFFFFFF",{horizontal:"left",vertical:"middle"},null);
  sc(ws4,"A8","DISEÑO RED HIDRAULICA - AGUA FRIA",F14BI,"FFFFFFFF",{...ACW},null);

  const hdr4 = (r,v,f) => sc(ws4,r,v,f||F9B,"FFFFFFFF",ACW,{top:{style:"thin"},bottom:{style:"thin"},left:{style:"thin"},right:{style:"thin"}});
  const hdr4B = (r,v,f) => sc(ws4,r,v,f||F9B,"FFFFFFFF",ACW,BT);
  hdr4B("A10","TRAMO\nNUDO"); hdr4B("D10","PISO",{...F9B,color:{argb:"FFFF0000"}});
  hdr4B("E10","UND\nconsumo"); hdr4B("H10","No de Salidas",{...F8,color:{argb:"FFFF0000"}});
  hdr4B("I10","Coeficiente  Simultaneidad\nK",F8); hdr4B("J10","Q\nprob");
  hdr4("K10","DIAMETRO"); hdr4("N10","Material");
  hdr4B("O10","Coeficiente \nfriccion C",{...F9B,color:{argb:"FF000000"}});
  hdr4B("P10","Velocidad\n500<V<2500"); hdr4("Q10","LONGITUD (m)");
  hdr4B("U10","Hf\nPERDIDAS\npor friccion"); hdr4B("W10","ΔZ\n(m)");
  hdr4B("X10","Presion final \n(mca)");
  hdr4("Q11","Tuberia"); hdr4("S11","Le\nAcces"); hdr4("T11","Total");

  // Row 12 sub-headers
  const rh = (r,v,f) => sc(ws4,r,v,f||F9B,"FFFFFFFF",ACW,BT);
  rh("A12","RAM",F9R); rh("B12","INI",F9R); rh("C12","FIN",F9R);
  rh("E12","Propia",F9R); rh("F12","Otros\nRamales",F9R); rh("G12","ACUM",F9R);
  rh("J12","(l/s)"); rh("K12","Estimado"); rh("L12","Diseño\n(pulg)",F9R);
  rh("M12","Interno\nmm"); rh("P12","(mm/s)"); rh("Q12","H"); rh("R12","V");
  rh("U12","(%)"); rh("V12","(m)"); rh("X12","INI"); rh("Y12","FIN");
  sc(ws4,"AA12","Let",F9BI,"FFFFFFFF",AC,BT);
  sc(ws4,"AB12","D",F9BI,"FFFFFFFF",ACW,BT);
  sc(ws4,"AC12","Longitud equivalente por accesorios (m)",F14BI,"FFFFFFFF",AC,BT);
  sc(ws4,"AS12","Qnominal",F8,"FFFFFFFF",{horizontal:"left",vertical:"top"},null);

  // Accesorio headers rotados col AC-AR
  const accHCols = "AC,AD,AE,AF,AG,AH,AI,AJ,AK,AL,AM,AN,AO,AP,AQ,AR".split(",");
  accNames.forEach((n,i) => {
    sc(ws4,`${accHCols[i]}1`,n,F11B,"FFFFFFFF",{horizontal:"center",textRotation:90},{right:{style:"thin"},top:{style:"thin"},bottom:{style:"thin"}});
  });
  sc(ws4,"AS1","Medidor",F11B,"FFFFFFFF",{horizontal:"center"},null);

  // Data RAF
  rn = 13;
  raf.results.forEach((r,i) => {
    const t = raf.rows[i];
    const accs = accCountsAF[t.id] || [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const Dp = r.pulg;
    const Le = accLe(r.C, Dp, accs[0],accs[1],accs[2],accs[3],accs[4],accs[5],accs[6],accs[7],accs[8],accs[9],accs[10],accs[11],accs[12],accs[13],accs[14],accs[15]);
    const Dcalc = Math.sqrt(r.Q_Ls);
    const Ltotal = r.Lh_m + (r.Lv_m||0) + Le;
    const hfUnit = (60.1*Math.pow(r.V_mms,1.852)/Math.pow(r.C,1.852)/Math.pow(r.D_int_mm,1.167))/100;
    const hfTotal = Ltotal * hfUnit / 10;
    const Pini = i===0?P_red:(raf.results[i-1]?.P_fin_mca||P_red);
    const Pfin = Math.max(0, Pini - hfTotal - (r.Lv_m||0));

    if (t.id==="Mon") { sc(ws4,`A${rn}`,t.id,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH); rn++; }
    if (t.id==="RAF2") rn = 17;
    sc(ws4,`A${rn}`,t.id,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`B${rn}`,r.nudoIni,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`C${rn}`,r.nudoFin,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`D${rn}`,String(t.piso),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`E${rn}`,t.UC_propias,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`F${rn}`,t.UC_otros||"",F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`G${rn}`,t.UC_acumulado,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`H${rn}`,t.numSalidas,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`I${rn}`,parseFloat(r.K.toFixed(2)),F9,"FFFFFFFF",AC,BH);
    sc(ws4,`J${rn}`,parseFloat(r.Q_Ls.toFixed(3)),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`K${rn}`,parseFloat(Dcalc.toFixed(2)),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`L${rn}`,r.diamNominal,F9,"FFFFFFFF",{horizontal:"left",vertical:"top",wrapText:true},BH);
    sc(ws4,`M${rn}`,r.D_int_mm,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`N${rn}`,r.material,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`O${rn}`,r.C,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`P${rn}`,parseFloat(r.V_mms.toFixed(1)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws4,`Q${rn}`,r.Lh_m,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`R${rn}`,r.Lv_m||0,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`S${rn}`,parseFloat(Le.toFixed(2)),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`T${rn}`,parseFloat(Ltotal.toFixed(2)),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws4,`U${rn}`,parseFloat(hfUnit.toFixed(4)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws4,`V${rn}`,parseFloat(hfTotal.toFixed(2)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws4,`W${rn}`,r.Lv_m||0,F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws4,`X${rn}`,parseFloat(Pini.toFixed(2)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws4,`Y${rn}`,parseFloat(Pfin.toFixed(2)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws4,`AA${rn}`,parseFloat(Le.toFixed(2)),F8,"FFFFFFFF",{horizontal:"center",vertical:"top"},BH);
    sc(ws4,`AB${rn}`,r.pulg,F9,"FF92D050",AC,BH);
    accs.forEach((v,j) => sc(ws4,`${accHCols[j]}${rn}`,v,F9,"FFFFFFFF",AC,BH));
    rn++;
  });

  // Acometida/contador
  sc(ws4,`A${rn}`,"ACOMETIDA",F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},null);
  sc(ws4,`L${rn}`,"Contador",F9,"FFFFFFFF",{horizontal:"left",vertical:"top",wrapText:true},null);
  sc(ws4,`M${rn}`,1,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},null);
  sc(ws4,`P${rn}`,"Qn (lps):",F9,"FFFFFFFF",AC,null);
  sc(ws4,`Q${rn}`,1.96,F9,"FFFFFFFF",AC,null);
  sc(ws4,`T${rn}`,"Hf (m.c.a.) =",F9,"FFFFFFFF",AC,null);
  sc(ws4,`V${rn}`,1.54,F9,"FFFFFFFF",AC,null);
  sc(ws4,`W${rn}`,"< 10",F9,"FFFFFFFF",AC,null);
  rn++;
  // RED + CONT
  sc(ws4,`A${rn}`,"RED",F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
  sc(ws4,`C${rn}`,"CONT",F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
  sc(ws4,`J${rn}`,raf.results[raf.results.length-1]?.Q_Ls||0.769,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
  rn++;
  sc(ws4,`A${rn}`,"CONT",F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
  sc(ws4,`C${rn}`,"Mon",F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);

  // Presiones minimas
  rn += 3;
  sc(ws4,`P${rn}`,"Sigla",F9,"FFFFFFFF",AC,null); sc(ws4,`Q${rn}`,"Descripcion",F9,"FFFFFFFF",{horizontal:"left",vertical:"middle"},null);
  sc(ws4,`U${rn}`,"Pmin (mca)",F9,"FFFFFFFF",AC,null); sc(ws4,`V${rn}`,"Pmax (mca)",F9,"FFFFFFFF",AC,null);
  const presApps = [{s:"Lvm :",d:"Lavamanos",min:0.51,max:5.63},{s:"San :",d:"Sanitario",min:0.71,max:14.08},{s:"Lvp :",d:"Lavaplatos",min:0.51,max:5.63},{s:"Lvra :",d:"Lavadora",min:0.51,max:5.63},{s:"Lvro :",d:"Lavadero",min:0.51,max:5.63},{s:"Duc :",d:"Ducha",min:1.02,max:5.63},{s:"Tin :",d:"Tina",min:0.51,max:14.08}];
  presApps.forEach(p => { rn++; sc(ws4,`P${rn}`,p.s,F9,"FFFFFFFF",AC,BH); sc(ws4,`Q${rn}`,p.d,F9,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},BH); sc(ws4,`U${rn}`,p.min,F9,"FFFFFFFF",AC,BH); sc(ws4,`V${rn}`,p.max,F9,"FFFFFFFF",AC,BH); });

  // ═══ HOJA 5: Calculo RAC VF ═══
  const ws5 = wb.addWorksheet("Calculo RAC VF");
  ensureSheetRows(ws5, 50);
  ws5.mergeCells("A1:F7"); ws5.mergeCells("G2:W3"); ws5.mergeCells("G5:W5"); ws5.mergeCells("G7:S7"); ws5.mergeCells("T7:Y7");
  ws5.mergeCells("A8:Y9");
  ws5.mergeCells("A10:C11"); ws5.mergeCells("D10:D12"); ws5.mergeCells("E10:G11"); ws5.mergeCells("H10:H12");
  ws5.mergeCells("I10:I12"); ws5.mergeCells("J10:J11"); ws5.mergeCells("K10:M11"); ws5.mergeCells("N10:N12");
  ws5.mergeCells("O10:O12"); ws5.mergeCells("P10:P11"); ws5.mergeCells("Q10:T10"); ws5.mergeCells("U10:V11");
  ws5.mergeCells("W10:W12"); ws5.mergeCells("X10:Y11"); ws5.mergeCells("Q11:R11"); ws5.mergeCells("S11:S12");
  ws5.mergeCells("T11:T12"); ws5.mergeCells("AC12:AR12");

  sc(ws5,"G1","Proyecto:",F8BI,"FFFFFFFF",AL,null);
  sc(ws5,"G2",proyecto.nombre,F11B,"FFFFFFFF",{horizontal:"left",vertical:"middle",wrapText:true},null);
  sc(ws5,"G4","Sector:",F8BI,"FFFFFFFF",AL,null);
  sc(ws5,"G5","0",F8,"FFFFFFFF",AL,null);
  sc(ws5,"G6","Diseño:",F8BI,"FFFFFFFF",AL,null);
  sc(ws5,"T6","Fecha:",F8BI,"FFFFFFFF",AL,null);
  sc(ws5,"G7",proyecto.ingeniero,F11BI,"FFFFFFFF",{horizontal:"left",vertical:"middle"},null);
  sc(ws5,"T7",new Date().toISOString().slice(0,10),F11BI,"FFFFFFFF",{horizontal:"left",vertical:"middle"},null);
  sc(ws5,"A8","DISEÑO RED HIDRAULICA - AGUA CALIENTE",F14BI,"FFFFFFFF",{...ACW},null);

  // Same headers as RAF
  const hh5 = (r,v,f) => sc(ws5,r,v,f||F9B,"FFFFFFFF",ACW,BT);
  hh5("A10","TRAMO\nNUDO"); hh5("D10","PISO",{...F9B,color:{argb:"FFFF0000"}});
  hh5("E10","UND\nconsumo"); hh5("H10","No de Salidas",{...F8,color:{argb:"FFFF0000"}});
  hh5("I10","Coeficiente  Simultaneidad\nK",F8); hh5("J10","Q\nprob");
  hh5("K10","DIAMETRO"); hh5("N10","Material");
  hh5("O10","Coeficiente \nfriccion C",{...F9B,color:{argb:"FF000000"}});
  hh5("P10","Velocidad\n500<V<2500"); hh5("Q10","LONGITUD (m)");
  hh5("U10","Hf\nPERDIDAS\npor friccion"); hh5("W10","ΔZ\n(m)");
  hh5("X10","Presion final \n(mca)");
  hh5("Q11","Tuberia"); hh5("S11","Le\nAcces"); hh5("T11","Total");
  const rh5 = (r,v,f) => sc(ws5,r,v,f||F9B,"FFFFFFFF",ACW,BT);
  rh5("A12","Ramal",F9R); rh5("B12","INI",F9R); rh5("C12","FIN",F9R);
  rh5("E12","Propia",F9R); rh5("F12","Otros\nRamales",F9R); rh5("G12","ACUM",F9R);
  rh5("J12","(l/s)"); rh5("K12","Estimado"); rh5("L12","Diseño\n(pulg)",F9R);
  rh5("M12","Interno\nmm"); rh5("P12","(mm/s)"); rh5("Q12","H"); rh5("R12","V");
  rh5("U12","(%)"); rh5("V12","(m)"); rh5("X12","INI"); rh5("Y12","FIN");
  sc(ws5,"AA12","Let",F9BI,"FFFFFFFF",AC,BT);
  sc(ws5,"AB12","D",F9BI,"FFFFFFFF",ACW,BT);
  sc(ws5,"AC12","Longitud equivalente por accesorios (m)",F14BI,"FFFFFFFF",AC,BT);
  accNames.forEach((n,i) => sc(ws5,`${accHCols[i]}1`,n,F11B,"FFFFFFFF",{horizontal:"center",textRotation:90},{right:{style:"thin"},top:{style:"thin"},bottom:{style:"thin"}}));
  sc(ws5,"AS1","Medidor",F11B,"FFFFFFFF",{horizontal:"center"},null);

  // Data RAC
  rn = 13;
  rac.results.forEach((r,i) => {
    const t = rac.rows[i];
    const accs = accCountsAC[t.id] || [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const Dp = r.pulg;
    const Le = accLe(r.C, Dp, accs[0],accs[1],accs[2],accs[3],accs[4],accs[5],accs[6],accs[7],accs[8],accs[9],accs[10],accs[11],accs[12],accs[13],accs[14],accs[15]);
    const Dcalc = Math.sqrt(r.Q_Ls);
    const Ltotal = r.Lh_m + (r.Lv_m||0) + Le;
    const hfUnit = (60.1*Math.pow(r.V_mms,1.852)/Math.pow(r.C,1.852)/Math.pow(r.D_int_mm,1.167))/100;
    const hfTotal = Ltotal * hfUnit / 10;
    const Pini = i===0?P_red:(rac.results[i-1]?.P_fin_mca||P_red);
    const Pfin = Math.max(0, Pini - hfTotal - (r.Lv_m||0));

    if (t.id==="RAC2") rn = 16;
    sc(ws5,`A${rn}`,t.id,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`B${rn}`,r.nudoIni,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`C${rn}`,r.nudoFin,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`D${rn}`,String(t.piso),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`E${rn}`,t.UC_propias,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`G${rn}`,t.UC_acumulado,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`H${rn}`,t.numSalidas,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`I${rn}`,parseFloat(r.K.toFixed(2)),F9,"FFFFFFFF",AC,BH);
    sc(ws5,`J${rn}`,parseFloat(r.Q_Ls.toFixed(3)),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`K${rn}`,parseFloat(Dcalc.toFixed(2)),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`L${rn}`,r.diamNominal,F9,"FFFFFFFF",{horizontal:"left",vertical:"top",wrapText:true},BH);
    sc(ws5,`M${rn}`,r.D_int_mm,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`N${rn}`,r.material,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`O${rn}`,r.C,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`P${rn}`,parseFloat(r.V_mms.toFixed(1)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws5,`Q${rn}`,r.Lh_m,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`R${rn}`,r.Lv_m||0,F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`S${rn}`,parseFloat(Le.toFixed(2)),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`T${rn}`,parseFloat(Ltotal.toFixed(2)),F9,"FFFFFFFF",{horizontal:"center",vertical:"top",wrapText:true},BH);
    sc(ws5,`U${rn}`,parseFloat(hfUnit.toFixed(4)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws5,`V${rn}`,parseFloat(hfTotal.toFixed(2)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws5,`W${rn}`,r.Lv_m||0,F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws5,`X${rn}`,parseFloat(Pini.toFixed(2)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws5,`Y${rn}`,parseFloat(Pfin.toFixed(2)),F9,"FFFFFFFF",{horizontal:"right",vertical:"top",wrapText:true},BH);
    sc(ws5,`AA${rn}`,parseFloat(Le.toFixed(2)),F8,"FFFFFFFF",{horizontal:"center",vertical:"top"},BH);
    sc(ws5,`AB${rn}`,r.pulg,F9,"FF92D050",AC,BH);
    accs.forEach((v,j) => sc(ws5,`${accHCols[j]}${rn}`,v,F9,"FFFFFFFF",AC,BH));
    rn++;
  });

  // Chequeo + Seleccion calentador
  rn += 1;
  ws5.mergeCells(`G${rn}:L${rn}`);
  sc(ws5,`G${rn}`,"SELECCIÓN CALENTADOR",F9B,"FFFFFFFF",AC,null);
  sc(ws5,`P${rn}`,"Sigla",F9BI,"FFFFFFFF",AC,null); sc(ws5,`Q${rn}`,"Descripcion",F9BI,"FFFFFFFF",{horizontal:"left",vertical:"middle"},null);
  sc(ws5,`U${rn}`,"Pmin (mca)",F9BI,"FFFFFFFF",AC,null); sc(ws5,`V${rn}`,"Pmax (mca)",F9BI,"FFFFFFFF",AC,null);
  rn++;
  sc(ws5,`I${rn}`,"Cantidad",F9B,"FFFFFFFF",AC,null); sc(ws5,`J${rn}`,"UC",F9B,"FFFFFFFF",AC,null);
  sc(ws5,`K${rn}`,"Total UC",F9B,"FFFFFFFF",AC,null);
  presApps.forEach(p => { sc(ws5,`P${rn}`,p.s,F9,"FFFFFFFF",AC,null); sc(ws5,`Q${rn}`,p.d,F9,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},null); sc(ws5,`U${rn}`,p.min,F9,"FFFFFFFF",AC,null); sc(ws5,`V${rn}`,p.max,F9,"FFFFFFFF",AC,null); rn++; });
  rn -= presApps.length;
  const calData = [{n:"Duchas",c:4,u:1},{n:"Lavamanos",c:5,u:0.5},{n:"Tina",c:1,u:1},{n:"Lavadora",c:1,u:1},{n:"Lavaplatos",c:2,u:1}];
  let totalUC = 0;
  calData.forEach(d => {
    const tu = d.c*d.u; totalUC += tu;
    sc(ws5,`G${rn}`,d.n,F9,"FFFFFFFF",{horizontal:"left"},BH);
    sc(ws5,`I${rn}`,d.c,F9,"FFFFFFFF",AC,BH);
    sc(ws5,`J${rn}`,d.u,F9,"FFFFFFFF",AC,BH);
    sc(ws5,`K${rn}`,tu,F9,"FFFFFFFF",AC,BH);
    rn++;
  });
  sc(ws5,`G${rn}`,"Total",F9B,"FFFFFFFF",AL,null); sc(ws5,`H${rn}`,"UC",F9B,"FFFFFFFF",AC,null); sc(ws5,`K${rn}`,totalUC,F9,"FFFFFFFF",AC,null);
  rn++;
  const Kcal = CalcHid.factorSimultaneidad(calData.length);
  const Qcal = CalcHid.caudalHunterLPS(totalUC, Kcal);
  sc(ws5,`G${rn}`,"Caudal Probable",F9,"FFFFFFFF",AL,null); sc(ws5,`K${rn}`,parseFloat(Qcal.toFixed(3)),F9,"FFFFFFFF",AC,null); sc(ws5,`L${rn}`,"Lps",F9,"FFFFFFFF",AC,null); rn++;
  sc(ws5,`K${rn}`,parseFloat((Qcal*15.85).toFixed(2)),F9,"FFFFFFFF",AC,null); sc(ws5,`L${rn}`,"GPM",F9,"FFFFFFFF",AC,null); rn++;
  sc(ws5,`K${rn}`,parseFloat((Qcal*60).toFixed(2)),F9,"FFFFFFFF",AC,null); sc(ws5,`L${rn}`,"LPM",F9,"FFFFFFFF",AC,null); rn++;
  sc(ws5,`G${rn}`,"Factor de simultaneidad",F9,"FFFFFFFF",AL,null); sc(ws5,`K${rn}`,parseFloat(Kcal.toFixed(2)),F9,"FFFFFFFF",AC,null); rn++;
  const Qajust = Qcal*60*0.5;
  sc(ws5,`G${rn}`,"Caudal Ajustado",F9,"FFFFFFFF",AL,null); sc(ws5,`K${rn}`,parseFloat(Qajust.toFixed(2)),F9,"FFFFFFFF",AC,null); rn++;
  sc(ws5,`G${rn}`,"Usar Calentador de >=20 LPM Paso Directo Gas Natural",F9,"FFFFFFFF",{horizontal:"left"},null);

  // ═══ HOJA 6: Base Datos ═══
  const ws6 = wb.addWorksheet("Base Datos");
  ensureSheetRows(ws6, 30);
  ws6.mergeCells("I3:L3"); ws6.mergeCells("Q3:T3");
  sc(ws6,"I3","AGUA FRIA",F11BI,"FFFFFF00",{horizontal:"center",vertical:"top",wrapText:true},BT);
  sc(ws6,"Q3","AGUA CALIENTE",F11BI,"FFFFFF00",{horizontal:"center",vertical:"top",wrapText:true},BT);

  // Headers
  const hd6 = (r,v) => sc(ws6,r,v,F9B,"FFD9D9D9",{...ACW},BT);
  hd6("A4","Aparato"); hd6("B4","Tipo de Control");
  ws6.mergeCells("C4:E4"); hd6("C4","Unidades de consumo"); hd6("F4","Unidades de Descarga");
  ws6.mergeCells("I4:J4"); hd6("I4","Diametro Comercial"); hd6("K4","D interno\nmm"); hd6("L4","D externo\nmm");
  ws6.mergeCells("P4:R4"); hd6("P4","Diametro Comercial"); hd6("S4","D interno\nmm"); hd6("T4","D externo\nmm");
  sc(ws6,"C5","Agua Fría",F9,"FFFFFFFF",ACW,BT); sc(ws6,"D5","Agua caliente",F9,"FFFFFFFF",ACW,BT); sc(ws6,"E5","Total",F9,"FFFFFFFF",ACW,BT);

  const baseApps = [
    ["Inodoro","Tanque",2.2,0,0,4],
    ["Lavamanos","Llave",0.5,0.5,0.7,2],
    ["Ducha","Válvula de mezclado",1,1,1.4,2],
    ["Lavaplatos Cocina","Griferia",1,1,1.4,2],
    ["Tina","Griferia",1,1,1.4,2],
    ["Lavadora","Automatico",1,1,1.4,2],
    ["Lavadero","Griferia",1,1,1.4,2],
  ];
  const diamAF = [{n:"1/2 (RDE 9)",p:0.5,d:16.6},{n:"1/2 (RDE 13.5)",p:0.5,d:18.18},{n:"3/4 (RDE 11)",p:0.75,d:21.81},{n:"3/4 (RDE 21)",p:0.75,d:23.63},{n:"1 (RDE 13.5)",p:1,d:28.48},{n:"1 (RDE 21)",p:1,d:30.2},{n:"1 1/4 (RDE 21)",p:1.25,d:38.14},{n:"1 1/2 (RDE 21)",p:1.5,d:43.68},{n:"2 (RDE 21)",p:2,d:54.58},{n:"2 1/2 (RDE 21)",p:2.5,d:66.07},{n:"3 (RDE 21)",p:3,d:80.42},{n:"4 (RDE 21)",p:4,d:103.42},{n:"6 (RDE 21)",p:6,d:152.22}];
  const diamAC = [{n:"1/2 (RDE 11)",p:0.5,d:12.4},{n:"3/4 (RDE 11)",p:0.75,d:18.2},{n:"1 (RDE 11)",p:1,d:23.4},{n:"1 1/4 (RDE 11)",p:1.25,d:28.6},{n:"1 1/2 (RDE 11)",p:1.5,d:33.7},{n:"2 (RDE 11)",p:2,d:44.2},{n:"2 (CPVC SCH 80)",p:2,d:49.25},{n:"2 1/2 (CPVC SCH 80)",p:2.5,d:59},{n:"3 (CPVC SCH 80)",p:3,d:73.66}];

  let r6 = 7;
  baseApps.forEach(a => {
    sc(ws6,`A${r6}`,a[0],F9,"FFFFFFFF",{horizontal:"left",vertical:"center",wrapText:true,indent:1},BH);
    sc(ws6,`B${r6}`,a[1],F9,"FFFFFFFF",{horizontal:"left",vertical:"center",wrapText:true,indent:1},BH);
    sc(ws6,`C${r6}`,a[2],F9,"FFFFFFFF",ACW,BH);
    sc(ws6,`D${r6}`,a[3]||"",F9,"FFFFFFFF",ACW,BH);
    sc(ws6,`E${r6}`,a[4]||"",F9,"FFFFFFFF",ACW,BH);
    sc(ws6,`F${r6}`,a[5],F9,"FFFFFFFF",{horizontal:"center",vertical:"center",wrapText:true},BH);
    r6++;
  });
  // AF diameters
  r6 = 5;
  diamAF.forEach(d => {
    sc(ws6,`H${r6}`,d.n,F9,"FFFFFFFF",{horizontal:"left",vertical:"center",wrapText:true,indent:1},BH);
    sc(ws6,`I${r6}`,d.p,F9,"FFFFFFFF",AC,BH);
    sc(ws6,`J${r6}`,d.n,F9,"FFFFFFFF",{horizontal:"left",vertical:"center",wrapText:true,indent:1},BH);
    sc(ws6,`K${r6}`,d.d,F9,"FFFFFFFF",AC,BH);
    sc(ws6,`L${r6}`,parseFloat((d.p*25.4).toFixed(2)),F9,"FFFFFFFF",AC,BH);
    r6++;
  });
  // AC diameters
  r6 = 5;
  diamAC.forEach(d => {
    sc(ws6,`O${r6}`,d.n,F9,"FFFFFFFF",{horizontal:"left",vertical:"center",indent:1},BH);
    sc(ws6,`P${r6}`,d.p,F9,"FFFFFFFF",AC,BH);
    sc(ws6,`Q${r6}`,d.p,F9,"FFFFFFFF",AC,BH);
    sc(ws6,`R${r6}`,d.n,F9,"FFFFFFFF",{horizontal:"left",vertical:"center",wrapText:true,indent:1},BH);
    sc(ws6,`S${r6}`,d.d,F9,"FFFFFFFF",AC,BH);
    sc(ws6,`T${r6}`,parseFloat((d.p*25.4).toFixed(2)),F9,"FFFFFFFF",AC,BH);
    r6++;
  });

  // Contadores
  sc(ws6,"I20","CONTADORES",F11BI,"FFFFFF00",{horizontal:"center",vertical:"top",wrapText:true},BT);
  sc(ws6,"I21","Diametro Comercial",F9BI,"FFFFFFFF",{vertical:"middle",wrapText:true},{left:{style:"thin"},top:{style:"thin"},bottom:{style:"thin"}});
  sc(ws6,"J21","Qn\nlps",F9BI,"FFFFFFFF",ACW,BT);
  const contadores = [0.84,0.92,1.4,1.58,1.96,2.7,2.8,5.6,8.4];
  const contPulg = [0.5,0.5,0.75,0.75,1,1,1,1.5,2];
  let c22 = 22;
  contadores.forEach((v,i) => {
    sc(ws6,`I${c22}`,contPulg[i],F9,"FFFFFFFF",AC,BH);
    sc(ws6,`J${c22}`,v,F9,"FFFFFFFF",AC,BH);
    c22++;
  });

  // ═══ HOJA 7: Longitud Equivalente ═══
  const ws7 = wb.addWorksheet("Longitud Equivalente");
  ensureSheetRows(ws7, 40);
  ws7.mergeCells("J2:Q3"); ws7.mergeCells("S2:Z3");
  ws7.mergeCells("A4:A5"); ws7.mergeCells("B4:H4"); ws7.mergeCells("J4:P4"); ws7.mergeCells("Q4:Q5");
  ws7.mergeCells("S4:Y4"); ws7.mergeCells("Z4:Z5");

  const leDiams = ["D=1/2\"","D=3/4\"","D=1\"","D=1-1/2\"","D=2\"","D=3\"","D=4\""];
  sc(ws7,"J2","AGUA FRIA",F10B,"FFFFFFFF",AC,BT);
  sc(ws7,"S2","AGUA CALIENTE",F10B,"FFFFFFFF",AC,BT);
  sc(ws7,"A4","Accesorio\nPVC C=150",F10B,"FFFFFFFF",{...ACW},BT);
  sc(ws7,"B4","LONGITUD EQUIVALENTE (m) ",F9B,"FFFFFFFF",AC,BT);
  sc(ws7,"J4","No de accesorios por tipo x baño",F9B,"FFFFFFFF",{...ACW},BT);
  sc(ws7,"Q4","Total por tipo de accesorio",F9B,"FFFFFFFF",{...ACW},BT);
  sc(ws7,"S4","No de accesorios por tipo x baño",F9B,"FFFFFFFF",{...ACW},BT);
  sc(ws7,"Z4","Total por tipo de accesorio",F9B,"FFFFFFFF",{...ACW},BT);

  const leColsMain = "B,C,D,E,F,G,H".split(",");
  const leColsAF = "J,K,L,M,N,O,P".split(",");
  const leColsAC = "S,T,U,V,W,X,Y".split(",");
  leDiams.forEach((d,i) => {
    sc(ws7,`${leColsMain[i]}5`,d,F9B,"FFFFFFFF",AC,BT);
    sc(ws7,`${leColsAF[i]}5`,d,F9B,"FFFFFFFF",AC,BT);
    sc(ws7,`${leColsAC[i]}5`,d,F9B,"FFFFFFFF",AC,BT);
  });

  const leData = [
    {n:"Codo 90°", v:[0.36,0.49,0.62,0.87,1.12,1.62,2.12], caf:8, cac:5},
    {n:"Tee salida lateral", v:[0.20,0.29,0.38,0.55,0.73,1.08,1.43], caf:3, cac:2},
    {n:"Tee salida bilateral", v:[0.76,1.02,1.28,1.79,2.31,3.34,4.37], caf:0, cac:0},
    {n:"Tee paso directo", v:[0.76,1.02,1.28,1.79,2.31,3.34,4.37], caf:1, cac:1},
    {n:"Valvula de check", v:[], caf:0, cac:0},
    {n:"Valvula de Compuerta", v:[0.08,0.12,0.13,0.19,0.24,0.36,0.47], caf:0, cac:0},
    {n:"Valvula de cierre rapido", v:[3.12,4.52,5.92,8.71,11.5,17.09,22.67], caf:1, cac:1},
    {n:"Reducciones", v:[0.06,0.08,0.11,0.16,0.21,0.30,0.40], caf:1, cac:1},
    {n:"Otros", v:[], caf:1.5, cac:0.5},
    {n:"Tuberia", v:[1,1,1,1,1,1,1], caf:3, cac:2},
  ];

  let lr = 7;
  leData.forEach(d => {
    sc(ws7,`A${lr}`,d.n,F9,"FFFFFFFF",{horizontal:"left",vertical:"top",indent:1},BH);
    d.v.forEach((v,i) => {
      if (v) sc(ws7,`${leColsMain[i]}${lr}`,v,F9,"FFFFC000",AR,BH);
    });
    sc(ws7,`J${lr}`,d.caf,F9,"FFFFFFFF",AR,BH);
    sc(ws7,`S${lr}`,d.cac,F9,"FFFFFFFF",AR,BH);
    // Calculate totals
    let totAF = 0, totAC = 0;
    d.v.forEach((v,i) => { if(v) { totAF += v*d.caf; totAC += v*d.cac; } });
    if (d.v.length===0) { totAF = d.caf; totAC = d.cac; }
    sc(ws7,`Q${lr}`,parseFloat(totAF.toFixed(2)),F9,"FFFFFFFF",AR,BH);
    sc(ws7,`Z${lr}`,parseFloat(totAC.toFixed(2)),F9,"FFFFFFFF",AR,BH);
    lr++;
  });
  sc(ws7,"Q6",parseFloat(13.28.toFixed(2)),F10B,"FFFFFFFF",AC,{left:{style:"thin"},right:{style:"thin"},top:{style:"thin"},bottom:{style:"hair"}});
  sc(ws7,"Z6",parseFloat(9.2.toFixed(2)),F10B,"FFFFFFFF",AC,{left:{style:"thin"},right:{style:"thin"},top:{style:"thin"},bottom:{style:"hair"}});

  // Formula reference section
  sc(ws7,"A27","Descripcion",F9BI,"FFFFFFFF",AC,null); sc(ws7,"B27","Sigla",F9BI,"FFFFFFFF",AC,null);
  sc(ws7,"C27","Le(m), D en Pulgadas",F9BI,"FFFFFFFF",AC,null);
  const leFormulas = [
    ["Codo radio largo 90","CRL 90","=[0.52*D+0,04](120/C)^1,85"],
    ["Codo radio medio 90","CRM 90","=[0.67*D+0,09](120/C)^1,85"],
    ["Codo radio corto 90","CRC 90","=[0.76*D+0,17](120/C)^1,85"],
    ["Codo radio corto 45","CRC 45","=[0.38*D+0,02](120/C)^1,85"],
    ["Valvula compuerta abierta","VCA","=[0.17*D+0,03](120/C)^1,85"],
    ["Valvula de globo abierta","VGA","=[8.44*D+0,50](120/C)^1,85"],
    ["Valvula de angulo abierta","VAA","=[4.27*D+0,25](120/C)^1,85"],
    ["Tee paso Directo normal","TPDN","=[0.53*D+0,04](120/C)^1,85"],
    ["Tee paso Lado","TPL","=[1.56*D+0,37](120/C)^1,85"],
    ["Tee salida bilateral","TSB","=[1.56*D+0,37](120/C)^1,85"],
    ["Tee paso directo con reduccion","TPDR","=[0.56*D+0.33](120/C)^1,85"],
    ["Valvula de pie con coladera","VPC","=[6.38*D+0.40](120/C)^1,85"],
  ];
  let lf = 29;
  leFormulas.forEach(f => {
    sc(ws7,`A${lf}`,f[0],F9,"FFFFFFFF",{horizontal:"left",vertical:"top"},BT);
    sc(ws7,`B${lf}`,f[1],F9,"FFFFFFFF",{horizontal:"left",vertical:"top"},BT);
    sc(ws7,`C${lf}`,f[2],F9,"FFFFFFFF",{horizontal:"left",vertical:"top"},BT);
    lf++;
  });

  // ═══ HOJA 8: Calculo TR ═══
  const ws8 = wb.addWorksheet("Calculo TR");
  ensureSheetRows(ws8, 30);
  ws8.mergeCells("A6:G6"); ws8.mergeCells("A8:A9"); ws8.mergeCells("B8:B9"); ws8.mergeCells("E8:E9");
  ws8.getColumn("A").width = 32.5;
  const hd8 = (r,v) => sc(ws8,r,v,F9B,"FFD9D9D9",{...ACW},BT);
  sc(ws8,"A6","AGUA POTABLE",F9B,"FFD9D9D9",AC,BT);
  hd8("A8","Ubicación"); hd8("B8","UN"); hd8("C8","Consumo"); hd8("D8","Total");
  hd8("E8","M2"); hd8("F8","Consumo"); hd8("G8","Total");
  hd8("C9","Lt-Hab-día"); hd8("D9","Lt/día"); hd8("F9","Lt/m2/día"); hd8("G9","Lt/día");

  sc(ws8,"A11","HABITANTES",F9B,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},BT);
  sc(ws8,"A12","Habitantes Fijos",F9,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},BT);
  sc(ws8,"B12",poblFija,F9,"FFFFFFFF",AC,BT); sc(ws8,"C12",parseInt(proyecto.dot)||280,F9,"FFFFFFFF",AC,BT); sc(ws8,"G12",poblFija*(parseInt(proyecto.dot)||280),F9,"FFFFFFFF",{horizontal:"right",vertical:"middle",indent:1},BT);
  sc(ws8,"A13","Poblacion flotante",F9,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},BT);
  sc(ws8,"B13",poblFlot,F9,"FFFFFFFF",AC,BT); sc(ws8,"C13",50,F9,"FFFFFFFF",AC,BT); sc(ws8,"G13",poblFlot*50,F9,"FFFFFFFF",{horizontal:"right",vertical:"middle",indent:1},BT);
  sc(ws8,"A15","PISCINAS",F9B,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},BT);
  sc(ws8,"A16","Adultos ",F9,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:2},BT);
  sc(ws8,"E16",areaPiscina,F9,"FFFFFFFF",AR,BT); sc(ws8,"F16",10,F9,"FFFFFFFF",AR,BT); sc(ws8,"G16",areaPiscina*10,F9,"FFFFFFFF",AR,BT);
  sc(ws8,"A18","OTROS SERVICIOS",F9B,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},BT);
  sc(ws8,"A19","Zonas Verdes",F9,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:2},BT);
  sc(ws8,"E19",areaVerdes,F9,"FFFFFFFF",AR,BT); sc(ws8,"F19",2,F9,"FFFFFFFF",AR,BT); sc(ws8,"G19",areaVerdes*2,F9,"FFFFFFFF",AR,BT);
  sc(ws8,"A20","Otros",F9,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:2},BT);
  sc(ws8,"G20",100,F9,"FFFFFFFF",AR,BT);
  const totalDotacion = poblFija*(parseInt(proyecto.dot)||280) + poblFlot*50 + areaPiscina*10 + areaVerdes*2 + 100;
  sc(ws8,"A22","SUBTOTALES",F9B,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:1},BT);
  sc(ws8,"G22",totalDotacion,F9B,"FFFFFFFF",AR,BT);
  sc(ws8,"F25","Q(lps)",F9,"FFFFFFFF",{horizontal:"left",vertical:"middle",indent:2},BT);
  sc(ws8,"G25",parseFloat((totalDotacion/86400).toFixed(6)),F9B,"FFFFFFFF",AR,BT);

  // ─── RETORNAR BLOB PARA DESCARGA ────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  return { blob, nombreArchivo: (proyecto.nombre || "Proyecto").replace(/[^a-zA-Z0-9]/g, "_"), prefijo: "Calculo_RHidraulica_AF_AC" };
}
