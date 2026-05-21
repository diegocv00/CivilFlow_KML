import ExcelJS from "exceljs";
import { DIAM_OPTIONS } from "../components/constants";
import { calcUDparcial, calcUDacumulado } from "../components/utils";

const FONT_HDR = { name: "Calibri", size: 8, bold: true };
const FONT_TITLE = { name: "Calibri", size: 13, bold: true };
const FONT_SUBTITLE = { name: "Calibri", size: 11, bold: true };
const FONT_DATA = { name: "Calibri", size: 8 };
const FONT_DATA_BOLD = { name: "Calibri", size: 8, bold: true };
const FONT_HDR_LBL = { name: "Calibri", size: 9, bold: true, color: { argb: "FF4472C4" } };
const FONT_HDR_VAL = { name: "Calibri", size: 10, bold: true };
const FILL_WHITE = "FFFFFFFF";
const FILL_HDR = "FFD9D9D9";
const FILL_HDR2 = "FFD9D9D9";
const FILL_SUBHDR = "FFD6E4F7";
const ALIGN_C = { horizontal: "center", vertical: "middle" };
const ALIGN_CW = { horizontal: "center", vertical: "middle", wrapText: true };
const ALIGN_L = { horizontal: "left", vertical: "middle" };
const BORDER_THIN = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
const BORDER_HAIR = { top: { style: "hair" }, bottom: { style: "hair" }, left: { style: "thin" }, right: { style: "thin" } };

function ensureSheetRows(ws, upTo) {
  for (let i = 1; i <= upTo; i++) ws.getRow(i);
}

function numToCol(n) {
  let s = "";
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

function writeHeader(ws, proyecto, colCount) {
  const lastCol = numToCol(colCount);
  ws.mergeCells(`A1:D4`);
  setCell(ws, "A1", "LOGO", { name: "Calibri", size: 9, italic: true, color: { argb: "FFCCCCCC" } }, FILL_WHITE, ALIGN_C, { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } });
  setCell(ws, "E1", "Proyecto:", FONT_HDR_LBL, FILL_WHITE, ALIGN_L, null);
  setCell(ws, "F1", proyecto.nombre || "", FONT_HDR_VAL, FILL_WHITE, ALIGN_L, null);
  setCell(ws, "E2", "Diseñador:", FONT_HDR_LBL, FILL_WHITE, ALIGN_L, null);
  setCell(ws, "F2", proyecto.ingeniero || "", FONT_HDR_VAL, FILL_WHITE, ALIGN_L, null);
  setCell(ws, "E3", "Fecha:", FONT_HDR_LBL, FILL_WHITE, ALIGN_L, null);
  setCell(ws, "F3", new Date().toISOString().slice(0, 10), FONT_HDR_VAL, FILL_WHITE, ALIGN_L, null);
  for (let i = 1; i <= 4; i++) ws.getColumn(i).width = 10;
}

