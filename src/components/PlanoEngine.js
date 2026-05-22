export const NETS = [
  { id: 'af', lbl: 'RAF', col: '#4D8FF7', ucType: 'uc', bmType: 'montante', bmPfx: 'MAF', bmIco: '⬆' },
  { id: 'ac', lbl: 'RAC', col: '#F04545', ucType: 'uc', bmType: 'montante', bmPfx: 'MAC', bmIco: '⬆' },
  { id: 'san', lbl: 'RS', col: '#F5A623', ucType: 'ud', bmType: 'bajante', bmPfx: 'BAN', bmIco: '⬇' },
  { id: 'll', lbl: 'RALL', col: '#22D3EE', ucType: null, bmType: 'bajante', bmPfx: 'BALL', bmIco: '⬇' },
  { id: 'gas', lbl: 'RG', col: '#A855F7', ucType: null, bmType: 'montante', bmPfx: 'MG', bmIco: '⬆' },
  { id: 'ven', lbl: 'RV', col: '#10B981', ucType: 'ud', bmType: 'montante', bmPfx: 'MV', bmIco: '⬆' },
];

export default class PlanoEngine {
  constructor(cw, pdfWrap, canv) {
    this.cw = cw;
    this.pdfWrap = pdfWrap;
    this.canv = canv;
    this.ctx = canv.getContext('2d');

    this.zoom = 1;
    this.offX = 0;
    this.offY = 0;
    this.tool = 'sel';
    this.activeNet = 'af';
    this.tipoTramo = 'ramal';
    this.snapMode = true;
    this.scaleM = 0.5;
    this.pageW = 0;
    this.pageH = 0;

    this.ramales = [];
    this.dims = [];
    this.textAnnots = [];
    this.bajantes = [];
    this.activeRamal = null;
    this.selId = null;
    this.panning = false;
    this.panX0 = 0;
    this.panY0 = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.ghostDrag = null;
    this.lblDrag = null;
    this.txtDrag = null;
    this.bajDrag = null;
    this._dimStart = null;
    this.nivelActual = null;
    this.nptLevels = [];

    this._netCounts = {};
    NETS.forEach(n => { this._netCounts[n.id] = { ramal: 0, tributario: 0 }; });

    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this._onDblClick = this._onDblClick.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    this.canv.addEventListener('mousedown', this._onDown);
    this.canv.addEventListener('mousemove', this._onMove);
    this.canv.addEventListener('mouseup', this._onUp);
    this.canv.addEventListener('mouseleave', this._onUp);
    this.canv.addEventListener('dblclick', this._onDblClick);
    this.canv.addEventListener('wheel', this._onWheel, { passive: false });
    this.canv.addEventListener('touchstart', this._wrapTouch(this._onDown), { passive: false });
    this.canv.addEventListener('touchmove', this._wrapTouch(this._onMove), { passive: false });
    this.canv.addEventListener('touchend', (e) => { e.preventDefault(); this._onUp(e); }, { passive: false });
    document.addEventListener('keydown', this._onKeyDown);

    this._onSelectCb = null;
    this._onStatusCb = null;
  }

  onSelect(cb) { this._onSelectCb = cb; }
  onStatus(cb) { this._onStatusCb = cb; }

  destroy() {
    this.canv.removeEventListener('mousedown', this._onDown);
    this.canv.removeEventListener('mousemove', this._onMove);
    this.canv.removeEventListener('mouseup', this._onUp);
    this.canv.removeEventListener('mouseleave', this._onUp);
    this.canv.removeEventListener('dblclick', this._onDblClick);
    this.canv.removeEventListener('wheel', this._onWheel);
    document.removeEventListener('keydown', this._onKeyDown);
  }

  setPageSize(w, h) {
    this.pageW = w;
    this.pageH = h;
  }

  resizeCanvas(w, h) {
    this.canv.width = w;
    this.canv.height = h;
    this.render();
  }

  _wrapTouch(fn) {
    return (e) => { e.preventDefault(); fn(e); };
  }

  _getPos(e) {
    const r = this.canv.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }

  toCvs(px, py) { return { x: px * this.zoom + this.offX, y: py * this.zoom + this.offY }; }
  toPlane(cx, cy) { return { x: (cx - this.offX) / this.zoom, y: (cy - this.offY) / this.zoom }; }
  pxToM(px) { return +(px / 96 * 2.54 * this.scaleM).toFixed(3); }

  _emitStatus(msg) {
    if (this._onStatusCb) this._onStatusCb(msg);
  }

  _emitSelect(el) {
    if (this._onSelectCb) this._onSelectCb(el);
  }

  setTool(t) {
    if (this.activeRamal && this.activeRamal.pts.length >= 2 && t !== 'line') this.finishRamal();
    else if (this.activeRamal && t !== 'line') this.cancelRamal();
    if (t !== 'dim') this._dimStart = null;
    this.tool = t;
    this.canv.style.cursor = t === 'pan' ? 'grab' : t === 'sel' ? 'default' : 'crosshair';
    this._emitStatus(this._statusMsg());
  }

