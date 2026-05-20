import ExcelJS from "exceljs";
import * as CalcSan from "./calcSanitario";

// ─── ESTILOS COMPARTIDOS ─────────────────────────────────────────────────
const FONT_HDR = { name: "Calibri", size: 8, bold: true };
const FONT_HDR_RED = { name: "Calibri", size: 8, bold: true, color: { argb: "FFFF0000" } };
const FONT_HDR_BIG = { name: "Calibri", size: 11, bold: true };
const FONT_TITLE = { name: "Calibri", size: 16, bold: true };
const FONT_TITLE_MED = { name: "Calibri", size: 11, bold: true, italic: true };
const FONT_DATA = { name: "Calibri", size: 8 };
const FONT_DATA_BLACK = { name: "Calibri", size: 9, color: { argb: "FF000000" } };
const FONT_META = { name: "Calibri", size: 8, bold: true, italic: true };
const FONT_TUB = { name: "Calibri", size: 9, color: { argb: "FF57585B" } };
const FONT_TUB_HDR = { name: "Calibri", size: 9, bold: true, italic: true, color: { argb: "FF57585B" } };
const FONT_TUB_TITLE = { name: "Calibri", size: 11, bold: true, italic: true, color: { argb: "FFD12229" } };
const ALIGN_C = { horizontal: "center", vertical: "middle" };
const ALIGN_CW = { horizontal: "center", vertical: "middle", wrapText: true };
const ALIGN_L = { horizontal: "left", vertical: "middle" };
const ALIGN_R = { horizontal: "right", vertical: "middle" };
const BORDER_THIN = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
const BORDER_HAIR = { top: { style: "hair" }, bottom: { style: "hair" }, left: { style: "thin" }, right: { style: "thin" } };

// ─── HELPERS ─────────────────────────────────────────────────────────────
function ensureSheetRows(ws, upTo) {
  for (let i = 1; i <= upTo; i++) {
    ws.getRow(i);
  }
}

function numToCol(n) {
  let s = '';
  while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}

function setCell(ws, ref, value, font, fill, align, border) {
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
  const cell = row.getCell(colNum);
  if (value !== undefined && value !== null) {
    const num = Number(value);
    cell.value = isNaN(num) || value === "" ? (value || "") : num;
  }
  if (font) cell.font = font;
  if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
  if (align) cell.alignment = align;
  if (border) cell.border = border;
  return cell;
}

function setRow(ws, rowNum, values, font, fill, align, border) {
  values.forEach((v, i) => {
    setCell(ws, `${numToCol(i + 1)}${rowNum}`, v, font, fill, align, border);
  });
}

