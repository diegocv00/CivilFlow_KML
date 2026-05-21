import ExcelJS from "exceljs";
import { DIAM_OPTIONS } from "../components/constants";

const FONT_HDR = { name: "Calibri", size: 8, bold: true };
const FONT_HDR_BIG = { name: "Calibri", size: 11, bold: true };
const FONT_TITLE = { name: "Calibri", size: 16, bold: true };
const FONT_TITLE_MED = { name: "Calibri", size: 11, bold: true, italic: true };
const FONT_DATA = { name: "Calibri", size: 8 };
const FONT_META = { name: "Calibri", size: 8, bold: true, italic: true };
const ALIGN_C = { horizontal: "center", vertical: "middle" };
const ALIGN_CW = { horizontal: "center", vertical: "middle", wrapText: true };
const ALIGN_L = { horizontal: "left", vertical: "middle" };
const BORDER_THIN = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
const BORDER_HAIR = { top: { style: "hair" }, bottom: { style: "hair" }, left: { style: "thin" }, right: { style: "thin" } };

function ensureSheetRows(ws, upTo) {
  for (let i = 1; i <= upTo; i++) ws.getRow(i);
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
  for (let i = 0; i < colLetter.length; i++) colNum = colNum * 26 + (colLetter.charCodeAt(i) - 64);
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

function calcTramo(t, diamOpts) {
  const n = t.nmaning || 0.009;
  const S = (t.sPercent || 2) / 100;
  const Q = t.qLps || 0;
  const dSel = diamOpts.find(d => d.pulg === (t.diamDisPulg || 0)) || null;
  const DintMm = dSel ? dSel.mm : 0;

  let DcalcPulg = 0, DdisPulg = dSel ? dSel.pulg : 0, Dint = DintMm, chequeoDiam = '\u2014';
  let Qo = 0, Vo = 0, qqo = 0, Vreal = 0, chequeoV = '\u2014';
  let Yc = 0, Yn = 0, Froude = 0, tipoFlujo = '\u2014', Ymax = 0, chequeoYn = '\u2014';
  let fuerzaTractiva = 0, chequeoFT = '\u2014';
  let v = 0, y_D = 0, alpha = 0, Rh_D = 0, Rh = 0;

  if (Q > 0 && S > 0 && DintMm > 0) {
    DcalcPulg = Math.round(1.548 * Math.pow((n * Q / 1000 / Math.sqrt(S)), 3/8) * 1000 / 25.4 * 100) / 100;
    chequeoDiam = DcalcPulg <= DdisPulg ? 'O.K.' : 'NO CUMPLE';
    Qo = Math.round(0.312 * Math.pow(DintMm / 1000, 8/3) * Math.sqrt(S) / n * 1000 * 100) / 100;
    Vo = Math.round(4 * Qo / 1000 / Math.PI / Math.pow(DintMm / 1000, 2) * 100) / 100;
    qqo = Qo > 0 ? Math.round(Q / Qo * 100) / 100 : 0;
    const q = Qo > 0 ? Q / Qo : 0;
    if (q > 0) {
      v = q <= 0.06 ? Math.pow(10, 0.029806 + 0.29095 * Math.log10(q)) : q <= 0.26 ? Math.pow(10, 0.013778 + 0.28597 * Math.log10(q)) : Math.pow(10, 0.021763 + 0.289951 * Math.log10(q));
      y_D = q < 0.11 ? 0.3827 + 0.0645 * Math.log(q) : q < 0.21 ? 0.60025 + 0.15471 * Math.log(q) : 0.225 + 0.667 * q;
    }
    Vreal = Math.round(v * Vo * 100) / 100;
    chequeoV = (Vreal < 0.45 || Vreal > 4.0) ? 'NO CUMPLE' : 'O.K.';
    alpha = 2 * Math.acos(1 - 2 * y_D);
    Rh_D = 0.25 * (1 - Math.sin(alpha) / alpha);
    Rh = Rh_D * DintMm;
    Yc = Math.round(0.296938082 * DintMm * 100) / 100;
    Yn = Math.round(y_D * DintMm * 100) / 100;
    Ymax = Math.round(DintMm * 0.75 * 100) / 100;
    chequeoYn = Math.max(Yc, Yn) < Ymax ? 'O.K.' : 'NO CUMPLE';
    Froude = Math.round(Vreal / Math.sqrt(9.806 * Rh / 1000) * 100) / 100;
    tipoFlujo = Froude > 1.1 ? 'Supercr\u00edtico' : Froude < 0.9 ? 'Subcr\u00edtico' : 'Cr\u00edtico';
    fuerzaTractiva = Math.round(1000 * Rh / 1000 * S * 100) / 100;
    chequeoFT = fuerzaTractiva > 0.15 ? 'O.K.' : 'NO CUMPLE';
  }

  return { DcalcPulg, DdisPulg, Dint, chequeoDiam, Qo, Vo, qqo, Vreal, chequeoV, Yc, Yn, Froude, tipoFlujo, Ymax, chequeoYn, fuerzaTractiva, chequeoFT, v, y_D, alpha, Rh_D, Rh };
}

function calcBajante(b) {
  const areaAcum = b.areaAcumulada || 0;
  const inten = b.intensidad || 0;
  const cVal = b.coeficienteC || 0;
  const R = b.R === '1/4' ? 0.25 : 7/24;
  const Q = areaAcum > 0 && inten > 0 && cVal > 0 ? Math.round(areaAcum * inten * cVal / 100 * 100) / 100 : 0;
  const diamCalc = Q > 0 && R > 0 ? Math.round(Math.pow(Q / (1.754 * Math.pow(R, 5/3)), 3/8) * 100) / 100 : 0;
  const diamProp = b.diamPropuesto || 0;
  const chequeo = diamCalc > 0 && diamProp > 0 ? (diamCalc < diamProp ? 'O.K.' : 'No Cumple') : '\u2014';
  return { Q, diamCalc, chequeo };
}

function calcCanal(c) {
  const areaAcum = c.areaAcumulada || 0;
  const inten = c.intensidad || 0;
  const cVal = c.coeficienteC || 0;
  const n = c.manning || 0.009;
  const S = (c.pendiente || 0) / 100;
  const b_cm = c.b || 0, h_cm = c.h || 0;
  const b_m = b_cm / 100, h_m = h_cm / 100;
  const Qreal = areaAcum > 0 && inten > 0 && cVal > 0 ? Math.round(areaAcum * inten * cVal / 100 * 100) / 100 : 0;
  const Qmax = b_m > 0 && h_m > 0 && n > 0 && S > 0 ? Math.round(1000 * b_m * h_m / n * Math.sqrt(S) * Math.pow(b_m * h_m / (b_m + 2 * h_m), 2/3) * 100) / 100 : 0;
  const chequeo = Qmax > 0 && Qreal > 0 ? (Qmax > Qreal ? 'O.K.' : 'No Cumple') : '\u2014';
  return { Qreal, Qmax, chequeo };
}

function writeHeader(ws, proyecto, lastCol) {
  const lc = lastCol;
  ws.mergeCells(`A1:D7`);
  ws.mergeCells(`E2:${lc}3`);
  ws.mergeCells(`E4:${numToCol(numToNum(lc)-2)}5`);
  ws.mergeCells(`${numToCol(numToNum(lc)-1)}4:${lc}5`);
  setCell(ws, "A1", "[LOGO]", { name: "Calibri", size: 9, italic: true, color: { argb: "FFCCCCCC" } }, "FFFFFFFF", ALIGN_C, null);
  setCell(ws, "E1", "Proyecto:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws, "E2", proyecto.nombre, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle", wrapText: true }, null);
  setCell(ws, "E4", "Dise\u00f1o:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws, `${numToCol(numToNum(lc)-1)}4`, "Fecha:", FONT_META, "FFFFFFFF", ALIGN_L, null);
  setCell(ws, "E5", proyecto.ingeniero, FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
  setCell(ws, `${numToCol(numToNum(lc)-1)}5`, new Date().toISOString().slice(0, 10), FONT_HDR_BIG, "FFFFFFFF", { horizontal: "left", vertical: "middle" }, null);
}

function numToNum(col) {
  let n = 0;
  for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
  return n;
}

export async function generarExcelLluvias({ proyecto, tramosLl = [], bajantesLl = [], canalesLl = [], pisos = [] }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = proyecto.ingeniero || "Ing. Camilo C\u00e1rdenas Chac\u00f3n";

  const diamOpts = DIAM_OPTIONS;

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 1: Red Lluvias
  // ═══════════════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet("Red Lluvias");
  ensureSheetRows(ws1, 60);
  // Columns A-X = 24
  for (let i = 1; i <= 24; i++) ws1.getColumn(numToCol(i)).width = 9;
  ws1.getColumn("A").width = 11;
  ws1.getColumn("B").width = 6;
  ws1.getColumn("C").width = 8;
  ws1.getColumn("D").width = 8;
  ws1.getColumn("E").width = 12;
  ws1.getColumn("F").width = 8;
  ws1.getColumn("I").width = 8;
  ws1.getColumn("J").width = 9;
  ws1.getColumn("K").width = 8;
  ws1.getColumn("L").width = 9;
  ws1.getColumn("P").width = 8;
  ws1.getColumn("W").width = 8;
  ws1.getColumn("X").width = 8;

  writeHeader(ws1, proyecto, "X");

  // Title
  ws1.mergeCells("A8:X8");
  setCell(ws1, "A8", "DISE\u00d1O RED AGUAS LLUVIAS", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);

  // Table header - Row 9 (group labels with rowSpan/colSpan)
  ws1.mergeCells("A9:A11"); setCell(ws1, "A9", "TRAMO\nO RAMAL", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("B9:B11"); setCell(ws1, "B9", "PISO", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells("C9:C11"); setCell(ws1, "C9", "DE", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells("D9:D11"); setCell(ws1, "D9", "A", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells("E9:E11"); setCell(ws1, "E9", "BAJANTES", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("F9:F11"); setCell(ws1, "F9", "Q\nLPS", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("G9:G11"); setCell(ws1, "G9", "MANING\nn", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("H9:H11"); setCell(ws1, "H9", "S\n%", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("I9:K9"); setCell(ws1, "I9", "DI\u00c1METRO", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("L9:L11"); setCell(ws1, "L9", "Qo\nLPS", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("M9:M11"); setCell(ws1, "M9", "Vo\nm/s", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("N9:N11"); setCell(ws1, "N9", "Q/Qo", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells("O9:O11"); setCell(ws1, "O9", "Vreal\nm/s", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("P9:P11"); setCell(ws1, "P9", "CHEQUEO\nV", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("Q9:Q11"); setCell(ws1, "Q9", "Yc\nmm", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("R9:R11"); setCell(ws1, "R9", "Yn\nmm", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("S9:S11"); setCell(ws1, "S9", "FROUDE", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells("T9:T11"); setCell(ws1, "T9", "TIPO DE\nFLUJO", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("U9:U11"); setCell(ws1, "U9", "Ymax=\n0.75D", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("V9:V11"); setCell(ws1, "V9", "Yn vs Yc", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws1.mergeCells("W9:X9"); setCell(ws1, "W9", "FUERZA TRACTIVA", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);

  // Row 10 - sub-headers
  setCell(ws1, "I10", "Calc.\npulg", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  setCell(ws1, "J10", "Dise\u00f1o\npulgada", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  setCell(ws1, "K10", "Interno\nmm", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  setCell(ws1, "W10", "Vr\nkg/m2", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  setCell(ws1, "X10", ">0.15", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);

  // Row 11 - units
  const unitRows = ["I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X"];
  unitRows.forEach(c => setCell(ws1, `${c}11`, "", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN));

  // Data rows for DisenoLluvias
  let rowNum = 12;
  const results = tramosLl.map(t => {
    const r = calcTramo(t, diamOpts);
    return { ...r, tramo: t.id, piso: t.piso, desde: t.desde || '', hasta: t.hasta || '', bajantes: t.descripcion || '', qLps: t.qLps || 0, nmaning: t.nmaning || 0.009, sPercent: t.sPercent || 2 };
  });

  results.forEach((r, idx) => {
    setCell(ws1, `A${rowNum}`, r.tramo, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `B${rowNum}`, r.piso, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `C${rowNum}`, r.desde, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `D${rowNum}`, r.hasta, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `E${rowNum}`, r.bajantes, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `F${rowNum}`, r.qLps > 0 ? r.qLps : '', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `G${rowNum}`, r.nmaning > 0 ? r.nmaning : '', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `H${rowNum}`, r.sPercent > 0 ? r.sPercent : '', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `I${rowNum}`, r.DcalcPulg > 0 ? r.DcalcPulg : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `J${rowNum}`, r.DdisPulg > 0 ? r.DdisPulg : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `K${rowNum}`, r.Dint > 0 ? r.Dint : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `L${rowNum}`, r.Qo > 0 ? r.Qo : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `M${rowNum}`, r.Vo > 0 ? r.Vo : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `N${rowNum}`, r.qqo > 0 ? r.qqo : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `O${rowNum}`, r.Vreal > 0 ? r.Vreal : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `P${rowNum}`, r.chequeoV, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `Q${rowNum}`, r.Yc > 0 ? r.Yc : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `R${rowNum}`, r.Yn > 0 ? r.Yn : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `S${rowNum}`, r.Froude > 0 ? r.Froude : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `T${rowNum}`, r.tipoFlujo, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `U${rowNum}`, r.Ymax > 0 ? r.Ymax : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `V${rowNum}`, r.chequeoYn, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `W${rowNum}`, r.fuerzaTractiva > 0 ? r.fuerzaTractiva : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `X${rowNum}`, r.chequeoFT, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    rowNum++;
  });

  // Blank row
  rowNum++;

  // --- Calculo de Vreal, Yreal, Rh real (stacked below) ---
  ws1.mergeCells(`A${rowNum}:G${rowNum}`);
  setCell(ws1, `A${rowNum}`, "C\u00c1LCULO DE Vreal, Yreal, Rh real", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);
  rowNum++;
  const hr = rowNum;
  ws1.mergeCells(`A${hr}:A${hr+1}`); setCell(ws1, `A${hr}`, "TRAMO", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells(`B${hr}:B${hr+1}`); setCell(ws1, `B${hr}`, "Q/Qo", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells(`C${hr}:C${hr+1}`); setCell(ws1, `C${hr}`, "V/Vo", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells(`D${hr}:D${hr+1}`); setCell(ws1, `D${hr}`, "Y/D", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells(`E${hr}:E${hr+1}`); setCell(ws1, `E${hr}`, "\u03b1", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells(`F${hr}:F${hr+1}`); setCell(ws1, `F${hr}`, "Rh/D", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws1.mergeCells(`G${hr}:G${hr+1}`); setCell(ws1, `G${hr}`, "Rh\nmm", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  rowNum += 2;

  results.forEach(r => {
    setCell(ws1, `A${rowNum}`, r.tramo, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `B${rowNum}`, r.qqo > 0 ? r.qqo : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `C${rowNum}`, r.v > 0 ? r.v : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `D${rowNum}`, r.y_D > 0 ? r.y_D : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `E${rowNum}`, r.alpha > 0 ? r.alpha : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `F${rowNum}`, r.Rh_D > 0 ? r.Rh_D : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    setCell(ws1, `G${rowNum}`, r.Rh > 0 ? r.Rh : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_THIN);
    rowNum++;
  });

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 2: Chequeo bajantes
  // ═══════════════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet("Chequeo bajantes");
  ensureSheetRows(ws2, 50);
  for (let i = 1; i <= 12; i++) ws2.getColumn(numToCol(i)).width = 10;
  ws2.getColumn("A").width = 11;
  ws2.getColumn("B").width = 9;
  ws2.getColumn("C").width = 10;

  writeHeader(ws2, proyecto, "L");

  ws2.mergeCells("A8:L9");
  setCell(ws2, "A8", "CHEQUEO CAPACIDAD BAJANTES AGUAS LLUVIAS", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);

  // Header row 10-12
  ws2.mergeCells("A10:A12"); setCell(ws2, "A10", "Bajante\n#", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("B10:C10"); setCell(ws2, "B10", "\u00c1REA (m\u00b2)", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("D10:D12"); setCell(ws2, "D10", "Intensidad\nPromedio\nmm/hr/m\u00b2", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("E10:E12"); setCell(ws2, "E10", "Coef. de\nEscorrent\u00eda\nC", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("F10:F12"); setCell(ws2, "F10", "R", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  ws2.mergeCells("G10:G12"); setCell(ws2, "G10", "Q = C\u00d7I\u00d7A\nLPS", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("H10:H12"); setCell(ws2, "H10", "Manning\nn", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("I10:J10"); setCell(ws2, "I10", "DI\u00c1METRO", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws2.mergeCells("K10:K12"); setCell(ws2, "K10", "Chequeo\nDcal<Dprop", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);

  setCell(ws2, "B11", "Parcial", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  setCell(ws2, "C11", "Acumulada", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  setCell(ws2, "I11", "Calculado", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  setCell(ws2, "J11", "Propuesto", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);

  const hdrUnits = ["B","C","D","E","G","H","I","J"];
  hdrUnits.forEach(c => setCell(ws2, `${c}12`, "", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN));

  let bRow = 13;
  bajantesLl.forEach(b => {
    const r = calcBajante(b);
    const Rstr = b.R || '7/24';
    setCell(ws2, `A${bRow}`, b.bajante || b.id, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `B${bRow}`, b.areaParcial || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `C${bRow}`, b.areaAcumulada || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `D${bRow}`, b.intensidad || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `E${bRow}`, b.coeficienteC || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `F${bRow}`, Rstr, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `G${bRow}`, r.Q > 0 ? r.Q : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `H${bRow}`, b.manning || 0.009, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `I${bRow}`, r.diamCalc > 0 ? r.diamCalc : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `J${bRow}`, b.diamPropuesto || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws2, `K${bRow}`, r.chequeo, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    bRow++;
  });

  // ═══════════════════════════════════════════════════════════════════════
  // HOJA 3: Chequeo canal
  // ═══════════════════════════════════════════════════════════════════════
  const ws3 = wb.addWorksheet("Chequeo canal");
  ensureSheetRows(ws3, 50);
  for (let i = 1; i <= 14; i++) ws3.getColumn(numToCol(i)).width = 10;
  ws3.getColumn("A").width = 12;
  ws3.getColumn("B").width = 9;
  ws3.getColumn("C").width = 10;

  writeHeader(ws3, proyecto, "N");

  ws3.mergeCells("A8:N9");
  setCell(ws3, "A8", "CHEQUEO CAPACIDAD CANAL CUBIERTA AGUAS LLUVIAS", FONT_TITLE_MED, "FFFFFFFF", ALIGN_C, null);

  // Header row 10-12
  ws3.mergeCells("A10:A12"); setCell(ws3, "A10", "Sector", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("B10:C10"); setCell(ws3, "B10", "\u00c1REA (m\u00b2)", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("D10:D12"); setCell(ws3, "D10", "Intensidad\nPromedio\nmm/hr/m\u00b2", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("E10:E12"); setCell(ws3, "E10", "Coef. de\nEscorrent\u00eda\nC", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("F10:F12"); setCell(ws3, "F10", "Q real\nLPS", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("G10:G12"); setCell(ws3, "G10", "Manning\nn", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("H10:H12"); setCell(ws3, "H10", "Pendiente\n(%)", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("I10:L10"); setCell(ws3, "I10", "SECCI\u00d3N PROPUESTA (cm)", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("M10:M12"); setCell(ws3, "M10", "Q max\nLPS", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);
  ws3.mergeCells("N10:N12"); setCell(ws3, "N10", "Chequeo\nQreal<Qmax", FONT_HDR, "FFD9D9D9", ALIGN_CW, BORDER_THIN);

  setCell(ws3, "B11", "Parcial", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  setCell(ws3, "C11", "Acumulada", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  setCell(ws3, "I11", "b", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  setCell(ws3, "J11", "h", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  setCell(ws3, "K11", "bl", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);
  setCell(ws3, "L11", "Total", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN);

  const canalUnits = ["B","C","D","E","F","G","H","I","J","K","L","M"];
  canalUnits.forEach(c => setCell(ws3, `${c}12`, "", FONT_HDR, "FFD9D9D9", ALIGN_C, BORDER_THIN));

  let cRow = 13;
  canalesLl.forEach(c => {
    const r = calcCanal(c);
    const b_cm = c.b || 0, h_cm = c.h || 0;
    const totalStr = b_cm > 0 || h_cm > 0 ? `${b_cm} x ${h_cm}` : '\u2014';
    setCell(ws3, `A${cRow}`, c.sector || c.id, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `B${cRow}`, c.areaParcial || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `C${cRow}`, c.areaAcumulada || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `D${cRow}`, c.intensidad || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `E${cRow}`, c.coeficienteC || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `F${cRow}`, r.Qreal > 0 ? r.Qreal : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `G${cRow}`, c.manning || 0.009, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `H${cRow}`, c.pendiente || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `I${cRow}`, b_cm > 0 ? b_cm : 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `J${cRow}`, h_cm > 0 ? h_cm : 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `K${cRow}`, c.bl || 0, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `L${cRow}`, totalStr, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `M${cRow}`, r.Qmax > 0 ? r.Qmax : '\u2014', FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    setCell(ws3, `N${cRow}`, r.chequeo, FONT_DATA, "FFFFFFFF", ALIGN_C, BORDER_HAIR);
    cRow++;
  });

  // ─── OUTPUT ────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  return { blob, nombreArchivo: (proyecto.nombre || "Proyecto").replace(/[^a-zA-Z0-9]/g, "_"), prefijo: "Calculo_Red_Lluvias" };
}