function calcTramoData(tramosSan, udBase) {
  const acumMap = calcUDacumulado(tramosSan, udBase);
  return tramosSan.map(t => {
    const udPropias = calcUDparcial(t, udBase);
    const descIds = (t.descripcion || "").split("+").map(s => s.trim()).filter(Boolean);
    const udOtros = descIds.reduce((s, id) => s + (acumMap[id] || 0), 0);
    const udAcum = udPropias + udOtros;
    const nSalidas = t.nSalidas || 2;
    const K = Math.round((nSalidas <= 1 ? 1 : 1 / Math.sqrt(nSalidas - 1)) * 100) / 100;
    const n = t.nmaning || 0.009;
    const sVal = t.sPercent || 2;
    const S = sVal / 100;
    const Q = udAcum > 0
      ? Math.round((udAcum < 240
        ? 0.1163 * Math.pow(udAcum, 0.6875)
        : 0.074 * Math.pow(udAcum, 0.7504)) * K * 1000) / 1000
      : 0;
    const dSel = DIAM_OPTIONS.find(d => d.pulg === (t.diamDisPulg || 0)) || null;
    const DdisPulg = dSel ? dSel.pulg : 0;
    const DintMm = dSel ? dSel.mm : 0;
    let DcalcPulg = 0, chequeoDiam = "—";
    let Qo = 0, Vo = 0, qqo = 0, Vreal = 0, chequeoV = "—";
    let Yc = 0, Yn = 0, Froude = 0, tipoFlujo = "—", Ymax = 0, chequeoYn = "—";
    let fuerzaTractiva = 0, chequeoFT = "—";
    const ramasConectadas = descIds.length > 0 ? descIds.join(" + ") : "—";
    if (Q > 0 && S > 0 && DintMm > 0) {
      DcalcPulg = Math.round(1.548 * Math.pow((n * Q / 1000 / Math.sqrt(S)), 3 / 8) * 1000 / 25.4 * 100) / 100;
      chequeoDiam = DcalcPulg <= DdisPulg ? "O.K." : "NO CUMPLE";
      Qo = Math.round(0.312 * Math.pow(DintMm / 1000, 8 / 3) * Math.sqrt(S) / n * 1000 * 100) / 100;
      Vo = Math.round(4 * Qo / 1000 / Math.PI / Math.pow(DintMm / 1000, 2) * 100) / 100;
      qqo = Qo > 0 ? Math.round(Q / Qo * 100) / 100 : 0;
      const q = Qo > 0 ? Q / Qo : 0;
      let v = 0, y_D = 0;
      if (q > 0) {
        v = q <= 0.06
          ? Math.pow(10, 0.029806 + 0.29095 * Math.log10(q))
          : q <= 0.26
            ? Math.pow(10, 0.013778 + 0.28597 * Math.log10(q))
            : Math.pow(10, 0.021763 + 0.289951 * Math.log10(q));
        y_D = q < 0.11
          ? 0.3827 + 0.0645 * Math.log(q)
          : q < 0.21
            ? 0.60025 + 0.15471 * Math.log(q)
            : 0.225 + 0.667 * q;
      }
      Vreal = Math.round(v * Vo * 100) / 100;
      chequeoV = (Vreal < 0.45 || Vreal > 4.0) ? "NO CUMPLE" : "O.K.";
      const alpha = 2 * Math.acos(1 - 2 * y_D);
      const Rh_D = 0.25 * (1 - Math.sin(alpha) / alpha);
      const Rh = Rh_D * DintMm;
      Yc = Math.round(0.296938082 * DintMm * 100) / 100;
      Yn = Math.round(y_D * DintMm * 100) / 100;
      Ymax = Math.round(DintMm * 0.75 * 100) / 100;
      chequeoYn = Math.max(Yc, Yn) < Ymax ? "O.K." : "NO CUMPLE";
      Froude = Math.round(Vreal / Math.sqrt(9.806 * Rh / 1000) * 100) / 100;
      tipoFlujo = Froude > 1.1 ? "Supercrítico" : Froude < 0.9 ? "Subcrítico" : "Crítico";
      fuerzaTractiva = Math.round(1000 * Rh / 1000 * S * 100) / 100;
      chequeoFT = fuerzaTractiva > 0.15 ? "O.K." : "NO CUMPLE";
    }
    return {
      tramo: t.id, piso: t.piso,
      udPropias, udOtros, ramasConectadas, udAcum,
      nSalidas, K, Q, n, sVal,
      DcalcPulg, DdisPulg, DintMm, chequeoDiam,
      Qo, Vo, qqo, Vreal, chequeoV,
      Yc, Yn, Froude, tipoFlujo, Ymax, chequeoYn,
      fuerzaTractiva, chequeoFT, DintMm_orig: DintMm, S,
    };
  });
}

function calcHidraulicoData(tramosSan, udBase) {
  const acumMap = calcUDacumulado(tramosSan, udBase);
  return tramosSan.map(t => {
    const udPropias = calcUDparcial(t, udBase);
    const descIds = (t.descripcion || "").split("+").map(s => s.trim()).filter(Boolean);
    const udOtros = descIds.reduce((s, id) => s + (acumMap[id] || 0), 0);
    const udAcum = udPropias + udOtros;
    const nSalidas = t.nSalidas || 2;
    const K = Math.round((nSalidas <= 1 ? 1 : 1 / Math.sqrt(nSalidas - 1)) * 100) / 100;
    const n = t.nmaning || 0.009;
    const sVal = t.sPercent || 2;
    const S = sVal / 100;
    const Q = udAcum > 0
      ? Math.round((udAcum < 240
        ? 0.1163 * Math.pow(udAcum, 0.6875)
        : 0.074 * Math.pow(udAcum, 0.7504)) * K * 1000) / 1000
      : 0;
    const dSel = DIAM_OPTIONS.find(d => d.pulg === (t.diamDisPulg || 0)) || null;
    const DintMm = dSel ? dSel.mm : 0;
    let qqo = 0, v = 0, y_D = 0, alpha = 0, Rh_D = 0, Rh = 0;
    if (Q > 0 && S > 0 && DintMm > 0) {
      const Qo = Math.round(0.312 * Math.pow(DintMm / 1000, 8 / 3) * Math.sqrt(S) / n * 1000 * 100) / 100;
      const q = Q / Qo;
      qqo = Math.round(q * 100) / 100;
      v = q <= 0.06
        ? Math.pow(10, 0.029806 + 0.29095 * Math.log10(q))
        : q <= 0.26
          ? Math.pow(10, 0.013778 + 0.28597 * Math.log10(q))
          : Math.pow(10, 0.021763 + 0.289951 * Math.log10(q));
      y_D = q < 0.11
        ? 0.3827 + 0.0645 * Math.log(q)
        : q < 0.21
          ? 0.60025 + 0.15471 * Math.log(q)
          : 0.225 + 0.667 * q;
      alpha = 2 * Math.acos(1 - 2 * y_D);
      Rh_D = 0.25 * (1 - Math.sin(alpha) / alpha);
      Rh = Rh_D * DintMm;
    }
    return {
      tramo: t.id, qqo, v, y_D, alpha, Rh_D, Rh,
    };
  });
}