// ─── GENERAR EXCEL SANITARIO ─────────────────────────────────────────────
export async function generarExcelSanitario({ 
  proyecto, hidros, tieneSotano, pisos,
  tramosSan = [], pendienteSan = 0.02,
  poblFija = 6, poblFlot = 10, areaPiscina = 0, areaVerdes = 0,
}) {
  console.log("Iniciando generación Excel Sanitario...");

  const n = CalcSan.maning_SAN;
  const S = pendienteSan;
  const r_v = 7 / 24;

  const tramosDef = tramosSan.map(t => ({
    tramo: t.id, piso: t.piso, ud: t.fixtures || {}, desc: "", recibeDe: t.recibeDe || [],
  }));
  if (tieneSotano && !tramosDef.some(t => t.piso < 0)) {
    tramosDef.push({ tramo: "Sotano", piso: -1, ud: { sif: 3, lvm: 1, san: 1, duc: 1 }, desc: "", recibeDe: [] });
  }

  const udMap = {};
  hidros.forEach(a => { udMap[a.id] = a.ud; });

  const apColumns = [
    { key: "sif", lbl: "Sifones", ud: 2 },
    { key: "lvm", lbl: "Lavamanos", ud: 2 },
    { key: "san", lbl: "Sanitarios", ud: 4 },
    { key: "duc", lbl: "Duchas", ud: 2 },
    { key: "lvra", lbl: "Lavadoras", ud: 4 },
    { key: "tin", lbl: "Tina", ud: 2 },
    { key: "lvp", lbl: "Lavaplatos", ud: 2 },
    { key: "lvro", lbl: "Lavadero", ud: 2 },
  ];

  const udByTramo = [];
  const calcResults = [];
  const UD_acumulados = {};

  tramosDef.forEach((t) => {
    let UD_prop = 0;
    const propios = {};
    Object.entries(t.ud || {}).forEach(([key, cant]) => {
      const unitUD = udMap[key] || 2;
      propios[key] = cant * unitUD;
      UD_prop += cant * unitUD;
    });

    let UD_otr = 0;
    if (t.recibeDe) {
      t.recibeDe.forEach(id => {
        UD_otr += UD_acumulados[id] || 0;
      });
    }

    const UD_acum = UD_prop + UD_otr;
    UD_acumulados[t.tramo] = UD_acum;

    const numSalidas = Math.max(1, Object.values(t.ud || {}).reduce((s, v) => s + v, 0));
    const desc_otros = t.recibeDe && t.recibeDe.length > 0 ? t.desc || t.recibeDe.join(" + ") : "";

    udByTramo.push({
      tramo: t.tramo, piso: t.piso, propios,
      UD_propias: UD_prop, UD_otros: UD_otr, UD_acumulado: UD_acum,
      numSalidas, desc_otros,
    });

    calcResults.push(CalcSan.calcularTramoSanitario({
      tramo: t.tramo, piso: t.piso,
      UD_propias: UD_prop, UD_otros: UD_otr,
      numSalidas, pendiente: S, n,
      desc_otros: desc_otros,
    }));
  });

  const cantAps = {};
  tramosDef.forEach(t => {
    Object.entries(t.ud || {}).forEach(([key, cant]) => {
      cantAps[key] = (cantAps[key] || 0) + cant;
    });
  });
  const totalUD = Math.max(...Object.values(UD_acumulados), 0);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Ing. Camilo C\u00e1rdenas Chac\u00f3n";

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 1: Cabezote
  // ═══════════════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet("Cabezote");
  ensureSheetRows(ws1, 10);
  ws1.mergeCells("A1:D7");
  ws1.mergeCells("E2:L3");
  ws1.mergeCells("E5:L5");
  ws1.mergeCells("E7:I7");

  ws1.getColumn("A").width = 3;
  ws1.getColumn("E").width = 12;
  ws1.getColumn("J").width = 12;

  setCell(ws1, "E1", "Proyecto:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws1, "E2", proyecto.nombre, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle", wrapText: true }, null);
  setCell(ws1, "E4", "Sector:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws1, "E5", "0", FONT_HDR_BIG, "FFFFFFFF", ALIGN_L, null);
  setCell(ws1, "E6", "Dise\u00f1o:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws1, "J6", "Fecha:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws1, "E7", proyecto.ingeniero, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
  setCell(ws1, "J7", new Date().toISOString().slice(0, 10), FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 2: 1,Calculo UD
  // ═══════════════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet("1,Calculo UD");
  ensureSheetRows(ws2, 40);
  ws2.mergeCells("A1:D7");
  ws2.mergeCells("E2:L3");
  ws2.mergeCells("E5:L5");
  ws2.mergeCells("E7:I7");
  setCell(ws2, "E1", "Proyecto:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws2, "E2", proyecto.nombre, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle", wrapText: true }, null);
  setCell(ws2, "E4", "Sector:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws2, "E5", "0", FONT_HDR_BIG, "FFFFFFFF", ALIGN_L, null);
  setCell(ws2, "E6", "Dise\u00f1o:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws2, "J6", "Fecha:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws2, "E7", proyecto.ingeniero, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
  setCell(ws2, "J7", new Date().toISOString().slice(0, 10), FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);

  ws2.mergeCells("A8:L8");
  setCell(ws2, "A8", "CALCULO UNIDADES DE DESCARGA", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);

  ws2.mergeCells("A9:A11");
  ws2.mergeCells("B9:B11");
  ws2.mergeCells("C9:G9");
  ws2.mergeCells("K9:L9");

  const cols2 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  cols2.forEach(c => { ws2.getColumn(c).width = 9; });
  ws2.getColumn("A").width = 10;
  ws2.getColumn("B").width = 6;

  setCell(ws2, "A9", "TRAMO\nO RAMAL", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws2, "B9", "PISO", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws2, "C9", "UNIDADES DE DESCARGA", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws2, "C10", "PROPIAS", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  ws2.mergeCells("D10:E11");
  setCell(ws2, "D10", "OTROS RAMALES", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("F10:F12");
  setCell(ws2, "F10", "OTROS", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("G10:G12");
  setCell(ws2, "G10", "ACUMULADO", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws2, "C11", "UD", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws2, "D12", "UD", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws2, "F11", "UD", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws2, "G11", "UD", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);

  ws2.mergeCells("H9:H12");
  setCell(ws2, "H9", "No de\nSalidas", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("I9:I12");
  setCell(ws2, "I9", "Coeficiente\nSimultaneidad K", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("J10:J11");
  setCell(ws2, "J10", "Q", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  ws2.mergeCells("K10:K11");
  setCell(ws2, "K10", "maning", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  ws2.mergeCells("L10:L11");
  setCell(ws2, "L10", "S", { ...FONT_HDR_RED, size: 10 }, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws2, "K9", "CALCULO\nHIDRAULICO", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws2, "J12", "LPS", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws2, "K12", "n", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws2, "L12", "%", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);

  // Data rows
  let rowNum = 13;
  udByTramo.forEach((t, idx) => {
    if (t.tramo === "R-1") rowNum = 18; // gap after BAN-2
    const r = calcResults[idx];
    setCell(ws2, `A${rowNum}`, t.tramo, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `B${rowNum}`, t.piso, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `C${rowNum}`, t.UD_propias, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `D${rowNum}`, t.UD_otros, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `E${rowNum}`, t.desc_otros || "", FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `G${rowNum}`, t.UD_acumulado, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `H${rowNum}`, t.numSalidas, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `I${rowNum}`, r.K, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `J${rowNum}`, r.Q_Ls, FONT_DATA_BLACK, "FFFFFFFF", { horizontal: "center", vertical: "top", wrapText: true }, BORDER_THIN);
    setCell(ws2, `K${rowNum}`, 0.01, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws2, `L${rowNum}`, 0.02, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    rowNum++;
  });

  // Totals
  rowNum = 34;
  setCell(ws2, `A${rowNum}`, "TOTALES", FONT_HDR, "FFFFFFFF", ALIGN_C, null);
  setCell(ws2, `B${rowNum}`, "Aparatos", FONT_HDR, "FFFFFFFF", ALIGN_C, null);
  let colIdx = 3;
  apColumns.forEach(c => {
    const cant = cantAps[c.key] || 0;
    setCell(ws2, `${String.fromCharCode(64 + colIdx)}${rowNum}`, cant, FONT_DATA, "FFFFFFFF", ALIGN_C, null);
    colIdx++;
  });
  const blankCount = 12 - 3 - apColumns.length;
  for (let i = 0; i < blankCount; i++) colIdx++;
  setCell(ws2, `B${rowNum + 1}`, "UD", FONT_HDR, "FFFFFFFF", ALIGN_C, null);
  colIdx = 3;
  apColumns.forEach(c => {
    const cant = cantAps[c.key] || 0;
    setCell(ws2, `${String.fromCharCode(64 + colIdx)}${rowNum + 1}`, cant * c.ud, FONT_DATA, "FFFFFFFF", ALIGN_C, null);
    colIdx++;
  });
  setCell(ws2, `K${rowNum + 1}`, totalUD, FONT_DATA, "FFFFFFFF", ALIGN_C, null);
  setCell(ws2, `L${rowNum + 1}`, totalUD, FONT_DATA, "FFFFFFFF", ALIGN_C, null);

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 3: 2,Red Sanit y Lluvias VF
  // ═══════════════════════════════════════════════════════════════════════
  const ws3 = wb.addWorksheet("2,Red Sanit y Lluvias VF");
  ensureSheetRows(ws3, 80);
  ws3.mergeCells("A1:K7");
  ws3.mergeCells("L2:AB3");
  ws3.mergeCells("L4:M4");
  ws3.mergeCells("L5:AB5");
  ws3.mergeCells("L6:M6");
  ws3.mergeCells("L7:Y7");
  ws3.mergeCells("Z7:AA7");
  setCell(ws3, "L1", "Proyecto:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws3, "L2", proyecto.nombre, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle", wrapText: true }, null);
  setCell(ws3, "L4", "Sector:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws3, "L5", "0", FONT_HDR_BIG, "FFFFFFFF", ALIGN_L, null);
  setCell(ws3, "L6", "Dise\u00f1o:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws3, "Z6", "Fecha:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws3, "L7", proyecto.ingeniero, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
  setCell(ws3, "Z7", new Date().toISOString().slice(0, 10), FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);

  // SECCION RED SANITARIA
  ws3.mergeCells("J8:AB9");
  ws3.mergeCells("A9:A12");
  ws3.mergeCells("B9:B12");
  ws3.mergeCells("C9:G9");
  ws3.mergeCells("C10:C12");
  ws3.mergeCells("D10:E11");
  ws3.mergeCells("F10:F12");
  ws3.mergeCells("G10:G12");
  ws3.mergeCells("H9:H12");
  ws3.mergeCells("I9:I12");
  ws3.mergeCells("J10:J11");
  ws3.mergeCells("K10:K11");
  ws3.mergeCells("L10:L11");
  ws3.mergeCells("M10:O10");
  ws3.mergeCells("M11:M12");
  ws3.mergeCells("N11:N12");
  ws3.mergeCells("O11:O12");
  ws3.mergeCells("P10:P11");
  ws3.mergeCells("R10:R12");
  ws3.mergeCells("S10:S11");
  ws3.mergeCells("T10:T11");
  ws3.mergeCells("U10:U11");
  ws3.mergeCells("V10:V11");
  ws3.mergeCells("Y10:Y11");
  ws3.mergeCells("Z10:Z11");
  ws3.mergeCells("AA10:AB10");
  ws3.mergeCells("AB11:AB12");
  ws3.mergeCells("AD11:AH11");

  setCell(ws3, "J8", "DISE\u00d1O REDES SANITARIAS", FONT_TITLE, "FFFFFFFF", ALIGN_C, null);
  setCell(ws3, "A9", "TRAMO\nO RAMAL", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "B9", "PISO", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "C9", "UNIDADES DE DESCARGA", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "C10", "PROPIAS", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "D10", "OTROS RAMALES", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "F10", "OTROS", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "G10", "ACUMULADO", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "H9", "No de\nSalidas", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "I9", "Coeficiente\nSimultaneidad\nK", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "J10", "Q", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "K10", "Maning", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "L10", "S", { ...FONT_HDR_RED, size: 10 }, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "M10", "Diametro - D", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "M11", "Calc.\npulg", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "N11", "Dise\u00f1o\nPulg", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "O11", "Interno\nmm", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "P10", "Qo\nD com", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "Q10", "Vo", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "R10", "Q/Qo", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "S10", "Vreal", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "T10", "Chequeo", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "U10", "Yc", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "V10", "Yn", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "W10", "No.", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "X10", "Tipo de", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "Y10", "Ymax=\n0.75D", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "Z10", "(Yn vs Yc)", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "AA10", "Fuerza Tractiva", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "AA11", "Vr", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AB11", ">0.15\nkg/m2", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);

  setCell(ws3, "D12", "UD", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "E12", "Descripci\u00f3n", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "J12", "LPS", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "K12", "n", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "L12", "%", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "P12", "LPS", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "Q12", "m/s", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "S12", "m/s", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "T12", "0.45<Vr<4.0", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "U12", "mm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "V12", "mm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "W11", "Froude", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "X11", "Flujo", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "X12", "No Critico", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "Y12", "mm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "Z12", "< Ymax", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AA12", "kg/cm2", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AD11", "Calculo de Vreal, Yreal, Rh real", FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AD12", "Q/Qo", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AE12", "V/Vo", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AF12", "Y/D", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AG12", "\u03b1", { ...FONT_HDR, size: 14 }, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AH12", "Rh/D", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AI12", "Rh", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);

  // Datos red sanitaria
  rowNum = 14;
  calcResults.forEach((r, idx) => {
    const t = udByTramo[idx];
    if (r.tramo === "R-1") rowNum = 18;
    setRow(ws3, rowNum, [
      r.tramo, r.piso, r.UD_propias, r.UD_otros, t.desc_otros || "", "", r.UD_acumulado,
      r.numSalidas, r.K, r.Q_Ls, 0.01, 0.02,
      parseFloat(r.Dcalc_pulg.toFixed(2)), r.Dprop_nominal, r.Dprop_mm,
      r.Qo_Ls, r.Vo, r.q_Qo, r.V_real,
      r.verifVel ? "O.K." : "No Cumple",
      r.Yc_mm, r.Yn_mm, r.Fr, r.regime,
      r.Ymax_mm, r.verifYn ? "O.K." : "No Cumple",
      r.fuerzaTractiva, r.verifTau ? "O.K." : "No Cumple",
    ], FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `J${rowNum}`, r.Q_Ls, FONT_DATA_BLACK, "FFFFFFFF", { horizontal: "center", vertical: "top", wrapText: true }, BORDER_HAIR);
    setCell(ws3, `AD${rowNum}`, r.q_Qo, FONT_DATA, "FFFFFFFF", null, null);
    setCell(ws3, `AE${rowNum}`, r.V_Vo, FONT_DATA, "FFFFFFFF", null, null);
    setCell(ws3, `AF${rowNum}`, r.Y_D, FONT_DATA, "FFFFFFFF", null, null);
    setCell(ws3, `AG${rowNum}`, r.alpha, FONT_DATA, "FFFFFFFF", null, null);
    setCell(ws3, `AH${rowNum}`, r.Rh_D, FONT_DATA, "FFFFFFFF", null, null);
    setCell(ws3, `AI${rowNum}`, r.Rh_mm, FONT_DATA, "FFFFFFFF", null, null);
    rowNum++;
  });

  // SECCION AGUAS LLUVIAS
  ws3.mergeCells("J28:AB29");
  ws3.mergeCells("A29:A32");
  ws3.mergeCells("B29:B32");
  ws3.mergeCells("C29:G29");
  ws3.mergeCells("C30:C32");
  ws3.mergeCells("D30:E31");
  ws3.mergeCells("F30:F32");
  ws3.mergeCells("G30:G32");
  ws3.mergeCells("H29:H32");
  ws3.mergeCells("I29:I32");
  ws3.mergeCells("J30:J31");
  ws3.mergeCells("K30:K31");
  ws3.mergeCells("L30:L31");
  ws3.mergeCells("M30:O30");
  ws3.mergeCells("M31:M32");
  ws3.mergeCells("N31:N32");
  ws3.mergeCells("O31:O32");
  ws3.mergeCells("P30:P31");
  ws3.mergeCells("R30:R32");
  ws3.mergeCells("S30:S31");
  ws3.mergeCells("T30:T31");
  ws3.mergeCells("U30:U31");
  ws3.mergeCells("V30:V31");
  ws3.mergeCells("Y30:Y31");
  ws3.mergeCells("Z30:Z31");
  ws3.mergeCells("AA30:AB30");
  ws3.mergeCells("AB31:AB32");
  ws3.mergeCells("AD31:AH31");

  setCell(ws3, "J28", "DISE\u00d1O RED AGUAS LLUVIAS", FONT_TITLE, "FFFFFFFF", ALIGN_C, null);
  setCell(ws3, "A29", "TRAMO", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "B29", "PISO", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "F30", "BAJANTES", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "C30", "DE", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "D30", "DESCRIPCION", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "D32", "DE", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws3, "E32", "A", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "J32", "LPS", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "K32", "n", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "L32", "%", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "P32", "LPS", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "Q32", "m/s", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "S32", "m/s", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "T32", "0.45<Vr<4.0", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "U32", "mm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "V32", "mm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "Y32", "mm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "Z32", "< Ymax", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AA32", "kg/cm2", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AD32", "Q/Qo", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AE32", "V/Vo", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AF32", "Y/D", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AG32", "\u03b1", { ...FONT_HDR, size: 14 }, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AH32", "Rh/D", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws3, "AI32", "Rh", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 4: 3,BAN y Ventilacion VF
  // ═══════════════════════════════════════════════════════════════════════
  const ws4 = wb.addWorksheet("3,BAN y Ventilacion VF");
  ensureSheetRows(ws4, 50);
  ws4.mergeCells("C2:T3");
  ws4.mergeCells("C5:T5");
  ws4.mergeCells("C7:O7");
  ws4.mergeCells("Q7:R7");
  setCell(ws4, "C1", "Proyecto:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws4, "C2", proyecto.nombre, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle", wrapText: true }, null);
  setCell(ws4, "C4", "Sector:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws4, "C5", "0", FONT_HDR_BIG, "FFFFFFFF", ALIGN_L, null);
  setCell(ws4, "C6", "Dise\u00f1o:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws4, "Q6", "Fecha:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws4, "C7", proyecto.ingeniero, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
  setCell(ws4, "Q7", new Date().toISOString().slice(0, 10), FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);

  ws4.mergeCells("A8:T9");
  setCell(ws4, "A8", "CHEQUEO CAPACIDAD BAJANTES AGUAS NEGRAS y CALCULO TUBERIA DE VENTILACION", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);

  // Row 10: Group headers
  ws4.mergeCells("A10:G10");
  ws4.mergeCells("H10:J10");
  ws4.mergeCells("K10:L10");
  ws4.mergeCells("S10:T10");

  setCell(ws4, "A10", "INFORMACI\u00d3N COM\u00daN", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);
  setCell(ws4, "H10", "BAJANTES A.N.", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);
  setCell(ws4, "S10", "TUBERIA DE VENTILACION", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);

  // Row 11: Sub-headers
  ws4.mergeCells("A11:A13");
  ws4.mergeCells("B11:B13");
  ws4.mergeCells("C11:D11");
  ws4.mergeCells("E11:E13");
  ws4.mergeCells("F11:F13");
  ws4.mergeCells("G11:G13");
  ws4.mergeCells("H11:H13");
  ws4.mergeCells("I11:I13");
  ws4.mergeCells("J11:J13");
  ws4.mergeCells("K11:K13");
  ws4.mergeCells("L11:L13");
  ws4.mergeCells("M11:M13");
  ws4.mergeCells("N11:N13");
  ws4.mergeCells("O11:O13");
  ws4.mergeCells("P11:Q11");
  ws4.mergeCells("R11:R13");
  ws4.mergeCells("S11:S13");

  setCell(ws4, "A11", "Bajante\nNo.", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "B11", "Piso", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "C11", "Unidades de\nDescarga", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "E11", "r", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "F11", "Q\nlps", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "G11", "Maning\nn", FONT_HDR_RED, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "H11", "Diametro", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "J11", "Chequeo\nDcal<Dprop", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "K11", "Q m\u00e1x\nBajante", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "L11", "Velocidad\nTerminal\nm/s", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "M11", "Longitud\nTerminal (m)", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "N11", "Velocidad\nAire\nm/s", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "O11", "\u0192\nDarcy", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "P11", "Q aire\nlps", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "R11", "Longitud\nbajante\nm", { ...FONT_HDR, color: { argb: "FFFF0000" } }, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws4, "S11", "D", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);

  // Row 12: sub-headers for grouped columns
  setCell(ws4, "C12", "Parcial", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "D12", "Acum.", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "H12", "Calculado", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "I12", "Propuesto", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "M12", "calculada", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "N12", "Minima", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "S12", "Calculado", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "T12", "Propuesto", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);

  // Row 13: units
  setCell(ws4, "C13", "UD", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "D13", "UD", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "F13", "lps", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "G13", "n", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "H13", "Pulg.", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "I13", "Pulg.", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "K13", "lps", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "L13", "m/s", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "M13", "m", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "N13", "m", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "O13", "m/s", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "P13", "lps", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "R13", "m", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "S13", "Pulg.", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws4, "T13", "Pulg.", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);

  // Bajante data
  const banTramosExcel = tramosSan.filter(t => t.esBajante);
  const udMapB = {};
  CalcSan.APARATOS_UD.forEach(a => { udMapB[a.id] = a.ud; });
  const calcUDp = (t) => CalcSan.APARATOS_UD.reduce((s, d) => s + ((t.fixtures[d.id] || 0) * d.ud), 0);
  const acumMapExcel = {};
  const maxIter = tramosSan.length * 2;
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (const t of tramosSan) {
      if (acumMapExcel[t.id] !== undefined) continue;
      const parc = calcUDp(t);
      const deps = t.recibeDe || [];
      if (deps.length === 0) {
        acumMapExcel[t.id] = parc;
        changed = true;
      } else if (deps.every(d => acumMapExcel[d] !== undefined)) {
        const otros = deps.reduce((s, d) => s + (acumMapExcel[d] || 0), 0);
        acumMapExcel[t.id] = parc + otros;
        changed = true;
      }
    }
    if (!changed) break;
  }
  for (const t of tramosSan) {
    if (acumMapExcel[t.id] === undefined) acumMapExcel[t.id] = calcUDp(t);
  }

  let bRow = 15;
  banTramosExcel.forEach(t => {
    const udParcial = calcUDp(t);
    const udOtros = (t.recibeDe || []).reduce((s, id) => s + (acumMapExcel[id] || 0), 0);
    const udAcum = udParcial + udOtros;
    const rVal = t.bajR !== undefined ? t.bajR : 7/24;
    const nMann = t.nmaning || 0.009;

    const bv = CalcSan.calcularBajanteVentilacion({
      bajante: t.id,
      pisos: t.piso < 0 ? `${Math.abs(t.piso)}-1` : '2-1',
      UD_propias: udParcial,
      UD_otros: udOtros,
      UD_acum: udAcum,
      r: rVal,
      n: nMann,
      bajDprop: t.bajDprop || 0,
      bajLong: t.bajLong || 3,
      bajFDarcy: t.bajFDarcy !== undefined ? t.bajFDarcy : 0.025,
      ventDprop: t.ventDprop || 0,
    });

    setRow(ws4, bRow, [
      bv.bajante, `${t.pisoDesde !== undefined ? t.pisoDesde : (t.piso || 1)}-${t.pisoHasta !== undefined ? t.pisoHasta : 1}`,
      udParcial, udAcum,
      bv.r, bv.Q_Ls, bv.n,
      bv.Dcalc_pulg, bv.Dprop_pulg, bv.chequeoDiam,
      bv.QmaxBajante, bv.Vt, bv.Lt_calc, bv.Lt_min,
      bv.V_aire, bv.fDarcy, bv.Q_aire_Ls, bv.longBajante_m,
      bv.D_vent_calc_pulg, bv.D_vent_prop_pulg,
    ], FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    bRow += 2;
  });

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 5: 4,Chequeo Bajantes ALL
  // ═══════════════════════════════════════════════════════════════════════
  const ws5 = wb.addWorksheet("4,Chequeo Bajantes ALL");
  ensureSheetRows(ws5, 50);
  ws5.mergeCells("A1:C7");
  ws5.mergeCells("D2:K3");
  ws5.mergeCells("D5:K5");
  ws5.mergeCells("D7:H7");
  ws5.mergeCells("A8:K9");
  setCell(ws5, "D1", "Proyecto:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws5, "D2", proyecto.nombre, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle", wrapText: true }, null);
  setCell(ws5, "D4", "Sector:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws5, "D5", "0", FONT_HDR_BIG, "FFFFFFFF", ALIGN_L, null);
  setCell(ws5, "D6", "Dise\u00f1o:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws5, "I6", "Fecha:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws5, "D7", proyecto.ingeniero, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
  setCell(ws5, "I7", new Date().toISOString().slice(0, 10), FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);

  setCell(ws5, "A8", "CHEQUEO CAPACIDAD BAJANTES AGUAS LLUVIAS", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);

  ws5.mergeCells("A10:A12"); ws5.mergeCells("B10:C10");
  ws5.mergeCells("E10:E11"); ws5.mergeCells("F10:F11");
  ws5.mergeCells("G10:G11"); ws5.mergeCells("H10:H11");
  ws5.mergeCells("I10:J10");
  const chdr = (ref, val) => setCell(ws5, ref, val, FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  chdr("A10", "Bajante No."); chdr("B10", "AREA (A)");
  chdr("D10", "Intensidad\nI"); chdr("E10", "Coeficiente de Escorrentia");
  chdr("F10", "r"); setCell(ws5, "F10", "r", { ...FONT_HDR, size: 18 }, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  chdr("G10", "Q\nC x I x A"); chdr("H10", "Maning");
  chdr("I10", "Diametro"); chdr("K10", "Chequeo");
  setCell(ws5, "M10", "r=", { ...FONT_HDR, size: 10, italic: true }, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws5, "N10", 0.25, FONT_DATA, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws5, "O10", r_v, FONT_DATA, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws5, "B11", "PARCIAL", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "C11", "ACUMULADA", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "D11", "Promedio", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "I11", "Calculado", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "J11", "Propuesto", FONT_HDR_RED, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "K11", "Dcal<Dprop", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "B12", "m2", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "C12", "m2", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "D12", "mm/hr/m2", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "E12", "C", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "G12", "lps", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "H12", "n", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "I12", "Pulg.", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws5, "J12", "Pulg.", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);

  const ballData = [
    { id: "BALL # 1", area: 78.31 },
    { id: "BALL # 2", area: 137.93 },
    { id: "BALL # 3", area: 103.48 },
  ];
  let ballRow = 14;
  ballData.forEach(b => {
    const Qll = CalcSan.caudalRacional(0.0278, 100, b.area);
    const Dcalc_m = CalcSan.diametromaning(Qll / 1000, 0.009, S);
    const Dcalc_p = Dcalc_m * 1000 / 25.4;
    const Dp = CalcSan.diametroPropuesto(Dcalc_m * 1000);
    setRow(ws5, ballRow, [
      b.id, b.area, b.area, 100, 0.0278, r_v,
      parseFloat(Qll.toFixed(2)), 0.009, parseFloat(Dcalc_p.toFixed(2)),
      Dp.nominal, Dcalc_p <= Dp.pulg ? "O.K." : "No Cumple",
    ], FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    ballRow += 2;
  });

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 6: 5,Chequeo Canal ALL
  // ═══════════════════════════════════════════════════════════════════════
  const ws6 = wb.addWorksheet("5,Chequeo Canal ALL");
  ensureSheetRows(ws6, 50);
  ws6.mergeCells("A1:C7"); ws6.mergeCells("D2:P3"); ws6.mergeCells("D5:P5");
  ws6.mergeCells("D7:G7"); ws6.mergeCells("A8:P9");
  setCell(ws6, "D1", "Proyecto:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws6, "D2", proyecto.nombre, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle", wrapText: true }, null);
  setCell(ws6, "D4", "Sector:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws6, "D5", "0", FONT_HDR_BIG, "FFFFFFFF", ALIGN_L, null);
  setCell(ws6, "D6", "Dise\u00f1o:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws6, "O6", "Fecha:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws6, "D7", proyecto.ingeniero, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
  setCell(ws6, "O7", new Date().toISOString().slice(0, 10), FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
  setCell(ws6, "A8", "CHEQUEO CAPACIDAD CANAL CUBIERTA AGUAS LLUVIAS", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);

  ws6.mergeCells("A10:A12"); ws6.mergeCells("B10:C10");
  ws6.mergeCells("E10:E11"); ws6.mergeCells("F10:F11");
  ws6.mergeCells("G10:G11"); ws6.mergeCells("H10:H11");
  ws6.mergeCells("I10:N10");
  const chdr6 = (ref, val) => setCell(ws6, ref, val, FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  chdr6("A10", "Sector"); chdr6("B10", "AREA (A)");
  chdr6("D10", "Intensidad\nI"); chdr6("E10", "Coeficiente de Escorrentia");
  chdr6("F10", "Qreal\nC x I x A"); chdr6("G10", "Maning");
  chdr6("H10", "Pendiente"); chdr6("I10", "Secci\u00f3n Propuesta");
  chdr6("O10", "Q m\u00e1x"); chdr6("P10", "Chequeo");
  setCell(ws6, "B11", "PARCIAL", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "C11", "ACUMULADA", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "D11", "Promedio", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "I11", "b", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws6, "J11", "h", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws6, "K11", "bl", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws6, "L11", "b", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws6, "M11", "h", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws6, "N11", "Total", FONT_HDR, "FFFFFFFF", ALIGN_CW, BORDER_THIN);
  setCell(ws6, "O11", "Calculado", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "P11", "Qreal<Q m\u00e1x", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "B12", "m2", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "C12", "m2", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "D12", "mm/hr/m2", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "E12", "C", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "F12", "lps", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "G12", "n", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "H12", "S (%)", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "I12", "m", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "J12", "m", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "K12", "m", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "L12", "cm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "M12", "cm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "N12", "cm", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);
  setCell(ws6, "O12", "lps", FONT_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN);

  const canalData = [
    { id: "BALL # 1", area: 16.56 },
    { id: "BALL # 2", area: 40.28 },
    { id: "BALL # 3", area: 18.00 },
  ];
  let canalRow = 14;
  canalData.forEach(cd => {
    const Qreal = CalcSan.caudalRacional(0.0278, 100, cd.area);
    const cl = CalcSan.calcularCanalALL({
      sector: cd.id, area_parcial: cd.area, area_acum: cd.area,
      intensidad: 100, C: 0.0278, n: 0.01, pendiente: S,
      b_m: 0.3, h_m: 0.4, bordeLibre_m: 0.1,
    });
    const bCm = 30, hCm = 40, blCm = 10;
    setRow(ws6, canalRow, [
      cd.id, cd.area, cd.area, 100, 0.0278,
      parseFloat(Qreal.toFixed(2)), 0.01, 0.02,
      0.3, 0.3, 0.1, bCm, hCm + blCm,
      `${bCm} x ${hCm + blCm}`,
      parseFloat(cl.Q_max_Ls.toFixed(2)),
      cl.chequeo,
    ], FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    canalRow += 2;
  });

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 7: 6, Bomba Aguas Residuales
  // ═══════════════════════════════════════════════════════════════════════
  const ws7 = wb.addWorksheet("6, Bomba Aguas Residuales");
  ensureSheetRows(ws7, 75);
  ws7.mergeCells("C2:H3"); ws7.mergeCells("C5:H5");
  ws7.mergeCells("B8:H8"); ws7.mergeCells("B10:H10"); ws7.mergeCells("B25:H25");
  ws7.mergeCells("B35:H35"); ws7.mergeCells("B46:H46"); ws7.mergeCells("B57:H57");
  ws7.getColumn("B").width = 29.33;
  ws7.getColumn("C").width = 22;
  ws7.getColumn("D").width = 18.89;
  ws7.getColumn("H").width = 46.33;

  setCell(ws7, "C1", "Proyecto:", FONT_META, "FFFFFFFF", ALIGN_L, BORDER_THIN);
  setCell(ws7, "C2", proyecto.nombre, { name: "Calibri", size: 9, bold: true }, "FFFFFFFF", { horizontal: "left", vertical: "middle", wrapText: true }, BORDER_THIN);
  setCell(ws7, "C4", "Sector:", FONT_META, "FFFFFFFF", ALIGN_L, BORDER_THIN);
  setCell(ws7, "C5", "0", { name: "Calibri", size: 9, bold: true }, "FFFFFFFF", ALIGN_L, BORDER_THIN);
  setCell(ws7, "C6", "Dise\u00f1o:", FONT_META, "FFFFFFFF", ALIGN_L, BORDER_THIN);
  setCell(ws7, "H6", "Fecha:", FONT_META, "FFFFFFFF", ALIGN_L, BORDER_THIN);
  setCell(ws7, "C7", proyecto.ingeniero, { name: "Calibri", size: 9, bold: true }, "FFFFFFFF", ALIGN_L, BORDER_THIN);
  setCell(ws7, "H7", new Date().toISOString().slice(0, 10), { name: "Calibri", size: 9, bold: true }, "FFFFFFFF", ALIGN_L, BORDER_THIN);

  const BOMBA_BLUE_HDR = "FF4472C4";
  const BOMBA_BLUE_SEC = "FF2E75B6";
  const BOMBA_DARK = "FF1F3864";
  const BOMBA_WHITE = "FFFFFFFF";
  const BOMBA_GRAY = "FFF2F2F2";
  const BOMBA_WHITE2 = "FFFFFFFF";
  const BOMBA_LTBLUE = "FFD6E4F7";

  function bombaTitle(ref, val, bg) {
    setCell(ws7, ref, val, { name: "Calibri", size: 9, bold: true, color: { argb: "FFFFFFFF" } }, bg, { horizontal: "left", vertical: "middle" }, BORDER_THIN);
  }
  function bombaHdrRow(row, vals) {
    vals.forEach((v, i) => {
      const col = String.fromCharCode(66 + i);
      setCell(ws7, `${col}${row}`, v, { name: "Calibri", size: 9, bold: true, color: { argb: "FFFFFFFF" } }, BOMBA_BLUE_HDR, ALIGN_C, BORDER_THIN);
    });
  }
  function bombaRow(row, vals, bg, isInput) {
    vals.forEach((v, i) => {
      const col = String.fromCharCode(66 + i);
      const font = isInput && i === 2
        ? { name: "Calibri", size: 10, bold: true, italic: true, color: { argb: "FFFF0000" } }
        : i === 1 ? { name: "Calibri", size: 9, bold: true, italic: true, color: { argb: BOMBA_DARK } }
        : { name: "Calibri", size: 9, color: { argb: (i === 7 || i === 0) ? "FF595959" : "FF000000" }, italic: i === 7 || i === 0 };
      setCell(ws7, `${col}${row}`, v, font, bg || BOMBA_WHITE, i === 0 ? ALIGN_L : ALIGN_C, BORDER_THIN);
    });
  }
  function bombaEqRow(row, vals, bg) {
    vals.forEach((v, i) => {
      const col = String.fromCharCode(66 + i);
      setCell(ws7, `${col}${row}`, v, { name: "Calibri", size: 9, color: { argb: "FF000000" } }, bg || BOMBA_LTBLUE, ALIGN_C, BORDER_THIN);
    });
  }

  setCell(ws7, "B8", "DISE\u00d1O BOMBA ELEVACI\u00d3N AGUAS RESIDUALES \u2014 S\u00d3TANO A PRIMER PISO", { name: "Calibri", size: 9, bold: true, color: { argb: "FFFFFFFF" } }, BOMBA_DARK, ALIGN_C, BORDER_THIN);
  bombaTitle("B10", "1. DATOS DE ENTRADA  (celdas amarillas = editables)", BOMBA_BLUE_SEC);
  bombaHdrRow(11, ["Par\u00e1metro", "S\u00edmbolo", "Valor", "Unidad", "Equivalencia", "Unidad2", "Fuente / Norma"]);

  // Datos entrada - alternando gray/white
  const udSotano = udByTramo.find(t => t.tramo === "Sotano")?.UD_acumulado || 14;
  const Kb = 1; // n=1 -> K=1
  const Qdis = 0.71; // UD=14, K=1 -> 0.1163*14^0.6875
  const Qb = Qdis * 1.25;
  const Hz = Math.abs(((pisos || []).find(p => p.n < 0)?.npt || -3) - ((pisos || []).find(p => p.n === 1)?.npt || 0));
  const L_imp = 20;
  const D_imp_pulg = 3;
  const C_HW = 150;
  const V_imp = (4 * (Qb / 1000)) / (Math.PI * Math.pow(D_imp_pulg * 0.0254, 2));
  const hf_HW = (10.67 * 20 * Math.pow(Qb / 1000, 1.852)) / (Math.pow(C_HW, 1.852) * Math.pow(D_imp_pulg * 0.0254, 4.87));

  let bRow2 = 12;
  bombaRow(bRow2++, ["N\u00famero de Salidas Simultaneas", "Sal sim", 1, "und", "", "", "Probabilidad de trabajar al maximo"], BOMBA_GRAY, true);
  bombaRow(bRow2++, ["UD acumuladas en s\u00f3tano", "UD_tot", udSotano, "UD", "", "", "NTC 1500"], BOMBA_WHITE, true);
  bombaRow(bRow2++, ["Coeficiente K simultaneidad Hunter", "K", parseFloat(Kb.toFixed(2)), "\u2014", "", "", "K=1/\u221a(n\u22121)"], BOMBA_GRAY, false);
  bombaRow(bRow2++, ["Caudal de dise\u00f1o Q = UD \u00d7 K", "Q_dis", parseFloat(Qdis.toFixed(2)), "lps", "", "GPM", "M\u00e9todo Hunter NTC 1500"], BOMBA_WHITE, false);
  bombaEqRow(bRow2 - 1, ["", "", "", "", parseFloat((Qdis * 15.8503).toFixed(2)), "", ""], BOMBA_LTBLUE);
  bombaRow(bRow2++, ["Caudal bombeo Qb (reserva 25%)", "Q_b", parseFloat(Qb.toFixed(2)), "lps", "", "GPM", "Factor seguridad sobre Q dise\u00f1o"], BOMBA_GRAY, false);
  bombaEqRow(bRow2 - 1, ["", "", "", "", parseFloat((Qb * 15.8503).toFixed(2)), "", ""], BOMBA_LTBLUE);
  bombaRow(bRow2++, ["Altura geom\u00e9trica s\u00f3tano \u2192 piso 1", "Hz", parseFloat(Hz.toFixed(1)), "m", "", "", "Diferencia de nivel"], BOMBA_WHITE, true);
  bombaRow(bRow2++, ["Longitud total tuber\u00eda impulsi\u00f3n", "L_imp", L_imp, "m", "", "", "Tramos verticales + horizontales hasta descarga"], BOMBA_GRAY, true);
  bombaRow(bRow2++, ["Di\u00e1metro tuber\u00eda impulsi\u00f3n", "D_imp", D_imp_pulg, "pulg", "", "mm", "M\u00ednimo 2\" para residuales \u2014 NTC 1500 \u00a78"], BOMBA_WHITE, true);
  bombaEqRow(bRow2 - 1, ["", "", "", "", D_imp_pulg * 25, "", ""], BOMBA_LTBLUE);
  bombaRow(bRow2++, ["Coeficiente C Hazen-Williams (PVC)", "C_HW", C_HW, "\u2014", "", "", "RAS 2000 \u00a7B.6.4.2 \u2014 PVC liso nuevo"], BOMBA_GRAY, true);
  bombaRow(bRow2++, ["Presi\u00f3n m\u00ednima en descarga", "P_desc", 1, "m.c.a.", "", "psi", "Presi\u00f3n en punto entrega piso 1"], BOMBA_WHITE, true);
  bombaEqRow(bRow2 - 1, ["", "", "", "", parseFloat((1 * 1.42).toFixed(2)), "", ""], BOMBA_LTBLUE);
  bombaRow(bRow2++, ["Eficiencia bomba \u03b7", "eta_b", 0.65, "\u2014", "", "", "Bomba sumergible trituradora t\u00edpica: 60\u201370%"], BOMBA_GRAY, true);
  bombaRow(bRow2++, ["Factor de servicio motor", "f_srv", 1.25, "\u2014", "", "", "NEMA MG1: reserva 25% sobre potencia calculada"], BOMBA_WHITE, true);

  // Seccion 2: Perdidas de carga
  bombaTitle("B25", "2. C\u00c1LCULO DE P\u00c9RDIDAS DE CARGA \u2014 HAZEN-WILLIAMS", BOMBA_BLUE_SEC);
  bombaHdrRow(26, ["Componente", "S\u00edmbolo", "Valor", "Unidad", "Equivalencia", "Unidad2", "Observaci\u00f3n"]);
  let bRow3 = 27;
  const Hf_val = hf_HW < 1e-6 ? 0.015 : hf_HW;
  const H_ac = Hf_val * 0.25;
  const H_fri = Hf_val + H_ac;
  const H_est = Hz + 1 + H_fri;
  const H_m = H_fri + Hz + 1;
  const Vchk = V_imp >= 0.6 && V_imp <= 3.5 ? "O.K." : "REVISAR DI\u00c1METRO";

  bombaRow(bRow3++, ["Velocidad en tuber\u00eda impulsi\u00f3n", "V_imp", parseFloat(V_imp.toFixed(4)), "m/s", "", "", "0.6 < V < 3.5 m/s para residuales"], BOMBA_GRAY, false);
  bombaRow(bRow3++, ["P\u00e9rdida fricci\u00f3n (Hazen-Williams)", "Hf", parseFloat(Hf_val.toFixed(6)), "m.c.a.", "", "", "hf=10.67\u00b7L\u00b7Q^1.852/(C^1.852\u00b7D^4.87)"], BOMBA_WHITE, false);
  bombaRow(bRow3++, ["P\u00e9rdida en accesorios (25% de Hf)", "H_ac", parseFloat(H_ac.toFixed(6)), "m.c.a.", "", "", "Estimaci\u00f3n conservadora"], BOMBA_GRAY, false);
  bombaRow(bRow3++, ["P\u00e9rdida total por fricci\u00f3n", "H_fri", parseFloat(H_fri.toFixed(6)), "m.c.a.", "", "", "Hf tuber\u00eda + accesorios"], BOMBA_WHITE, false);
  bombaRow(bRow3++, ["Altura est\u00e1tica total", "H_est", parseFloat(H_est.toFixed(6)), "m.c.a.", "", "", "Hz geom\u00e9trica + presi\u00f3n m\u00ednima descarga"], BOMBA_GRAY, false);
  bombaRow(bRow3++, ["Altura manom\u00e9trica total Hm", "H_m", parseFloat(H_m.toFixed(6)), "m.c.a.", "", "psi", "Hm = H_fri + H_est"], BOMBA_WHITE, false);
  bombaEqRow(bRow3 - 1, ["", "", "", "", parseFloat((H_m * 1.42).toFixed(2)), "", ""], BOMBA_LTBLUE);
  bombaRow(bRow3++, ["Chequeo velocidad", "V_chk", Vchk, "", "", "", "Verificaci\u00f3n autom\u00e1tica"], BOMBA_GRAY, false);

  // Seccion 3: Dimensionamiento
  bombaTitle("B35", "3. DIMENSIONAMIENTO DE LA BOMBA SUMERGIBLE TRITURADORA", BOMBA_BLUE_SEC);
  bombaHdrRow(36, ["Par\u00e1metro", "S\u00edmbolo", "Valor", "Unidad", "Conversi\u00f3n", "Unidad2", "Norma / Observaci\u00f3n"]);
  const Ph_w = 1000 * 9.806 * (Qb / 1000) * Math.max(H_m, 0.1);
  const Ph_hp = Ph_w / 746;
  const Pe_hp = Ph_hp / 0.65;
  const Pcom_hp = Math.max(0.5, Math.ceil(Pe_hp * 1.25 * 2) / 2);

  let bRow4 = 37;
  bombaRow(bRow4++, ["Caudal nominal bomba", "Q_b", parseFloat(Qb.toFixed(2)), "lps", "", "GPM", "Incluye reserva 25%"], BOMBA_GRAY, false);
  bombaEqRow(bRow4 - 1, ["", "", "", "", parseFloat((Qb * 15.8503).toFixed(2)), "", ""], BOMBA_LTBLUE);
  bombaRow(bRow4++, ["Altura manom\u00e9trica Hm", "H_m", parseFloat(H_m.toFixed(6)), "m.c.a.", "", "psi", "Tomado de bloque 2"], BOMBA_WHITE, false);
  bombaEqRow(bRow4 - 1, ["", "", "", "", parseFloat((H_m * 1.42).toFixed(2)), "", ""], BOMBA_LTBLUE);
  bombaRow(bRow4++, ["Potencia hidr\u00e1ulica", "P_hid", parseFloat(Ph_w.toFixed(2)), "W", "", "HP", "Ph = \u03c1\u00b7g\u00b7Q\u00b7Hm / 1000"], BOMBA_GRAY, false);
  bombaEqRow(bRow4 - 1, ["", "", "", "", parseFloat(Ph_hp.toFixed(4)), "", ""], BOMBA_LTBLUE);
  bombaRow(bRow4++, ["Potencia en el eje", "P_eje", parseFloat((Ph_w * 0.65).toFixed(2)), "W", "", "HP", "P_eje = Ph / \u03b7_bomba"], BOMBA_WHITE, false);
  bombaEqRow(bRow4 - 1, ["", "", "", "", parseFloat((Pe_hp).toFixed(4)), "", ""], BOMBA_LTBLUE);
  bombaRow(bRow4++, ["Potencia comercial (\u00d7f_srv)", "P_com", 0, "W", "", "HP", "Motor seleccionar \u2265 este valor"], BOMBA_GRAY, false);
  bombaEqRow(bRow4 - 1, ["", "", "", "", 0, "", ""], BOMBA_LTBLUE);
  bombaRow(bRow4++, ["Selecci\u00f3n comercial autom\u00e1tica", "Sel", `${Pcom_hp} HP`, "HP", "", "", "Potencias est\u00e1ndar: 0.5 / 1 / 2 / 3 / 5 HP"], BOMBA_WHITE, false);
  bombaRow(bRow4++, ["Tipo de bomba", "Tipo", "Sumergible trituradora", "", "", "", "Para residuales con s\u00f3lidos \u2014 NTC 1500 \u00a78.5"], BOMBA_GRAY, false);
  bombaRow(bRow4++, ["NPSH disponible m\u00ednimo", "NPSH", 1.5, "m", "", "", "Verificar con curva del fabricante seleccionado"], BOMBA_WHITE, false);

  // Seccion 4: Camara de bombeo
  bombaTitle("B46", "4. DIMENSIONAMIENTO C\u00c1MARA DE BOMBEO (POZO H\u00daMEDO)", BOMBA_BLUE_SEC);
  bombaHdrRow(47, ["Par\u00e1metro", "S\u00edmbolo", "Valor", "Unidad", "", "", "Norma / Observaci\u00f3n"]);
  const t_cic = 5;
  const V_cam_lts = Qb * t_cic * 60;
  const h_min = 0.3, h_max = 1.2, b_cam = 0.6, l_cam = 0.8;
  const V_geo = b_cam * l_cam * (h_max - h_min);
  const Vchk2 = V_geo >= V_cam_lts / 1000 ? "O.K." : "No Cumple";

  let bRow5 = 48;
  bombaRow(bRow5++, ["Tiempo m\u00ednimo ciclo arranque", "t_cic", t_cic, "min", "", "", "M\u00ednimo 5 min entre arranques"], BOMBA_GRAY, false);
  bombaRow(bRow5++, ["Volumen \u00fatil c\u00e1mara m\u00ednimo", "V_cam", V_cam_lts, "lts", "", "m\u00b3", "V = Qb(lps) \u00d7 t(s)"], BOMBA_WHITE, false);
  bombaEqRow(bRow5 - 1, ["", "", "", "", "", parseFloat((V_cam_lts / 1000).toFixed(3)), ""], BOMBA_LTBLUE);
  bombaRow(bRow5++, ["Tirante m\u00ednimo sobre bomba", "h_min", h_min, "m", "", "", "Evita cavitaci\u00f3n"], BOMBA_GRAY, false);
  bombaRow(bRow5++, ["Tirante m\u00e1ximo antes de arrancar", "h_max", h_max, "m", "", "", "Nivel de activaci\u00f3n del flotador o sensor"], BOMBA_WHITE, false);
  bombaRow(bRow5++, ["Ancho m\u00ednimo c\u00e1mara", "b_cam", b_cam, "m", "", "", "NTC 1500 \u00a78.5"], BOMBA_GRAY, false);
  bombaRow(bRow5++, ["Largo m\u00ednimo c\u00e1mara", "l_cam", l_cam, "m", "", "", "Verificar con dimensiones f\u00edsicas de la bomba"], BOMBA_WHITE, false);
  bombaRow(bRow5++, ["Volumen geom\u00e9trico disponible", "V_geo", parseFloat(V_geo.toFixed(4)), "m\u00b3", "", "lts", "b\u00d7l\u00d7(h_max\u2212h_min)"], BOMBA_GRAY, false);
  bombaEqRow(bRow5 - 1, ["", "", "", "", "", parseFloat((V_geo * 1000).toFixed(2)), ""], BOMBA_LTBLUE);
  bombaRow(bRow5++, ["Chequeo volumen", "V_chk", Vchk2, "", "", "", "V_geo \u2265 V_cam requerido"], BOMBA_WHITE, false);

  // Seccion 5: Especificacion
  bombaTitle("B57", "5. ESPECIFICACI\u00d3N T\u00c9CNICA \u2014 RESUMEN", BOMBA_BLUE_SEC);
  ws7.mergeCells("B58:C58"); ws7.mergeCells("B59:C59"); ws7.mergeCells("B60:C60");
  ws7.mergeCells("B61:C61"); ws7.mergeCells("B62:C62"); ws7.mergeCells("B63:C63");
  ws7.mergeCells("B64:C64"); ws7.mergeCells("D59:H59"); ws7.mergeCells("D60:H60");
  ws7.mergeCells("D61:H61"); ws7.mergeCells("D62:H62"); ws7.mergeCells("D63:H63");
  ws7.mergeCells("D64:H64");
  ws7.mergeCells("B65:C65"); ws7.mergeCells("B66:C66"); ws7.mergeCells("B67:C67");
  ws7.mergeCells("B68:C68"); ws7.mergeCells("B69:C69"); ws7.mergeCells("B70:C70");
  ws7.mergeCells("D65:H65"); ws7.mergeCells("D66:H66"); ws7.mergeCells("D67:H67");
  ws7.mergeCells("D68:H68"); ws7.mergeCells("D69:H69"); ws7.mergeCells("D70:H70");
  ws7.mergeCells("B71:C71"); ws7.mergeCells("D71:H71");

  const bold9 = { name: "Calibri", size: 9, bold: true };
  const norm9 = { name: "Calibri", size: 9 };
  setCell(ws7, "B58", "BOMBA SUMERGIBLE TRITURADORA", bold9, BOMBA_WHITE, ALIGN_L, BORDER_THIN);
  setCell(ws7, "B59", "Caudal nominal", norm9, BOMBA_GRAY, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D59", parseFloat((Qb * 15.8503).toFixed(2)), norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);
  setCell(ws7, "B60", "Altura manom\u00e9trica total (Hm)", norm9, BOMBA_WHITE, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D60", parseFloat(H_m.toFixed(6)), norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);
  setCell(ws7, "B61", "Potencia motor", norm9, BOMBA_GRAY, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D61", `${Pcom_hp} HP`, norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);
  setCell(ws7, "B62", "Tipo", norm9, BOMBA_WHITE, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D62", "Bomba sumergible trituradora, impeler monocanal", norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);
  setCell(ws7, "B63", "Tensi\u00f3n", norm9, BOMBA_GRAY, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D63", "110V o 220V monof\u00e1sica \u2014 confirmar con proveedor", norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);

  setCell(ws7, "B65", "C\u00c1MARA DE BOMBEO", bold9, BOMBA_WHITE, ALIGN_L, BORDER_THIN);
  setCell(ws7, "B66", "Volumen \u00fatil requerido", norm9, BOMBA_GRAY, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D66", V_cam_lts, norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);
  setCell(ws7, "B67", "Dimensiones m\u00ednimas", norm9, BOMBA_WHITE, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D67", `0.6x0.8x${(h_max - h_min).toFixed(1)}`, norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);
  setCell(ws7, "B68", "Material", norm9, BOMBA_GRAY, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D68", "Concreto impermeabilizado o polietileno PEAD", norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);
  setCell(ws7, "B69", "Accesorios obligatorios", norm9, BOMBA_WHITE, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D69", "Rejilla aguas arriba + ventilaci\u00f3n \u00d82\" + alarma nivel alto", norm9, BOMBA_WHITE, ALIGN_C, BORDER_THIN);
  setCell(ws7, "B71", "NOTA NORMATIVA", bold9, BOMBA_WHITE, ALIGN_L, BORDER_THIN);
  setCell(ws7, "D71", "Dise\u00f1o conforme NTC 1500 \u00a78 y RAS 2000 T\u00edtulo D. La bomba trituradora es obligatoria para s\u00f3lidos fecales. Verificar caudal con empresa de servicios (EMAB/AMB) antes de definir acometida.", { name: "Calibri", size: 9, italic: true, color: { argb: "FF595959" } }, BOMBA_WHITE, { horizontal: "left", vertical: "middle", wrapText: true }, BORDER_THIN);
  ws7.getRow(71).height = 37.5;

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 8: Tuberias
  // ═══════════════════════════════════════════════════════════════════════
  const ws8 = wb.addWorksheet("Tuberias");
  ensureSheetRows(ws8, 40);
  ws8.mergeCells("A2:G2");
  ws8.mergeCells("A3:D3"); ws8.mergeCells("E3:F4"); ws8.mergeCells("G3:G4");
  ws8.mergeCells("A4:A5"); ws8.mergeCells("B4:C4");
  ws8.mergeCells("A13:G13");
  ws8.mergeCells("A14:D14"); ws8.mergeCells("E14:F15"); ws8.mergeCells("G14:G15");
  ws8.mergeCells("A15:A16"); ws8.mergeCells("B15:C15");
  ws8.mergeCells("A23:G23");
  ws8.mergeCells("A24:D24"); ws8.mergeCells("E24:F25"); ws8.mergeCells("G24:G25");
  ws8.mergeCells("A25:A26"); ws8.mergeCells("B25:C25");

  function tubHdr(ref, val) { setCell(ws8, ref, val, FONT_TUB_HDR, "FFFFFFFF", ALIGN_C, BORDER_THIN); }
  function tubCell(ref, val, font) { setCell(ws8, ref, val, font || FONT_TUB, "FFFFFFFF", { vertical: "top", wrapText: true }, BORDER_THIN); }

  setCell(ws8, "A2", "Tuber\u00edas Sanitarias y Aguas Lluvias\nPresi\u00f3n de Prueba: 0.35 MPa - 50 PSI", FONT_TUB_TITLE, "FFFFFFFF", { horizontal: "center", vertical: "top", wrapText: true }, null);
  setCell(ws8, "J2", "Relacion", FONT_DATA, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "J3", "Q/Qo", FONT_DATA, "FFFFFFFF", ALIGN_C, null);

  tubHdr("A3", "Diametro"); tubHdr("E3", "Espesor pared promedio"); tubHdr("G3", "Peso");
  tubHdr("A4", "Nominal"); tubHdr("B4", "Exterior"); tubHdr("D4", "Interior");
  setCell(ws8, "B5", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "C5", "pulg", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "D5", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "E5", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "F5", "pulg", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "G5", "kg/m", FONT_TUB_HDR, "FFFFFFFF", ALIGN_C, null);

  let tubRow = 6;
  CalcSan.TUBERIAS_SAN.forEach(t => {
    const vals = [t.nominal, t.dExt, t.dExtPulg, t.dInt, t.espesor, t.espPulg, t.peso];
    ["A","B","C","D","E","F","G"].forEach((c, i) => tubCell(`${c}${tubRow}`, vals[i], i === 0 ? { ...FONT_TUB, alignment: { horizontal: "center", vertical: "center", wrapText: true } } : FONT_TUB));
    tubRow++;
  });

  setCell(ws8, "A13", "Tuber\u00edas Ventilaci\u00f3n", { ...FONT_TUB_TITLE, size: 12 }, "FFFFFFFF", ALIGN_C, null);
  tubHdr("A14", "Diametro"); tubHdr("E14", "Espesor pared promedio"); tubHdr("G14", "Peso");
  tubHdr("A15", "Nominal"); tubHdr("B15", "Exterior"); tubHdr("D15", "Interior");
  setCell(ws8, "B16", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "C16", "pulg", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "D16", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "E16", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "F16", "pulg", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "G16", "kg/m", FONT_TUB_HDR, "FFFFFFFF", ALIGN_C, null);

  tubRow = 17;
  CalcSan.TUBERIAS_VENT.forEach(t => {
    const vals = [t.nominal, t.dExt, t.dExtPulg, t.dInt, t.espesor, t.espPulg, t.peso];
    ["A","B","C","D","E","F","G"].forEach((c, i) => tubCell(`${c}${tubRow}`, vals[i], i === 0 ? { ...FONT_TUB, alignment: { horizontal: "center", vertical: "center", wrapText: true } } : FONT_TUB));
    tubRow++;
  });

  setCell(ws8, "A23", "Tuber\u00edas Sanitarias Novatec\nLa longitud normal de los tubos es de 6 mt.", FONT_TUB_TITLE, "FFFFFFFF", { horizontal: "center", vertical: "top", wrapText: true }, null);
  tubHdr("A24", "Diametro"); tubHdr("E24", "Espesor pared promedio"); tubHdr("G24", "Peso");
  tubHdr("A25", "Nominal"); tubHdr("B25", "Exterior"); tubHdr("D25", "Interior");
  setCell(ws8, "B26", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "C26", "pulg", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "D26", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "E26", "mm", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "F26", "pulg", FONT_TUB, "FFFFFFFF", ALIGN_C, null);
  setCell(ws8, "G26", "kg/m", FONT_TUB_HDR, "FFFFFFFF", ALIGN_C, null);

  tubRow = 27;
  const novatec = CalcSan.TUBERIAS_SAN.filter(t => t.nominal !== "1\u00bd\"");
  novatec.forEach(t => {
    const vals = [t.nominal, t.dExt, t.dExtPulg, t.dInt, t.espesor, t.espPulg, t.peso];
    ["A","B","C","D","E","F","G"].forEach((c, i) => tubCell(`${c}${tubRow}`, vals[i], i === 0 ? { ...FONT_TUB, alignment: { horizontal: "center", vertical: "center", wrapText: true } } : FONT_TUB));
    tubRow++;
  });

  // ─── RETORNAR BLOB PARA DESCARGA ────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  return { blob, nombreArchivo: (proyecto.nombre || "Proyecto").replace(/[^a-zA-Z0-9]/g, "_"), prefijo: "Calculo_Redes_Sanitarias" };
}