  setActiveNet(id) { this.activeNet = id; }
  setTipoTramo(t) { this.tipoTramo = t; }
  setSnap(v) { this.snapMode = v; }
  setScaleM(v) {
    this.scaleM = parseFloat(v) || 0.5;
    this.ramales.forEach(r => {
      r.totalL = 0;
      for (let i = 0; i < r.pts.length - 1; i++) {
        const [x1, y1] = r.pts[i], [x2, y2] = r.pts[i + 1];
        r.totalL += this.pxToM(Math.hypot(x2 - x1, y2 - y1));
      }
      r.totalL = +r.totalL.toFixed(3);
    });
    this.render();
  }

  _statusMsg() {
    const names = { sel: 'Seleccionar', line: 'Ramal', dim: 'Cota', text: 'Texto', baj: 'Bajante', pan: 'Pan' };
    let m = names[this.tool] || this.tool;
    if (this.tool === 'line') {
      const net = NETS.find(n => n.id === this.activeNet);
      m += ` — ${net ? net.lbl : ''} [${this.tipoTramo}]`;
      if (this.activeRamal) m += ` (${this.activeRamal.pts.length} pts, ${this.activeRamal.totalL}m)`;
    }
    return m;
  }

  snapAngle(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) return { x: x1, y: y1 };
    const deg = Math.atan2(dy, dx) * 180 / Math.PI;
    const allowed = [0, 45, 90, 135, 180, -135, -90, -45];
    let best = 0, minDiff = 999;
    allowed.forEach(a => {
      const diff = Math.abs(((deg - a) + 540) % 360 - 180);
      if (diff < minDiff) { minDiff = diff; best = a; }
    });
    const sr = best * Math.PI / 180;
    return { x: x0 + dist * Math.cos(sr), y: y0 + dist * Math.sin(sr) };
  }

  snapToExisting(x, y) {
    const THRESH = 16 / this.zoom;
    let best = null, minD = THRESH;
    this.ramales.forEach(r => {
      r.pts.forEach(([rx, ry]) => {
        const d = Math.hypot(x - rx, y - ry);
        if (d < minD) { minD = d; best = { x: rx, y: ry }; }
      });
      for (let i = 0; i < r.pts.length - 1; i++) {
        const [x1, y1] = r.pts[i], [x2, y2] = r.pts[i + 1];
        const ddx = x2 - x1, ddy = y2 - y1, len2 = ddx * ddx + ddy * ddy;
        if (len2 < 1) continue;
        const t = Math.max(0, Math.min(1, ((x - x1) * ddx + (y - y1) * ddy) / len2));
        const px = x1 + t * ddx, py = y1 + t * ddy;
        const d = Math.hypot(x - px, y - py);
        if (d < minD) { minD = d; best = { x: px, y: py }; }
      }
    });
    return best;
  }

  selectAt(cx, cy) {
    let foundTxt = null;
    this.textAnnots.forEach(t => {
      if (t._box) {
        const b = t._box;
        if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) foundTxt = t;
      }
    });
    if (foundTxt) { this.selId = foundTxt.id; this._emitSelect(foundTxt); this.render(); return; }

    let foundBaj = null, minBD = 16;
    this.bajantes.forEach(b => {
      if (b._circ) {
        const d = Math.hypot(cx - b._circ.x, cy - b._circ.y);
        if (d < b._circ.r && d < minBD) { minBD = d; foundBaj = b; }
      }
    });
    const fg = this.getBajantesFantasma();
    fg.forEach(b => {
      if (b._ghost) {
        const d = Math.hypot(cx - b._ghost.x, cy - b._ghost.y);
        if (d < b._ghost.r && d < minBD) { minBD = d; foundBaj = b; }
      }
    });
    if (foundBaj) { this.selId = foundBaj.id; this._emitSelect(foundBaj); this.render(); return; }

    let found = null, minD = 20;
    this.ramales.forEach(r => {
      for (let i = 0; i < r.pts.length - 1; i++) {
        const [x1, y1] = r.pts[i], [x2, y2] = r.pts[i + 1];
        const c1 = this.toCvs(x1, y1), c2 = this.toCvs(x2, y2);
        const mx = (c1.x + c2.x) / 2, my = (c1.y + c2.y) / 2;
        const d = Math.hypot(cx - mx, cy - my);
        if (d < minD) { minD = d; found = r; }
      }
    });
    this.selId = found ? found.id : null;
    this._emitSelect(found);
    this.render();
  }

  _nextLabel() {
    const net = NETS.find(n => n.id === this.activeNet);
    const pfx = net ? net.lbl : 'R';
    const cnt = ++(this._netCounts[this.activeNet][this.tipoTramo]);
    if (this.tipoTramo === 'tributario') {
      const padre = this.activeRamal?.padre;
      return `Tr${padre || cnt}-${cnt}`;
    }
    return `${pfx}${cnt}`;
  }

  finishRamal() {
    if (!this.activeRamal || this.activeRamal.pts.length < 1) return;
    if (this.activeRamal.pts.length < 2) {
      this.activeRamal = null;
      this._emitStatus(this._statusMsg());
      this.render();
      return;
    }
    const mid = Math.floor(this.activeRamal.pts.length / 2);
    const [mx, my] = this.activeRamal.pts[mid];
    const net = NETS.find(n => n.id === this.activeRamal.net);
    const r = {
      id: 'R' + Date.now(),
      net: this.activeRamal.net,
      tipo: this.activeRamal.tipo,
      padre: this.activeRamal.padre,
      pts: this.activeRamal.pts,
      totalL: this.activeRamal.totalL,
      label: this._nextLabel(),
      ini: '',
      fin: '',
      piso: '',
      dz: '',
      uc: 0,
      labelX: mx,
      labelY: my,
      labelAngle: 0,
    };
    this.ramales.push(r);
    this.activeRamal = null;
    this._emitStatus(this._statusMsg());
    this.render();
  }

  cancelRamal() {
    this.activeRamal = null;
    this._emitStatus(this._statusMsg());
    this.render();
  }

  undoLast() {
    if (this.activeRamal) { this.cancelRamal(); return; }
    if (this.tool === 'baj' && this.bajantes.length) {
      this.bajantes.pop();
    } else if (this.ramales.length) {
      this.ramales.pop();
    } else if (this.dims.length) {
      this.dims.pop();
    } else if (this.textAnnots.length) {
      this.textAnnots.pop();
    }
    this.selId = null;
    this._emitSelect(null);
    this.render();
  }

  clearAll() {
    this.ramales = [];
    this.dims = [];
    this.textAnnots = [];
    this.bajantes = [];
    this.activeRamal = null;
    this.selId = null;
    this._netCounts = {};
    NETS.forEach(n => { this._netCounts[n.id] = { ramal: 0, tributario: 0 }; });
    this._emitSelect(null);
    this.render();
  }

  getSelected() {
    if (!this.selId) return null;
    return this.ramales.find(r => r.id === this.selId) || this.bajantes.find(b => b.id === this.selId) || this.textAnnots.find(t => t.id === this.selId) || null;
  }

  updateSelected(fields) {
    const el = this.getSelected();
    if (el) Object.assign(el, fields);
    this.render();
  }

  rotateLabelSnap() {
    const el = this.getSelected();
    if (!el) return;
    if (el.id?.startsWith('T')) {
      el.textAngle = ((el.textAngle || 0) + 45) % 360;
    } else {
      el.labelAngle = ((el.labelAngle || 0) + 45) % 360;
    }
    this.render();
  }

  deleteSelected() {
    if (!this.selId) return;
    const idxR = this.ramales.findIndex(r => r.id === this.selId);
    if (idxR >= 0) { this.ramales.splice(idxR, 1); this.selId = null; this._emitSelect(null); this.render(); return; }
    const idxB = this.bajantes.findIndex(b => b.id === this.selId);
    if (idxB >= 0) { this.bajantes.splice(idxB, 1); this.selId = null; this._emitSelect(null); this.render(); return; }
    const idxT = this.textAnnots.findIndex(t => t.id === this.selId);
    if (idxT >= 0) { this.textAnnots.splice(idxT, 1); this.selId = null; this._emitSelect(null); this.render(); return; }
    const idxD = this.dims.findIndex(d => d.id === this.selId);
    if (idxD >= 0) { this.dims.splice(idxD, 1); this.selId = null; this._emitSelect(null); this.render(); return; }
  }

  resetLabel() {
    const el = this.getSelected();
    if (!el) return;
    if (el.pts) {
      const mid = Math.floor(el.pts.length / 2);
      el.labelX = el.pts[mid][0];
      el.labelY = el.pts[mid][1];
    } else {
      el.labelX = el.x;
      el.labelY = el.y;
    }
    el.labelAngle = 0;
    this.render();
  }

  doZoom(delta, cx, cy) {
    if (cx === undefined) { cx = this.cw.clientWidth / 2; cy = this.cw.clientHeight / 2; }
    const nz = Math.max(0.05, Math.min(6, this.zoom + delta));
    this.offX = cx - (cx - this.offX) * (nz / this.zoom);
    this.offY = cy - (cy - this.offY) * (nz / this.zoom);
    this.zoom = nz;
    this.render();
  }

  fitPage() {
    if (!this.pageW || !this.pageH) return;
    const s = Math.min(
      (this.cw.clientWidth - 20) / this.pageW,
      (this.cw.clientHeight - 36) / this.pageH
    );
    this.zoom = s;
    this.offX = (this.cw.clientWidth - this.pageW * s) / 2;
    this.offY = 16;
    this.render();
  }

  getBajantesFantasma() {
    if (!this.nivelActual) return [];
    return this.bajantes.filter(b => {
      const base = Math.min(b.nptBase || 0, b.nptCima || 0);
      const cima = Math.max(b.nptBase || 0, b.nptCima || 0);
      const npt = this.nivelActual.npt || 0;
      if (npt >= base && npt <= cima) return true;
      const superior = this.nptLevels.filter(l => (l.npt || 0) > npt).sort((a, b) => (a.npt || 0) - (b.npt || 0))[0]?.npt;
      return superior !== undefined && (b.nptBase === superior || b.nptCima === superior);
    });
  }

  saveWork() {
    return JSON.stringify({
      v: 5, scaleM: this.scaleM, activeNet: this.activeNet,
      nets: NETS.map(n => ({ id: n.id, col: n.col })),
      ramales: this.ramales, dims: this.dims, textAnnots: this.textAnnots,
      bajantes: this.bajantes, nptLevels: this.nptLevels,
    });
  }

  loadWork(json) {
    try {
      const d = JSON.parse(json);
      this.scaleM = d.scaleM || 0.5;
      this.activeNet = d.activeNet || 'af';
      this.ramales = d.ramales || [];
      this.dims = d.dims || [];
      this.textAnnots = d.textAnnots || [];
      this.bajantes = d.bajantes || [];
      this.nptLevels = d.nptLevels || [];
      this.selId = null;
      this.activeRamal = null;
      this.render();
    } catch (e) { console.error('Error loading work:', e); }
  }

  _onDown(e) {
    const { x, y } = this._getPos(e);
    if (e.button === 1 || this.tool === 'pan') {
      this.panning = true;
      this.panX0 = x - this.offX;
      this.panY0 = y - this.offY;
      this.canv.style.cursor = 'grabbing';
      return;
    }
    const p = this.toPlane(x, y);

if (this.tool === 'sel') {
      const sel = this.getSelected();
      if (sel && sel._circ && sel.id?.startsWith('B')) {
        const d = Math.hypot(x - sel._circ.x, y - sel._circ.y);
        if (d < sel._circ.r) {
          this.bajDrag = { id: sel.id, offX: x - sel._circ.x, offY: y - sel._circ.y };
          return;
        }
      }
      if (sel && sel.labelX !== undefined && !sel.id?.startsWith('B')) {
        const lx = this.toCvs(sel.labelX, sel.labelY);
        if (Math.hypot(x - lx.x, y - lx.y) < 20) {
          this.lblDrag = { id: sel.id, offX: x - lx.x, offY: y - lx.y };
          return;
        }
      }
    if (sel && sel._box && sel.id.startsWith('T')) {
      const b = sel._box;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this.txtDrag = { id: sel.id, offX: x - b.x, offY: y - b.y };
        return;
      }
    }
    const fg = this.getBajantesFantasma();
      let gFound = null, gMin = 16;
      fg.forEach(b => {
        if (b._ghost) {
          const d = Math.hypot(x - b._ghost.x, y - b._ghost.y);
          if (d < b._ghost.r && d < gMin) { gMin = d; gFound = b; }
        }
      });
      if (gFound) {
        this.ghostDrag = { id: gFound.id, startX: x, startY: y, baseDx: gFound.desplazamientos?.[this.nivelActual?.label]?.dx || 0, baseDy: gFound.desplazamientos?.[this.nivelActual?.label]?.dy || 0 };
        return;
      }
      this.selectAt(x, y);
      return;
    }