function calcBajanteData(tramosSan, udBase) {
  const DIAM_BAN = [
    { pulg: 1.5, mm: 42.68, nom: '1½"' },
    { pulg: 2, mm: 54.48, nom: '2"' },
    { pulg: 3, mm: 76.20, nom: '3"' },
    { pulg: 4, mm: 107.70, nom: '4"' },
    { pulg: 6, mm: 160.04, nom: '6"' },
    { pulg: 8, mm: 213.20, nom: '8"' },
  ];
  const DIAM_VENT = [
    { pulg: 1.5, mm: 42.68, nom: '1½"' },
    { pulg: 2, mm: 54.48, nom: '2"' },
    { pulg: 3, mm: 76.20, nom: '3"' },
    { pulg: 4, mm: 107.70, nom: '4"' },
    { pulg: 6, mm: 160.04, nom: '6"' },
  ];
  const acumMapALL = calcUDacumulado(tramosSan, udBase);
  const banTramos = tramosSan.filter(t => t.esBajante);
  return banTramos.map(t => {
    const rVal = t.bajR !== undefined ? t.bajR : (7 / 24);
    const udParcial = calcUDparcial(t, udBase);
    const udOtros = (t.recibeDe || []).reduce((s, id) => s + (acumMapALL[id] || 0), 0);
    const udAcum = udParcial + udOtros;
    const n = t.nmaning !== undefined ? t.nmaning : 0.009;
    const Q = udAcum > 0 ? 0.1163 * Math.pow(udAcum, 0.6875) : 0;
    const DcalcMm = Q > 0 ? Math.pow(Q / (1.754 * Math.pow(rVal, 5 / 3)), 3 / 8) * 25.4 : 0;
    const DcalcPulg = DcalcMm / 25.4;
    const Dprop = DIAM_BAN.find(d => Number(d.pulg) === Number(t.bajDprop)) || null;
    const DpropPulg = Dprop ? Dprop.pulg : 0;
    const DpropMm = Dprop ? Dprop.mm : 0;
    const chequeo = (DcalcMm > 0 && DpropPulg > 0) ? (DcalcPulg <= DpropPulg ? "O.K." : "NO CUMPLE") : "—";
    const QmaxB = DpropPulg > 0 ? 1.754 * Math.pow(rVal, 5 / 3) * Math.pow(DpropPulg, 8 / 3) : 0;
    const Vt = Math.round((DpropPulg > 0 && Q > 0 ? 2.76 * Math.pow(Q / DpropPulg, 0.4) : 0) * 100) / 100;
    const Ltcalc = Vt > 0 ? 0.17 * Vt * Vt : 0;
    const Ltmin = DpropPulg > 0 ? Math.max(Ltcalc, 10 * DpropPulg * 2.54 / 100) : 0;
    const fDarcy = t.bajFDarcy !== undefined ? t.bajFDarcy : 0.025;
    const Vair = Vt;
    const Qair = DpropPulg > 0 ? 1000 * Vair * (17 / 24) * (Math.PI / 4) * Math.pow(DpropPulg * 2.54 / 100, 2) : 0;
    const Lbaj = t.bajLong || 3;
    const DventPulgRaw = (Lbaj > 0 && Qair > 0) ? Math.pow((Lbaj * fDarcy * Qair * Qair) / 3.25, 1 / 5) : 0;
    const DventMm = DventPulgRaw * 25.4;
    const DventCalcPulg = DventMm / 25.4;
    const DventProp = DIAM_VENT.find(d => Number(d.pulg) === Number(t.ventDprop)) || null;
    const DventPropPulg = DventProp ? DventProp.pulg : 0;
    const pisoStr = `${t.pisoDesde !== undefined ? t.pisoDesde : (t.piso || 1)}-${t.pisoHasta !== undefined ? t.pisoHasta : 1}`;
    return {
      bajante: t.id, piso: pisoStr,
      udParcial, udAcum, r: rVal, Q, n,
      DcalcPulg: parseFloat(DcalcPulg.toFixed(2)),
      DpropPulg, DpropMm, chequeo,
      QmaxB: parseFloat(QmaxB.toFixed(2)),
      Vt, Ltcalc: parseFloat(Ltcalc.toFixed(2)), Ltmin: parseFloat(Ltmin.toFixed(2)),
      Vair: parseFloat(Vair.toFixed(2)), fDarcy, Qair: parseFloat(Qair.toFixed(2)),
      Lbaj, DventCalcPulg: parseFloat(DventCalcPulg.toFixed(2)), DventPropPulg,
    };
  });
}