if (this.tool === 'line') {
  let pt = { x: p.x, y: p.y };
  if (!this.activeRamal) {
    const sp = this.snapToExisting(pt.x, pt.y);
    if (sp) pt = sp;
    this.activeRamal = {
      net: this.activeNet,
      tipo: this.tipoTramo,
      padre: null,
      pts: [[pt.x, pt.y]],
      totalL: 0,
    };
  } else {
    const last = this.activeRamal.pts[this.activeRamal.pts.length - 1];
    const first = this.activeRamal.pts[0];
    const distFirst = Math.hypot(pt.x - first[0], pt.y - first[1]);
    const SNAP_CLOSE = 12 / this.zoom;
    if (this.activeRamal.pts.length >= 3 && distFirst < SNAP_CLOSE) {
      this.activeRamal.totalL = +(this.activeRamal.totalL + this.pxToM(Math.hypot(first[0] - last[0], first[1] - last[1]))).toFixed(3);
      this.activeRamal.pts.push([first[0], first[1]]);
      this.finishRamal();
      return;
    }
    if (this.snapMode) pt = this.snapAngle(last[0], last[1], pt.x, pt.y);
    const sp = this.snapToExisting(pt.x, pt.y);
    if (sp) pt = sp;
    const segPx = Math.hypot(pt.x - last[0], pt.y - last[1]);
    this.activeRamal.totalL = +(this.activeRamal.totalL + this.pxToM(segPx)).toFixed(3);
    this.activeRamal.pts.push([pt.x, pt.y]);
  }
  this._emitStatus(this._statusMsg());
  this.render();
  return;
}

    if (this.tool === 'dim') {
      if (!this._dimStart) {
        this._dimStart = p;
      } else {
        const s = this._dimStart;
        const px = Math.hypot(p.x - s.x, p.y - s.y);
        this.dims.push({ id: 'D' + Date.now(), x1: s.x, y1: s.y, x2: p.x, y2: p.y, L: this.pxToM(px) });
        this._dimStart = null;
        this.render();
      }
      return;
    }

    if (this.tool === 'text') {
      const t = prompt('Texto:');
      if (t) {
        this.textAnnots.push({ id: 'T' + Date.now(), x: p.x, y: p.y, text: t, fontSize: 12, boxW: 0, lblOffX: 0, lblOffY: 0, textAngle: 0 });
        this.render();
      }
      return;
    }

    if (this.tool === 'baj') {
      const net = NETS.find(n => n.id === this.activeNet);
      const bType = net?.bmType || 'bajante';
      const bPfx = net?.bmPfx || 'B';
      const cnt = this.bajantes.filter(b => b.net === this.activeNet).length + 1;
      this.bajantes.push({
        id: 'B' + Date.now(),
        net: this.activeNet,
        tipo: bType,
        code: `${bPfx}${cnt}`,
        x: p.x, y: p.y,
        pisoBase: '', pisoCima: '',
        nptBase: 0, nptCima: 0,
        hVert: 0, dNominal: '',
        recibeDeIds: [], alimentaIds: [], descargaEnId: null,
        ucAcum: 0, ucExtra: 0, area_m2: 0,
        desplazamientos: {},
        lblOffX: 0, lblOffY: 0,
        labelAngle: 0,
        labelX: p.x, labelY: p.y + 20,
      });
      this.render();
      return;
    }

    if (this.tool === 'erase') {
      this.selectAt(x, y);
      this.deleteSelected();
      return;
    }

  }

  _onMove(e) {
    const { x, y } = this._getPos(e);
    if (this.panning) {
      this.offX = x - this.panX0;
      this.offY = y - this.panY0;
      this.render();
      return;
    }
    if (this.ghostDrag) {
      const b = this.bajantes.find(b => b.id === this.ghostDrag.id);
      if (b && this.nivelActual) {
        const dx = (x - this.ghostDrag.startX) / this.zoom + this.ghostDrag.baseDx;
        const dy = (y - this.ghostDrag.startY) / this.zoom + this.ghostDrag.baseDy;
        if (!b.desplazamientos) b.desplazamientos = {};
        b.desplazamientos[this.nivelActual.label] = { dx, dy, Ldesvio: null };
        this.render();
      }
      return;
    }
      if (this.bajDrag) {
        const b = this.bajantes.find(b => b.id === this.bajDrag.id);
        if (b) {
          const p = this.toPlane(x - this.bajDrag.offX, y - this.bajDrag.offY);
          const dx = p.x - b.x;
          const dy = p.y - b.y;
          b.x = p.x;
          b.y = p.y;
          b.labelX = (b.labelX || 0) + dx;
          b.labelY = (b.labelY || 0) + dy;
          this.render();
        }
        return;
      }
      if (this.lblDrag) {
        const el = this.ramales.find(r => r.id === this.lblDrag.id) || this.bajantes.find(b => b.id === this.lblDrag.id);
        if (el) {
          const p = this.toPlane(x - this.lblDrag.offX, y - this.lblDrag.offY);
          el.labelX = p.x;
          el.labelY = p.y;
          this.render();
        }
        return;
      }
      if (this.txtDrag) {
        const t = this.textAnnots.find(t => t.id === this.txtDrag.id);
        if (t) {
          const b = t._box;
          if (b) {
            const p = this.toPlane(x - this.txtDrag.offX, y - this.txtDrag.offY);
            t.lblOffX = t.lblOffX || 0;
            t.lblOffY = t.lblOffY || 0;
            t.x = p.x;
            t.y = p.y;
            this.render();
          }
        }
        return;
      }
      if (this.activeRamal) {
        this.mouseX = x;
        this.mouseY = y;
        this.render();
      } else if (this._dimStart) {
        this.mouseX = x;
        this.mouseY = y;
        this.render();
      }
    }

  _onUp(e) {
    if (this.panning) {
      this.panning = false;
      this.canv.style.cursor = this.tool === 'pan' ? 'grab' : this.tool === 'sel' ? 'default' : 'crosshair';
    }
    if (this.ghostDrag) {
      const b = this.bajantes.find(b => b.id === this.ghostDrag.id);
      if (b && this.nivelActual && b.desplazamientos?.[this.nivelActual.label]) {
        const d = b.desplazamientos[this.nivelActual.label];
        if (Math.abs(d.dx) < 1 && Math.abs(d.dy) < 1) delete b.desplazamientos[this.nivelActual.label];
      }
      this.ghostDrag = null;
      this.render();
    }
      if (this.lblDrag) { this.lblDrag = null; }
      if (this.txtDrag) { this.txtDrag = null; }
      if (this.bajDrag) { this.bajDrag = null; }
  }

  _onDblClick(e) {
    if (this.tool === 'line' && this.activeRamal && this.activeRamal.pts.length >= 2) {
      this.finishRamal();
    }
  }

  _onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : +0.08;
    const rect = this.canv.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const nz = Math.max(0.05, Math.min(6, this.zoom + delta));
    this.offX = mx - (mx - this.offX) * (nz / this.zoom);
    this.offY = my - (my - this.offY) * (nz / this.zoom);
    this.zoom = nz;
    this.render();
  }

  _onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    const k = e.key.toLowerCase();
    if (k === 's') { this.setTool('sel'); e.preventDefault(); }
    else if (k === 'l') { this.setTool('line'); e.preventDefault(); }
    else if (k === 'd') { this.setTool('dim'); e.preventDefault(); }
    else if (k === 't') { this.setTool('text'); e.preventDefault(); }
    else if (k === ' ') { this.setTool(this.tool === 'pan' ? 'sel' : 'pan'); e.preventDefault(); }
    else if (k === 'enter') { if (this.activeRamal) { this.finishRamal(); e.preventDefault(); } }
else if (k === 'escape') {
  if (this.activeRamal && this.activeRamal.pts.length >= 2) { this.finishRamal(); e.preventDefault(); }
  else if (this.activeRamal) { this.cancelRamal(); e.preventDefault(); }
  else if (this._dimStart) { this._dimStart = null; this.render(); e.preventDefault(); }
  else { this.selId = null; this._emitSelect(null); this.render(); }
}
    else if (e.ctrlKey && k === 'z') { this.undoLast(); e.preventDefault(); }
    else if (e.ctrlKey && k === 's') { e.preventDefault(); }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canv.width, h = this.canv.height;
    ctx.clearRect(0, 0, w, h);

    if (this.pdfWrap) {
      this.pdfWrap.style.transform = `translate(${this.offX}px,${this.offY}px) scale(${this.zoom})`;
      this.pdfWrap.style.transformOrigin = '0 0';
    }

    this._drawDims(ctx);
    this._drawTexts(ctx);
    this._drawRamales(ctx);
    this._drawBajantes(ctx);
    this._drawGhosts(ctx);
    this._drawDimGhost(ctx);
    this._drawActiveRamal(ctx);
  }

  _drawDims(ctx) {
    this.dims.forEach(d => {
      const c1 = this.toCvs(d.x1, d.y1);
      const c2 = this.toCvs(d.x2, d.y2);
      ctx.save();
      ctx.strokeStyle = '#F5A623';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const dx = c2.x - c1.x, dy = c2.y - c1.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) { ctx.restore(); return; }
      const nx = -dy / len, ny = dx / len;
      const mk = 9;
      [c1, c2].forEach(pt => {
        ctx.beginPath();
        ctx.moveTo(pt.x - nx * mk, pt.y - ny * mk);
        ctx.lineTo(pt.x + nx * mk, pt.y + ny * mk);
        ctx.stroke();
      });

      const mx = (c1.x + c2.x) / 2, my = (c1.y + c2.y) / 2;
      const txt = `${d.L}m`;
      ctx.font = '11px Geist, monospace';
      const tw = ctx.measureText(txt).width;
      ctx.fillStyle = 'rgba(17,19,23,0.75)';
      ctx.fillRect(mx - tw / 2 - 4, my - 8, tw + 8, 16);
      ctx.fillStyle = '#F5A623';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, mx, my);
      ctx.restore();
    });
  }

  _drawTexts(ctx) {
    this.textAnnots.forEach(t => {
      const c = this.toCvs(t.x + (t.lblOffX || 0), t.y + (t.lblOffY || 0));
      const sel = t.id === this.selId;
      const fs = (t.fontSize || 12) * this.zoom;
      const angle = (t.textAngle || 0) * Math.PI / 180;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(angle);
      ctx.font = `${fs}px Geist, monospace`;
      const tw = t.boxW > 0 ? t.boxW * this.zoom : ctx.measureText(t.text).width;
      const pad = 5;
      const boxW = tw + pad * 2;
      const boxH = fs + pad * 2;

      ctx.fillStyle = 'rgba(17,19,23,0.85)';
      ctx.strokeStyle = sel ? '#4D8FF7' : '#3a494a';
      ctx.lineWidth = sel ? 2 : 1;
      ctx.beginPath();
      ctx.rect(-pad, -fs - pad, boxW, boxH);
      ctx.fill();
      ctx.stroke();

      if (sel) {
        ctx.fillStyle = '#4D8FF7';
        ctx.beginPath();
        ctx.arc(-pad + boxW, -fs / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#e2e2e8';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(t.text, 0, -fs);
      ctx.restore();

      const cos = Math.abs(Math.cos(angle)), sin = Math.abs(Math.sin(angle));
      t._box = {
        x: c.x - (boxW * cos + boxH * sin) / 2,
        y: c.y - (boxH * cos + boxW * sin) / 2,
        w: boxW * cos + boxH * sin,
        h: boxH * cos + boxW * sin,
      };
    });
  }

  _drawRamales(ctx) {
    this.ramales.forEach(r => {
      const net = NETS.find(n => n.id === r.net);
      const col = net ? net.col : '#e2e2e8';
      const sel = r.id === this.selId;
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = sel ? 3 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (r.pts.length > 1) {
        ctx.beginPath();
        const f = this.toCvs(r.pts[0][0], r.pts[0][1]);
        ctx.moveTo(f.x, f.y);
        for (let i = 1; i < r.pts.length; i++) {
          const c = this.toCvs(r.pts[i][0], r.pts[i][1]);
          ctx.lineTo(c.x, c.y);
        }
        ctx.stroke();

        const last = r.pts[r.pts.length - 1];
        const prev = r.pts[r.pts.length - 2];
        const lc = this.toCvs(last[0], last[1]);
        const pc = this.toCvs(prev[0], prev[1]);
        const adx = lc.x - pc.x, ady = lc.y - pc.y;
        const al = Math.hypot(adx, ady);
        if (al > 10) {
          const aSize = 8;
          const ax = -adx / al, ay = -ady / al;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(lc.x, lc.y);
          ctx.lineTo(lc.x + ax * aSize - ay * aSize * 0.5, lc.y + ay * aSize + ax * aSize * 0.5);
          ctx.lineTo(lc.x + ax * aSize + ay * aSize * 0.5, lc.y + ay * aSize - ax * aSize * 0.5);
          ctx.closePath();
          ctx.fill();
        }
      }

      r.pts.forEach(([px, py]) => {
        const c = this.toCvs(px, py);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      if (r.label) {
        const lc = this.toCvs(r.labelX, r.labelY);
        ctx.save();
        ctx.translate(lc.x, lc.y);
        ctx.rotate((r.labelAngle || 0) * Math.PI / 180);
        ctx.font = 'bold 11px Geist, monospace';
        const lbl = r.label;
        const tw = ctx.measureText(lbl).width;
        ctx.fillStyle = 'rgba(17,19,23,0.82)';
        ctx.fillRect(-tw / 2 - 5, -16, tw + 10, 22);
        ctx.fillStyle = col;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, 0, -4);
        ctx.font = '9px Geist, monospace';
        ctx.fillStyle = '#849495';
        ctx.fillText(`${r.totalL}m`, 0, 8);
        ctx.restore();

        if (sel) {
          ctx.strokeStyle = '#4D8FF7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(lc.x - 14, lc.y, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#4D8FF7';
          ctx.fill();
        }
      }

      ctx.restore();
    });
  }

  _drawBajantes(ctx) {
    this.bajantes.forEach(b => {
      const net = NETS.find(n => n.id === b.net);
      const col = net ? net.col : '#e2e2e8';
      const c = this.toCvs(b.x, b.y);
      const sel = b.id === this.selId;
      const r = 14 * this.zoom;
      const angle = (b.labelAngle || 0) * Math.PI / 180;
      b._circ = { x: c.x, y: c.y, r };

      if (b.recibeDeIds?.length) {
        b.recibeDeIds.forEach(rid => {
          const ram = this.ramales.find(rr => rr.id === rid);
          if (ram) {
            const last = ram.pts[ram.pts.length - 1];
            const rc = this.toCvs(last[0], last[1]);
            ctx.save();
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(rc.x, rc.y);
            ctx.lineTo(c.x, c.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      if (b.descargaEnId) {
        const ram = this.ramales.find(rr => rr.id === b.descargaEnId);
        if (ram && ram.pts.length) {
          const first = ram.pts[0];
          const rc = this.toCvs(first[0], first[1]);
          ctx.save();
          ctx.strokeStyle = '#0ECC7A';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(rc.x, rc.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(angle);

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F04545';
      ctx.lineWidth = sel ? 3 : 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      if (b.tipo === 'bajante') {
        const aS = r * 0.7;
        ctx.strokeStyle = '#F04545';
        ctx.lineWidth = r * 0.15;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(0, aS * 0.9);
        ctx.lineTo(0, -aS * 0.5);
        ctx.stroke();
        ctx.fillStyle = '#F04545';
        ctx.beginPath();
        ctx.moveTo(0, -aS * 0.9);
        ctx.lineTo(-aS * 0.4, -aS * 0.3);
        ctx.lineTo(aS * 0.4, -aS * 0.3);
        ctx.closePath();
        ctx.fill();
      } else {
        const aS = r * 0.7;
        ctx.strokeStyle = '#F04545';
        ctx.lineWidth = r * 0.15;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(0, -aS * 0.9);
        ctx.lineTo(0, aS * 0.5);
        ctx.stroke();
        ctx.fillStyle = '#F04545';
        ctx.beginPath();
        ctx.moveTo(0, aS * 0.9);
        ctx.lineTo(-aS * 0.4, aS * 0.3);
        ctx.lineTo(aS * 0.4, aS * 0.3);
        ctx.closePath();
        ctx.fill();
      }

      if (b.code || b.code === '') {
        const offDx = (b.labelX - b.x) * this.zoom;
        const offDy = (b.labelY - b.y) * this.zoom;
        ctx.save();
        ctx.translate(offDx, offDy);
        ctx.font = 'bold 10px Geist, monospace';
        const displayCode = b.code || '—';
        const tw = ctx.measureText(displayCode).width;
        ctx.fillStyle = 'rgba(17,19,23,0.82)';
        ctx.fillRect(-tw / 2 - 4, -10, tw + 8, 28);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayCode, 0, 0);
        if (b.hVert) {
          ctx.font = '9px Geist, monospace';
          ctx.fillStyle = '#849495';
          ctx.fillText(`H=${b.hVert}m`, 0, 12);
        }
        if (sel) {
          ctx.strokeStyle = '#4D8FF7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(-14, 0, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#4D8FF7';
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
    });
  }

  _drawGhosts(ctx) {
    const fg = this.getBajantesFantasma();
    fg.forEach(b => {
      const net = NETS.find(n => n.id === b.net);
      const col = net ? net.col : '#e2e2e8';
      const disp = b.desplazamientos?.[this.nivelActual?.label];
      const gx = b.x + (disp ? disp.dx : 0);
      const gy = b.y + (disp ? disp.dy : 0);
      const c = this.toCvs(gx, gy);
      const r = 14 * this.zoom;
      b._ghost = { x: c.x, y: c.y, r };

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.font = `${12 * this.zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.tipo === 'bajante' ? '⬇' : '⬆', c.x, c.y);
      ctx.setLineDash([]);
      ctx.restore();

      if (disp && (Math.abs(disp.dx) > 1 || Math.abs(disp.dy) > 1)) {
        const orig = this.toCvs(b.x, b.y);
        ctx.save();
        ctx.strokeStyle = col + '66';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(orig.x, orig.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  _drawDimGhost(ctx) {
    if (!this._dimStart || this.tool !== 'dim') return;
    const s = this.toCvs(this._dimStart.x, this._dimStart.y);
    const mp = this.toPlane(this.mouseX, this.mouseY);
    const e = this.toCvs(mp.x, mp.y);

    ctx.save();
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const dx = e.x - s.x, dy = e.y - s.y;
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      const nx = -dy / len, ny = dx / len;
      const mk = 9;
      [s, e].forEach(pt => {
        ctx.beginPath();
        ctx.moveTo(pt.x - nx * mk, pt.y - ny * mk);
        ctx.lineTo(pt.x + nx * mk, pt.y + ny * mk);
        ctx.stroke();
      });

      const mx = (s.x + e.x) / 2, my = (s.y + e.y) / 2;
      const px = Math.hypot(mp.x - this._dimStart.x, mp.y - this._dimStart.y);
      const txt = `${this.pxToM(px).toFixed(2)}m`;
      ctx.font = '11px Geist, monospace';
      const tw = ctx.measureText(txt).width;
      ctx.fillStyle = 'rgba(17,19,23,0.75)';
      ctx.fillRect(mx - tw / 2 - 4, my - 8, tw + 8, 16);
      ctx.fillStyle = '#F5A623';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, mx, my);
    }

    ctx.fillStyle = '#F5A623';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawActiveRamal(ctx) {
    if (!this.activeRamal) return;
    const net = NETS.find(n => n.id === this.activeRamal.net);
    const col = net ? net.col : '#e2e2e8';

    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.activeRamal.pts.length > 1) {
      ctx.beginPath();
      const f = this.toCvs(this.activeRamal.pts[0][0], this.activeRamal.pts[0][1]);
      ctx.moveTo(f.x, f.y);
      for (let i = 1; i < this.activeRamal.pts.length; i++) {
        const c = this.toCvs(this.activeRamal.pts[i][0], this.activeRamal.pts[i][1]);
        ctx.lineTo(c.x, c.y);
      }
      ctx.stroke();
    }

    this.activeRamal.pts.forEach(([px, py], idx) => {
      const c = this.toCvs(px, py);
      ctx.fillStyle = idx === 0 ? '#fff' : col;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    const first = this.activeRamal.pts[0];
    const last = this.activeRamal.pts[this.activeRamal.pts.length - 1];
    let mp = this.toPlane(this.mouseX, this.mouseY);
    if (this.snapMode) mp = this.snapAngle(last[0], last[1], mp.x, mp.y);
    const sp = this.snapToExisting(mp.x, mp.y);
    if (sp) mp = sp;

    const distFirst = Math.hypot(mp.x - first[0], mp.y - first[1]);
    const SNAP_CLOSE = 12 / this.zoom;
    if (this.activeRamal.pts.length >= 3 && distFirst < SNAP_CLOSE) {
      const fc = this.toCvs(first[0], first[1]);
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fc.x, fc.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(34,211,238,0.25)';
      ctx.beginPath();
      ctx.arc(fc.x, fc.y, 10, 0, Math.PI * 2);
      ctx.fill();
      mp = { x: first[0], y: first[1] };
    }

    const lc = this.toCvs(last[0], last[1]);
    const mc = this.toCvs(mp.x, mp.y);

    ctx.strokeStyle = col + '88';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(lc.x, lc.y);
    ctx.lineTo(mc.x, mc.y);
    ctx.stroke();
    ctx.setLineDash([]);

    if (sp) {
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mc.x, mc.y, 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    const segPx = Math.hypot(mp.x - last[0], mp.y - last[1]);
    const segM = this.pxToM(segPx);
    const deg = Math.atan2(mp.y - last[1], mp.x - last[0]) * 180 / Math.PI;
    const cursorLabel = `${segM}m  ${Math.round(((deg % 360) + 360) % 360)}°`;
    ctx.font = '10px Geist, monospace';
    const tw = ctx.measureText(cursorLabel).width;
    ctx.fillStyle = 'rgba(17,19,23,0.82)';
    ctx.fillRect(mc.x + 12, mc.y - 18, tw + 8, 16);
    ctx.fillStyle = '#e2e2e8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(cursorLabel, mc.x + 16, mc.y - 10);

    ctx.restore();
  }
}