export async function generarExcelRedSanitaria({ proyecto, tramosSan, pisos, udBase }) {
  console.log("Iniciando generación Excel Red Sanitaria...");

  const wb = new ExcelJS.Workbook();
  wb.creator = proyecto.ingeniero || "Ing. Camilo Cárdenas Chacón";

  const disenoData = calcTramoData(tramosSan, udBase);
  const hidraulicoData = calcHidraulicoData(tramosSan, udBase);
  const bajanteData = calcBajanteData(tramosSan, udBase);
  const udMap = calcUDacumulado(tramosSan, udBase);

  // ════════════════════════════════════════════════════
  // SHEET 1: Cálculo UD
  // ════════════════════════════════════════════════════
  const ws3 = wb.addWorksheet("Cálculo UD");
  ensureSheetRows(ws3, 50);
  const numAparatos = udBase.length;
  const totalUdCols = 2 + numAparatos + 2 + 1;
  writeHeader(ws3, proyecto, totalUdCols);

  const udHdrRow = 6;
  const lastCol3 = numToCol(totalUdCols);

  ws3.mergeCells(`A${udHdrRow}:${lastCol3}${udHdrRow}`);
  setCell(ws3, `A${udHdrRow}`, "CÁLCULO UNIDADES DE DESCARGA", FONT_TITLE, FILL_WHITE, ALIGN_C, null);

  // Header rows
  const u1 = udHdrRow + 1, u2 = u1 + 1, u3 = u2 + 1;
  ws3.mergeCells(`A${u1}:A${u3}`);
  ws3.mergeCells(`B${u1}:B${u3}`);
  const aparatoStartCol = 3;
  const aparatoEndCol = aparatoStartCol + numAparatos - 1;
  const aparatoStartRef = numToCol(aparatoStartCol);
  const aparatoEndRef = numToCol(aparatoEndCol);
  ws3.mergeCells(`${aparatoStartRef}${u1}:${aparatoEndRef}${u1}`);
  const udParcialCol = aparatoEndCol + 1;
  const udAcumCol = aparatoEndCol + 2;
  const bajanteCol = aparatoEndCol + 3;
  ws3.mergeCells(`${numToCol(udParcialCol)}${u1}:${numToCol(udAcumCol)}${u1}`);
  ws3.mergeCells(`${numToCol(udParcialCol)}${u2}:${numToCol(udParcialCol)}${u3}`);
  ws3.mergeCells(`${numToCol(udAcumCol)}${u2}:${numToCol(udAcumCol)}${u3}`);
  ws3.mergeCells(`${numToCol(bajanteCol)}${u1}:${numToCol(bajanteCol)}${u3}`);
  ws3.mergeCells(`${aparatoStartRef}${u3}:${aparatoEndRef}${u3}`);

  const uh = (r, c, val, fill) => setCell(ws3, `${numToCol(c)}${r}`, val, FONT_HDR, fill || FILL_HDR, ALIGN_CW, BORDER_THIN);
  uh(u1, 1, "Tramo"); uh(u1, 2, "Piso");
  uh(u1, aparatoStartCol, "APARATOS", FILL_HDR2);
  uh(u1, udParcialCol, "Unidades de\nDescarga");
  uh(u1, bajanteCol, "Bajante");

  udBase.forEach((d, i) => {
    uh(u2, aparatoStartCol + i, `${d.nombre}\n(${d.ud} UD)`);
  });
  uh(u2, udParcialCol, "Parcial"); uh(u2, udAcumCol, "Acum.");
  uh(u3, aparatoStartCol, "Cant.");

  // Set header row heights for proper display of multiline headers
  ws3.getRow(u1).height = 30;
  ws3.getRow(u2).height = 30;
  ws3.getRow(u3).height = 20;

  // Data rows
  let udr = u3 + 1;
  tramosSan.forEach(t => {
    const parcial = calcUDparcial(t, udBase);
    const acum = udMap[t.id] || 0;
    setCell(ws3, `${numToCol(1)}${udr}`, t.id, FONT_DATA, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    setCell(ws3, `${numToCol(2)}${udr}`, t.piso, FONT_DATA, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    udBase.forEach((d, i) => {
      setCell(ws3, `${numToCol(aparatoStartCol + i)}${udr}`, t.fixtures[d.id] || 0, FONT_DATA, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    });
    setCell(ws3, `${numToCol(udParcialCol)}${udr}`, parcial, FONT_DATA_BOLD, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    setCell(ws3, `${numToCol(udAcumCol)}${udr}`, acum, FONT_DATA_BOLD, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    setCell(ws3, `${numToCol(bajanteCol)}${udr}`, t.esBajante ? "Sí" : "No", FONT_DATA, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    udr++;
  });

  // Column widths
  const ws3Cols = [`A=10`, `B=6`];
  udBase.forEach((d, i) => {
    ws3Cols.push(`${numToCol(aparatoStartCol + i)}=8`);
  });
  ws3Cols.push(`${numToCol(udParcialCol)}=8`);
  ws3Cols.push(`${numToCol(udAcumCol)}=8`);
  ws3Cols.push(`${numToCol(bajanteCol)}=8`);
  ws3Cols.forEach(s => { const [c, w] = s.split("="); ws3.getColumn(c).width = parseFloat(w); });

  // ════════════════════════════════════════════════════
  // SHEET 2: Red Sanitaria
  // ════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet("Red Sanitaria");
  ensureSheetRows(ws1, 100);
  writeHeader(ws1, proyecto, 27);

  const hdrRow = 6;
  const lastCol = numToCol(27);

  // --- TITLE: Diseño Red Sanitaria ---
  ws1.mergeCells(`A${hdrRow}:${lastCol}${hdrRow}`);
  setCell(ws1, `A${hdrRow}`, "DISEÑO RED SANITARIA", FONT_TITLE, FILL_WHITE, ALIGN_C, null);

  // --- HEADER ROW 1 (groups) ---
  const r1 = hdrRow + 1;
  const r2 = r1 + 1;
  const r3 = r2 + 1;
  const r4 = r3 + 1;
  ws1.mergeCells(`A${r1}:A${r4}`);
  ws1.mergeCells(`B${r1}:B${r4}`);
  ws1.mergeCells(`C${r1}:F${r1}`);
  ws1.mergeCells(`C${r2}:C${r4}`);
  ws1.mergeCells(`D${r2}:E${r3}`);
  ws1.mergeCells(`F${r2}:F${r4}`);
  ws1.mergeCells(`G${r1}:G${r4}`);
  ws1.mergeCells(`H${r1}:H${r4}`);
  ws1.mergeCells(`I${r1}:I${r4}`);
  ws1.mergeCells(`J${r1}:J${r4}`);
  ws1.mergeCells(`K${r1}:K${r4}`);
  ws1.mergeCells(`L${r1}:N${r1}`);
  ws1.mergeCells(`L${r2}:L${r4}`);
  ws1.mergeCells(`M${r2}:M${r4}`);
  ws1.mergeCells(`N${r2}:N${r4}`);
  ws1.mergeCells(`O${r1}:O${r4}`);
  ws1.mergeCells(`P${r1}:P${r4}`);
  ws1.mergeCells(`Q${r1}:Q${r4}`);
  ws1.mergeCells(`R${r1}:R${r4}`);
  ws1.mergeCells(`S${r1}:S${r4}`);
  ws1.mergeCells(`T${r1}:T${r4}`);
  ws1.mergeCells(`U${r1}:U${r4}`);
  ws1.mergeCells(`V${r1}:V${r4}`);
  ws1.mergeCells(`W${r1}:W${r4}`);
  ws1.mergeCells(`X${r1}:X${r4}`);
  ws1.mergeCells(`Y${r1}:Y${r4}`);
  ws1.mergeCells(`Z${r1}:AA${r1}`);
  ws1.mergeCells(`Z${r2}:Z${r4}`);
  ws1.mergeCells(`AA${r2}:AA${r4}`);

  const hdr = (ref, val, fill) => setCell(ws1, ref, val, FONT_HDR, fill || FILL_HDR, ALIGN_CW, BORDER_THIN);
  hdr(`A${r1}`, "Tramo\no Ramal"); hdr(`B${r1}`, "Piso");
  hdr(`C${r1}`, "UNIDADES DE DESCARGA"); hdr(`C${r2}`, "Propias");
  hdr(`D${r2}`, "Otros\nRamales");
  hdr(`F${r2}`, "Total");
  hdr(`G${r1}`, "No.\nSalidas"); hdr(`H${r1}`, "Coef.\nK");
  hdr(`I${r1}`, "Q\nLPS", FILL_HDR2); hdr(`J${r1}`, "Maning\nn");
  hdr(`K${r1}`, "S\n%", FILL_HDR2);
  hdr(`L${r1}`, "Diámetro"); hdr(`L${r2}`, "Calc.\npulg"); hdr(`M${r2}`, "Diseño\npulg", FILL_HDR2); hdr(`N${r2}`, "Interno\nmm");
  hdr(`O${r1}`, "Qo\nLPS"); hdr(`P${r1}`, "Vo\nm/s");
  hdr(`Q${r1}`, "Q/Qo", FILL_HDR2); hdr(`R${r1}`, "Vreal\nm/s", FILL_HDR2);
  hdr(`S${r1}`, "Chequeo\n0.45<Vr<4.0"); hdr(`T${r1}`, "Yc\nmm");
  hdr(`U${r1}`, "Yn\nmm"); hdr(`V${r1}`, "Froude");
  hdr(`W${r1}`, "Tipo de\nFlujo"); hdr(`X${r1}`, "Ymax=\n0.75D mm");
  hdr(`Y${r1}`, "Yn vs\nYc");
  hdr(`Z${r1}`, "Fuerza Tractiva", FILL_HDR2);
  hdr(`Z${r2}`, "Vr\nkg/m2"); hdr(`AA${r2}`, ">0.15");

  // Row 4: units (only columns not fully merged r1:r4)
  hdr(`D${r4}`, "UD"); hdr(`E${r4}`, "ID");

  // Set header row heights for proper display of multiline headers
  ws1.getRow(r1).height = 36;
  ws1.getRow(r2).height = 30;
  ws1.getRow(r3).height = 30;
  ws1.getRow(r4).height = 18;

  // Data rows
  let dr = r4 + 1;
  disenoData.forEach(d => {
    setRow(ws1, dr, [
      d.tramo, "",
      d.udPropias, d.udOtros, d.ramasConectadas, d.udAcum,
      d.nSalidas, d.K, d.Q, d.n, d.sVal,
      d.DcalcPulg > 0 ? d.DcalcPulg : "—",
      d.DdisPulg > 0 ? d.DdisPulg : "—",
      d.DintMm > 0 ? d.DintMm : "—",
      d.Qo > 0 ? d.Qo : "—",
      d.Vo > 0 ? d.Vo : "—",
      d.qqo > 0 ? d.qqo : "—",
      d.Vreal > 0 ? d.Vreal : "—",
      d.chequeoV,
      d.Yc > 0 ? d.Yc : "—",
      d.Yn > 0 ? d.Yn : "—",
      d.Froude > 0 ? d.Froude : "—",
      d.tipoFlujo,
      d.Ymax > 0 ? d.Ymax : "—",
      d.chequeoYn,
      d.fuerzaTractiva > 0 ? d.fuerzaTractiva : "—",
      d.chequeoFT,
    ], FONT_DATA, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    setCell(ws1, `B${dr}`, d.piso, FONT_DATA, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    dr++;
  });

  // --- SECTION: Cálculo de Vreal, Y real, Rh real ---
  dr += 1;
  const vrTitleRow = dr;
  ws1.mergeCells(`A${dr}:G${dr}`);
  setCell(ws1, `A${dr}`, "CÁLCULO DE Vreal, Y real, Rh real", FONT_SUBTITLE, FILL_WHITE, ALIGN_L, null);
  dr++;
  const vrHdrRow = dr;
  const vrHdrRow2 = dr + 1;
  ws1.mergeCells(`A${vrHdrRow}:A${vrHdrRow2}`);
  ws1.mergeCells(`B${vrHdrRow}:B${vrHdrRow2}`);
  ws1.mergeCells(`C${vrHdrRow}:C${vrHdrRow2}`);
  ws1.mergeCells(`D${vrHdrRow}:D${vrHdrRow2}`);
  ws1.mergeCells(`E${vrHdrRow}:E${vrHdrRow2}`);
  ws1.mergeCells(`F${vrHdrRow}:F${vrHdrRow2}`);
  ws1.mergeCells(`G${vrHdrRow}:G${vrHdrRow2}`);
  hdr(`A${vrHdrRow}`, "Tramo"); hdr(`B${vrHdrRow}`, "Q/Q0");
  hdr(`C${vrHdrRow}`, "V/Vo"); hdr(`D${vrHdrRow}`, "Y/D");
  hdr(`E${vrHdrRow}`, "α", FILL_HDR2); hdr(`F${vrHdrRow}`, "Rh/D");
  hdr(`G${vrHdrRow}`, "Rh\nmm");
  dr = vrHdrRow2 + 1;
  hidraulicoData.forEach(h => {
    setRow(ws1, dr, [
      h.tramo,
      h.qqo > 0 ? h.qqo : "—",
      h.v > 0 ? h.v : "—",
      h.y_D > 0 ? h.y_D : "—",
      h.alpha > 0 ? h.alpha : "—",
      h.Rh_D > 0 ? h.Rh_D : "—",
      h.Rh > 0 ? h.Rh : "—",
    ], FONT_DATA, FILL_WHITE, ALIGN_C, BORDER_HAIR);
    dr++;
  });

  // Set column widths for sheet 1
  const ws1Cols = ["A=10", "B=8", "C=8", "D=8", "E=14", "F=8", "G=7", "H=7", "I=7", "J=7", "K=6", "L=8", "M=8", "N=8", "O=7", "P=7", "Q=7", "R=7", "S=12", "T=7", "U=7", "V=7", "W=10", "X=10", "Y=8", "Z=8", "AA=7"];
  ws1Cols.forEach(s => { const [c, w] = s.split("="); ws1.getColumn(c).width = parseFloat(w); });

  // ════════════════════════════════════════════════════
  // SHEET 3: Bajantes A.N. y Ventilación
  // ════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet("Bajantes A.N. y Ventilación");
  ensureSheetRows(ws2, 50);
  writeHeader(ws2, proyecto, 20);

  const hdrRow2 = 6;
  const lastCol2 = numToCol(20);

  ws2.mergeCells(`A${hdrRow2}:${lastCol2}${hdrRow2}`);
  setCell(ws2, `A${hdrRow2}`, "BAJANTES A.N. Y VENTILACIÓN", FONT_TITLE, FILL_WHITE, ALIGN_C, null);

  // Header group rows
  const b1 = hdrRow2 + 1, b2 = b1 + 1, b3 = b2 + 1, b4 = b3 + 1;
  // Group headers (row b1 only - horizontal spans must not overlap with vertical merges)
  ws2.mergeCells(`A${b1}:G${b1}`);
  ws2.mergeCells(`H${b1}:R${b1}`);
  ws2.mergeCells(`S${b1}:T${b1}`);
  // Column headers (rows b2-b4)
  ws2.mergeCells(`A${b2}:A${b4}`);
  ws2.mergeCells(`B${b2}:B${b4}`);
  ws2.mergeCells(`C${b2}:D${b2}`);
  ws2.mergeCells(`E${b2}:E${b4}`);
  ws2.mergeCells(`F${b2}:F${b4}`);
  ws2.mergeCells(`G${b2}:G${b4}`);
  ws2.mergeCells(`H${b2}:H${b4}`);
  ws2.mergeCells(`I${b2}:I${b4}`);
  ws2.mergeCells(`J${b2}:J${b4}`);
  ws2.mergeCells(`K${b2}:K${b4}`);
  ws2.mergeCells(`L${b2}:L${b4}`);
  ws2.mergeCells(`M${b2}:N${b2}`);
  ws2.mergeCells(`O${b2}:O${b4}`);
  ws2.mergeCells(`P${b2}:P${b4}`);
  ws2.mergeCells(`Q${b2}:Q${b4}`);
  ws2.mergeCells(`R${b2}:R${b4}`);
  ws2.mergeCells(`S${b2}:S${b4}`);
  ws2.mergeCells(`T${b2}:T${b4}`);

  const h2 = (ref, val, fill) => setCell(ws2, ref, val, FONT_HDR, fill || FILL_HDR, ALIGN_CW, BORDER_THIN);
  h2(`A${b1}`, "INFORMACIÓN COMÚN", FILL_HDR2);
  h2(`H${b1}`, "BAJANTES A.N.", FILL_HDR2);
  h2(`S${b1}`, "VENTILACIÓN", FILL_HDR2);

  h2(`A${b2}`, "Bajante\nNo."); h2(`B${b2}`, "Piso");
  h2(`C${b2}`, "Unidades de\nDescarga"); h2(`E${b2}`, "r");
  h2(`F${b2}`, "Q\nlps"); h2(`G${b2}`, "Maning\nn");
  h2(`H${b2}`, "Diametro\nCalculado\nPulg.");
  h2(`I${b2}`, "Diametro\nPropuesto\nPulg.");
  h2(`J${b2}`, "Chequeo\nDcal<Dprop"); h2(`K${b2}`, "Q max\nBajante\nlps");
  h2(`L${b2}`, "V.\nTerminal\nm/s");
  h2(`M${b2}`, "Longitud\nTerminal (m)"); h2(`O${b2}`, "V.\nAire\nm/s");
  h2(`P${b2}`, "ƒ\nDarcy"); h2(`Q${b2}`, "Q aire\nlps");
  h2(`R${b2}`, "L.\nbajante\nm"); h2(`S${b2}`, "D Vent\nCalculado\nPulg.");
  h2(`T${b2}`, "D Vent\nPropuesto\nPulg.");

  h2(`C${b3}`, "Parcial"); h2(`D${b3}`, "Acum.");
  h2(`M${b3}`, "calculada"); h2(`N${b3}`, "Minima");
  // Units (only columns not vertically merged b2:b4)
  h2(`C${b4}`, "UD"); h2(`D${b4}`, "UD");
  h2(`M${b4}`, "m"); h2(`N${b4}`, "m");

  // Set header row heights for proper display of multiline headers
  ws2.getRow(b1).height = 20;
  ws2.getRow(b2).height = 42;
  ws2.getRow(b3).height = 18;
  ws2.getRow(b4).height = 18;

  // Data rows
  let bd = b4 + 1;
  if (bajanteData.length === 0) {
    ws2.mergeCells(`A${bd}:T${bd}`);
    setCell(ws2, `A${bd}`, "No hay bajantes definidos. Marque un tramo como 'Bajante' en la tabla de Cálculo UD.", FONT_DATA, FILL_WHITE, ALIGN_C, null);
    bd++;
  } else {
    bajanteData.forEach(b => {
      setRow(ws2, bd, [
        b.bajante, b.piso,
        b.udParcial, b.udAcum,
        b.r === 7 / 24 ? "7/24" : "1/4",
        b.Q > 0 ? b.Q.toFixed(3) : "—",
        b.n,
        b.DcalcPulg > 0 ? b.DcalcPulg : "—",
        b.DpropPulg > 0 ? b.DpropPulg : "—",
        b.chequeo,
        b.QmaxB > 0 ? b.QmaxB : "—",
        b.Vt > 0 ? b.Vt : "—",
        b.Ltcalc > 0 ? b.Ltcalc : "—",
        b.Ltmin > 0 ? b.Ltmin : "—",
        b.Vair > 0 ? b.Vair : "—",
        b.fDarcy,
        b.Qair > 0 ? b.Qair : "—",
        b.Lbaj,
        b.DventCalcPulg > 0 ? b.DventCalcPulg : "—",
        b.DventPropPulg > 0 ? b.DventPropPulg : "—",
      ], FONT_DATA, FILL_WHITE, ALIGN_C, BORDER_HAIR);
      bd++;
    });
  }

  // Column widths
  const ws2Cols = ["A=8", "B=8", "C=7", "D=7", "E=5", "F=7", "G=6", "H=8", "I=7", "J=10", "K=8", "L=7", "M=8", "N=8", "O=7", "P=5", "Q=7", "R=7", "S=9", "T=7"];
  ws2Cols.forEach(s => { const [c, w] = s.split("="); ws2.getColumn(c).width = parseFloat(w); });

  // (Cálculo UD is now SHEET 1 above)

  // ─── GENERATE FILE ───
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const nombreArchivo = proyecto.nombre ? proyecto.nombre.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "").trim() : "Proyecto";
  return { blob, nombreArchivo, prefijo: "Calculo_Red_Sanitaria" };
}
