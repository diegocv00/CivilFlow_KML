import { useState, useRef, useEffect, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import PlanoEngine, { NETS } from "./PlanoEngine";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const TOOLS = [
  { id: "sel", label: "Seleccionar", ico: "🖱", key: "S", icoCol: "#849495", shortcut: "S" },
  { id: "line", label: "Ramal", ico: "╱", key: "L", icoCol: "#4D8FF7", shortcut: "L" },
  { id: "area", label: "Área", ico: "⬡", key: "A", icoCol: "#22D3EE", shortcut: "A" },
  { id: "dim", label: "Cota", ico: "📏", key: "D", icoCol: "#22D3EE", shortcut: "D" },
  { id: "text", label: "Texto", ico: "T", key: "T", icoCol: "#A855F7", shortcut: "T" },
  { id: "baj", label: "Bajante", ico: "↓", key: "B", icoCol: "#F04545", shortcut: "B" },
  { id: "erase", label: "Borrar", ico: "🧹", key: "E", icoCol: "#ffb4ab", shortcut: "E" },
  { id: "pan", label: "Mover", ico: "✋", key: "Espacio", icoCol: "#10B981", shortcut: "Espacio" },
];

const TIPOS_TRAMO = [
  { id: "ramal", label: "Ramal" },
  { id: "tributario", label: "Tributario" },
];

export default function PdfViewer({ files, activeIndex, onSelectPlan, onAddPlan, onRemovePlan, pisos }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState("sel");
  const [activeNet, setActiveNet] = useState("af");
  const [tipoTramo, setTipoTramo] = useState("ramal");
  const [snapOn, setSnapOn] = useState(true);
  const [scaleM, setScaleM] = useState("0.5");
  const [statusMsg, setStatusMsg] = useState("Seleccionar");
  const [selElement, setSelElement] = useState(null);
  const toolRef = useRef(tool);
  toolRef.current = tool;

  const currentFile = files[activeIndex]?.file;
  const currentId = files[activeIndex]?.id;

  const pdfDocRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const cwRef = useRef(null);
  const engineRef = useRef(null);
  const mountId = useRef(0);
  const renderTaskRef = useRef(null);
  const fileInputSaveRef = useRef(null);

  const syncEngine = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.setTool(tool);
    eng.setActiveNet(activeNet);
    eng.setTipoTramo(tipoTramo);
    eng.setSnap(snapOn);
    eng.setScaleM(scaleM);
  }, [tool, activeNet, tipoTramo, snapOn, scaleM]);

  useEffect(() => { syncEngine(); }, [syncEngine]);

  useEffect(() => {
    if (!cwRef.current || !drawCanvasRef.current) return;
    const cw = cwRef.current;
    const canv = drawCanvasRef.current;
    if (engineRef.current) engineRef.current.destroy();
    const pdfWrap = pdfCanvasRef.current?.parentElement;
    const eng = new PlanoEngine(cw, pdfWrap, canv);
    engineRef.current = eng;
    eng.onSelect((el) => setSelElement(el));
    eng.onStatus((msg) => setStatusMsg(msg));
    const origSetTool = eng.setTool.bind(eng);
    eng.setTool = (t) => {
      origSetTool(t);
      setTool(t);
    };
    return () => {
      eng.setTool = origSetTool;
      eng.destroy();
    };
  }, []);

  useEffect(() => {
    if (!currentFile) return;
    mountId.current += 1;
    const thisMount = mountId.current;
    const reader = new FileReader();

    reader.onload = async () => {
      if (thisMount !== mountId.current) return;
      try {
        setLoading(true);
        setError(null);
        const buffer = reader.result;
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        if (thisMount !== mountId.current) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setPageNumber(1);
        setLoading(false);
        await renderPage(1, scale, thisMount);
      } catch (err) {
        if (thisMount === mountId.current) {
          console.error("Error cargando PDF:", err);
          setError(err);
          setLoading(false);
        }
      }
    };

    reader.onerror = () => {
      setError(new Error("No se pudo leer el archivo."));
      setLoading(false);
    };

    reader.readAsArrayBuffer(currentFile);
  }, [currentId]);

  useEffect(() => {
    if (!pdfDocRef.current) return;
    mountId.current += 1;
    renderPage(pageNumber, scale, mountId.current);
  }, [scale]);

  const renderPage = async (pageNum, sc, mountCheck) => {
    const pdf = pdfDocRef.current;
    const pdfCanvas = pdfCanvasRef.current;
    if (!pdf || !pdfCanvas) return;

    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (_) {}
      renderTaskRef.current = null;
    }

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: sc });
      pdfCanvas.width = viewport.width;
      pdfCanvas.height = viewport.height;
      const ctx = pdfCanvas.getContext("2d");
      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
      renderTaskRef.current = null;

      const drawCanvas = drawCanvasRef.current;
      if (drawCanvas) {
        drawCanvas.width = viewport.width;
        drawCanvas.height = viewport.height;
        if (engineRef.current) {
          engineRef.current.setPageSize(viewport.width, viewport.height);
          engineRef.current.resizeCanvas(viewport.width, viewport.height);
        }
      }
    } catch (err) {
      if (err?.name === 'RenderingCancelledException') return;
      if (mountCheck && mountCheck !== mountId.current) return;
      console.error("Error renderizando pagina:", err);
      setError(err);
    }
  };

  const goToPage = useCallback((target) => {
    if (target < 1 || target > numPages) return;
    setPageNumber(target);
    mountId.current += 1;
    renderPage(target, scale, mountId.current);
  }, [numPages, scale]);

  const handleUndo = useCallback(() => {
    if (engineRef.current) engineRef.current.undoLast();
  }, []);

  const handleClear = useCallback(() => {
    if (window.confirm("Limpiar todos los elementos del plano?")) {
      if (engineRef.current) engineRef.current.clearAll();
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!engineRef.current) return;
    const json = engineRef.current.saveWork();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano_${currentId || 'work'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentId]);

  const handleLoad = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !engineRef.current) return;
    const reader = new FileReader();
    reader.onload = () => engineRef.current.loadWork(reader.result);
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleRotateLabel = useCallback(() => {
    if (engineRef.current) engineRef.current.rotateLabelSnap();
  }, []);

  const handleDelete = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.deleteSelected();
      setSelElement(null);
    }
  }, []);

  const handleUpdateSel = useCallback((field, value) => {
    if (!engineRef.current || !selElement) return;
    engineRef.current.updateSelected({ [field]: value });
    setSelElement({ ...selElement, [field]: value });
  }, [selElement]);

  useEffect(() => {
    const c = drawCanvasRef.current;
    if (c) {
      c.style.cursor = tool === 'pan' ? 'grab' : tool === 'sel' ? 'default' : 'crosshair';
    }
  }, [tool]);

  const netObj = NETS.find(n => n.id === activeNet);

  return (
    <div style={{
      flex: 1, display: "flex", minHeight: 0,
      background: "#111317", border: "1px solid #3a494a", overflow: "hidden",
    }}>
      {/* Left toolbar */}
    <div className="visor-sidebar" style={{
      width: 190, flexShrink: 0, display: "flex", flexDirection: "column",
      background: "#14161a", borderRight: "1px solid #3a494a",
      overflowY: "auto", overflowX: "hidden",
    }}>

      {/* Planos — agregar plano */}
      <div style={{ padding: "6px 8px 4px", borderBottom: "1px solid #3a494a" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
          {files.map((f, i) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center" }}>
              <button onClick={() => onSelectPlan(i)} style={{
                padding: "3px 7px", background: i === activeIndex ? "#2563EB" : "#1e2024",
                border: `1px solid ${i === activeIndex ? "#2563EB" : "#3a494a"}`, borderRight: "none",
                borderRadius: "3px 0 0 3px", color: "#fff", cursor: "pointer",
                fontSize: 10, fontFamily: "'Hanken Grotesk',sans-serif", maxWidth: 80,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }} title={f.file.name}>
                {f.file.name.replace('.pdf', '').substring(0, 10)}
              </button>
              <button onClick={() => onRemovePlan(i)} style={{
                padding: "3px 5px", background: "#1e2024", border: "1px solid #3a494a", borderLeft: "none",
                borderRadius: "0 3px 3px 0", color: "#ffb4ab", cursor: "pointer", fontSize: 9,
              }} title={files.length === 1 ? "Cerrar visor" : "Eliminar plano"}>✕</button>
            </div>
          ))}
          <button onClick={onAddPlan} style={{
            width: 28, height: 28, background: "#1e2024", border: "1px dashed #3a494a", borderRadius: "3px",
            color: "#b9caca", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 700, lineHeight: 1,
          }} title="Agregar plano">+</button>
        </div>
      </div>

      {/* Selected element info */}
      {selElement && (
        <div style={{ padding: "6px 8px 4px", borderBottom: "1px solid #3a494a" }}>
          {selElement.id?.startsWith('T') ? (
            <span style={{
              fontFamily: "'Geist',monospace", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4,
              color: '#e2e2e8',
              background: '#1e2024', padding: '2px 8px', borderRadius: 3,
            }}>Texto</span>
          ) : selElement.id?.startsWith('AR') ? (
            <span style={{
              fontFamily: "'Geist',monospace", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4,
              color: '#22D3EE',
              background: '#1e2024', padding: '2px 8px', borderRadius: 3,
            }}>Área: {selElement.areaM2} m²</span>
          ) : selElement.pts ? (
            <span style={{
              fontFamily: "'Geist',monospace", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4,
              color: NETS.find(n => n.id === selElement.net)?.col || '#e2e2e8',
              background: '#1e2024', padding: '2px 8px', borderRadius: 3,
            }}>
              {selElement.label || selElement.id}
            </span>
          ) : selElement.id?.startsWith('B') ? (
            <span style={{
              fontFamily: "'Geist',monospace", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4,
              color: '#fff',
              background: '#1e2024', padding: '2px 8px', borderRadius: 3,
            }}>
              {selElement.code || '—'}
            </span>
          ) : null}
          {selElement.pts && !selElement.id?.startsWith('AR') && (
            <div style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", marginBottom: 3 }}>
              L={selElement.totalL}m · {selElement.pts.length} pts
            </div>
          )}
          {selElement.tipo && selElement.pts && (
            <div style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", marginBottom: 3 }}>{selElement.tipo.toUpperCase()}</div>
          )}

{/* Etiqueta editable — para todos excepto texto */}
        {!selElement.id?.startsWith('T') && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 4 }}>
            <input
              value={selElement.id?.startsWith('AR') ? (selElement.label ?? '') : selElement.id?.startsWith('B') ? (selElement.code ?? '') : (selElement.label ?? '')}
              placeholder="Etiqueta"
              onChange={e => {
                if (selElement.id?.startsWith('AR')) setSelElement({ ...selElement, label: e.target.value });
                else if (selElement.id?.startsWith('B')) setSelElement({ ...selElement, code: e.target.value });
                else setSelElement({ ...selElement, label: e.target.value });
              }}
              style={{ width: "100%", ...smInput }}
            />
              {selElement.id?.startsWith('AR') && (
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", whiteSpace: 'nowrap' }}>Color</span>
                  <input
                    type="color"
                    value={selElement.color ? (selElement.color.startsWith('#') ? selElement.color.slice(0, 7) : '#22D3EE') : '#22D3EE'}
                    onChange={e => setSelElement({ ...selElement, color: e.target.value + '33' })}
                    style={{ width: 24, height: 20, padding: 0, border: '1px solid #3a494a', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}
                  />
                </div>
              )}
              <button onClick={() => {
                if (engineRef.current && selElement) {
if (selElement.id?.startsWith('AR')) {
          engineRef.current.updateSelected({ label: selElement.label, color: selElement.color });
        } else if (selElement.id?.startsWith('B')) {
          engineRef.current.updateSelected({ code: selElement.code, hVert: selElement.hVert, dNominal: selElement.dNominal });
        } else {
                    engineRef.current.updateSelected({ label: selElement.label });
                  }
                  engineRef.current.selId = null;
                  setSelElement(null);
                }
              }} style={{
                padding: "4px 8px", background: "#10B981", border: "1px solid #10B981",
                borderRadius: 4, color: "#fff", cursor: "pointer", fontSize: 10,
                fontFamily: "'Geist',monospace", fontWeight: 600, textAlign: "center",
              }}>✓ Aplicar</button>
            </div>
          )}

          {selElement.id?.startsWith('T') && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 4 }}>
              <input value={selElement.text || ''} placeholder="Texto" onChange={e => handleUpdateSel('text', e.target.value)}
                style={{ width: "100%", ...smInput }} />
              <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                <span style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", display: "flex", alignItems: "center" }}>Tamaño</span>
                <input value={selElement.fontSize || 12} type="number" min={6} max={72}
                  onChange={e => handleUpdateSel('fontSize', parseInt(e.target.value) || 12)}
                  style={{ width: 52, ...smInput }} />
                <span style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", display: "flex", alignItems: "center" }}>Ancho</span>
                <input value={selElement.boxW || 0} type="number" min={0}
                  onChange={e => handleUpdateSel('boxW', parseInt(e.target.value) || 0)}
                  style={{ width: 52, ...smInput }} />
              </div>
              <button onClick={() => { if (engineRef.current) { engineRef.current.rotateLabelSnap(); const el = engineRef.current.getSelected(); if (el) setSelElement({...el}); }}} style={{ ...smBtn, width: "100%", textAlign: "center" }} title="Rotar texto 45°">↻ Rotar</button>
            </div>
          )}

          {!selElement.id?.startsWith('T') && !selElement.id?.startsWith('AR') && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
              <button onClick={() => { if (engineRef.current) { engineRef.current.rotateLabelSnap(); const el = engineRef.current.getSelected(); if (el) setSelElement({...el}); }}} style={smBtn} title="Rotar elemento 45°">↻ Rotar</button>
            </div>
          )}
          {selElement.id?.startsWith('B') && (
            <>
<input value={selElement.hVert && selElement.hVert !== 0 ? selElement.hVert : ''} placeholder="H(m)" onChange={e => handleUpdateSel('hVert', e.target.value)}
          style={{ width: "100%", ...smInput, marginBottom: 3 }} />
          <input value={selElement.dNominal && selElement.dNominal !== '0' ? selElement.dNominal : ''} placeholder="D(mm)" onChange={e => handleUpdateSel('dNominal', e.target.value)}
          style={{ width: "100%", ...smInput, marginBottom: 3 }} />
            </>
          )}
        </div>
      )}

      {/* Herramientas */}
        <div style={{ padding: "6px 8px 4px", borderBottom: "1px solid #3a494a" }}>
          <div style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Herramientas</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {TOOLS.map(t => (
              <button key={t.id} onClick={() => setTool(t.id)} title={`${t.label} (${t.shortcut})`} style={{
                padding: "5px 8px", background: tool === t.id ? "#2563EB" : "#1e2024",
                border: `1px solid ${tool === t.id ? "#2563EB" : "#3a494a"}`, borderRadius: "3px",
                color: "#b9caca",
                cursor: "pointer",
                fontFamily: "'Geist',monospace", fontWeight: 600, transition: "all .12s",
                display: "flex", alignItems: "center", gap: 6, width: "100%",
              }}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center", color: tool === t.id ? "#fff" : t.icoCol }}>{t.ico}</span>
                <span style={{ fontSize: 10, flex: 1 }}>{t.label}</span>
                <span style={{ fontSize: 8, color: tool === t.id ? 'rgba(255,255,255,.6)' : '#6b8cae', fontFamily: "'Geist',monospace", marginLeft: 'auto' }}>{t.shortcut}</span>
              </button>
        ))}
      </div>
        </div>

        {/* Redes — lista vertical con nombre y color */}
        <div style={{ padding: "6px 8px 4px", borderBottom: "1px solid #3a494a" }}>
          <div style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Redes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NETS.map(n => (
          <button key={n.id} onClick={() => setActiveNet(n.id)} title={`${n.emoji || ''} ${n.name || n.lbl}`} style={{
            padding: "3px 6px", background: activeNet === n.id ? n.col + '22' : "transparent",
            border: `1px solid ${activeNet === n.id ? n.col : '#3a494a'}`,
            borderLeft: `3px solid ${n.col}`,
            borderRadius: "3px", color: activeNet === n.id ? n.col : "#849495",
            cursor: "pointer", fontFamily: "'Geist',monospace", fontWeight: 600,
            transition: "all .15s", display: "flex", alignItems: "center", gap: 6, width: "100%",
            fontSize: 10, textAlign: "left",
          }}>
            <span style={{ fontSize: 12, width: 16, textAlign: "center" }}>{n.emoji || ''}</span>
            <span style={{ flex: 1, color: activeNet === n.id ? '#e2e2e8' : '#849495' }}>{n.name || n.lbl}</span>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: n.col, flexShrink: 0, border: '1px solid rgba(255,255,255,.15)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Tipo tramo */}
        {(tool === 'line' || tool === 'baj') && (
          <div style={{ padding: "6px 8px 4px", borderBottom: "1px solid #3a494a" }}>
            <div style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Tipo</div>
            <div style={{ display: "flex", gap: 3 }}>
              {TIPOS_TRAMO.map(tp => (
                <button key={tp.id} onClick={() => setTipoTramo(tp.id)} style={{
                  padding: "4px 8px", flex: 1, background: tipoTramo === tp.id ? netObj?.col || '#2563EB' : "#1e2024",
                  border: `1px solid ${tipoTramo === tp.id ? (netObj?.col || '#2563EB') : "#3a494a"}`,
                  borderRadius: "3px", color: tipoTramo === tp.id ? "#fff" : "#849495",
                  cursor: "pointer", fontSize: 9, fontFamily: "'Geist',monospace", fontWeight: 600,
                  whiteSpace: "nowrap", textAlign: "center",
                }}>{tp.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Alinear — centrado */}
        <div style={{ padding: "6px 8px 4px", borderBottom: "1px solid #3a494a" }}>
          <button onClick={() => setSnapOn(!snapOn)} title={"Alinear a angulos 0/45/90/135/180° (" + (snapOn ? 'ON' : 'OFF') + ")"} style={{
            padding: "5px 8px", width: "100%", background: snapOn ? "#10B981" : "#1e2024",
            border: `1px solid ${snapOn ? "#10B981" : "#3a494a"}`, borderRadius: "3px",
            color: snapOn ? "#fff" : "#849495", cursor: "pointer", fontSize: 10,
            fontFamily: "'Geist',monospace", fontWeight: 600, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {snapOn ? '◉' : '○'} Alinear
          </button>
        </div>

        {/* Escala — centrado */}
        <div style={{ padding: "6px 8px 4px", borderBottom: "1px solid #3a494a", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <span style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495" }}>Escala</span>
          <input value={scaleM} onChange={e => setScaleM(e.target.value)} onBlur={() => { if (engineRef.current) engineRef.current.setScaleM(scaleM); }}
            style={{ width: 44, padding: "2px 4px", background: "#1e2024", border: "1px solid #3a494a", borderRadius: 3, color: "#e2e2e8", fontSize: 10, fontFamily: "'Geist',monospace", textAlign: "center" }}
          />
          <span style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495" }}>m/cm</span>
        </div>

      {/* Acciones */}
      <div style={{ padding: "6px 8px 4px", borderBottom: "1px solid #3a494a" }}>
        <div style={{ fontFamily: "'Geist',monospace", fontSize: 9, color: "#849495", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Acciones</div>
      <div style={{ display: "flex", gap: 0 }}>
        <button onClick={handleSave} style={{ ...iconBtn, flex: 1, borderRadius: "3px 0 0 3px", borderRight: "1px solid #3a494a" }} title="Guardar (JSON)">💾</button>
        <button onClick={handleUndo} style={{ ...iconBtn, flex: 1, borderRadius: 0, borderRight: "none" }} title="Deshacer (Ctrl+Z)">↩</button>
        <button onClick={handleClear} style={{ ...iconBtn, flex: 1, borderRadius: "0 3px 3px 0", color: "#ffb4ab" }} title="Limpiar todo">🗑</button>
      </div>
      </div>

        <div style={{ flex: 1 }} />
      </div>

      {/* Canvas area */}
      <div ref={cwRef} style={{
        flex: 1, overflow: "hidden", display: "flex", justifyContent: "center",
        alignItems: "flex-start", background: "#111317", position: "relative",
      }}>
        {error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40 }}>
            <div style={{ fontSize: 40 }}>⚠</div>
            <div style={{ color: "#ffb4ab", fontFamily: "'Geist',monospace", fontSize: 13 }}>Error al cargar el PDF</div>
            <div style={{ color: "#849495", fontFamily: "'Geist',monospace", fontSize: 11 }}>{error.message || String(error)}</div>
          </div>
        ) : (
          <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
            <div id="pdfWrap" style={{ transformOrigin: '0 0' }}>
              <canvas ref={pdfCanvasRef} style={{ display: "block", background: "#fff" }} />
            </div>
            <canvas
              ref={drawCanvasRef}
              style={{
                position: "absolute", top: 0, left: 0,
                cursor: tool === 'pan' ? 'grab' : tool === 'sel' ? 'default' : 'crosshair',
              }}
            />
            {loading && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(17,19,23,0.8)",
              }}>
                <div className="sp" />
              </div>
            )}
          </div>
        )}

        {/* Status bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: "flex", alignItems: "center", gap: 10, padding: "4px 14px",
          background: "rgba(17,19,23,0.92)", borderTop: "1px solid #3a494a",
          fontFamily: "'Geist',monospace", fontSize: 10, color: "#849495",
        }}>
          <span>{statusMsg}</span>
          <div style={{ flex: 1 }} />
          {tool === 'line' && (
            <span style={{ color: '#6b8cae', fontSize: 9 }}>
              Enter/Doble-clic:Guardar · Esc:Cancelar
            </span>
          )}
          {tool === 'area' && (
            <span style={{ color: '#6b8cae', fontSize: 9 }}>
              Enter/Doble-clic:Cerrar · Esc:Cancelar
            </span>
          )}
          {snapOn && <span style={{ color: '#10B981' }}>Alinear</span>}
        </div>
      </div>
    </div>
  );
}

const iconBtn = {
  padding: "5px 6px", background: "#1e2024", border: "1px solid #3a494a",
  borderRadius: "4px", color: "#b9caca", cursor: "pointer", fontSize: 16,
  fontFamily: "'Geist',monospace", display: "flex", alignItems: "center", justifyContent: "center",
};
const smBtn = {
  padding: "3px 8px", background: "#1e2024", border: "1px solid #3a494a",
  borderRadius: "4px", color: "#b9caca", cursor: "pointer", fontSize: 10,
  fontFamily: "'Geist',monospace",
};
const smInput = {
  padding: "3px 6px", background: "#1e2024", border: "1px solid #3a494a",
  borderRadius: 4, color: "#e2e2e8", fontSize: 11, fontFamily: "'Geist',monospace", textAlign: "center",
};

function navBtnSm(dis) {
  return {
    padding: "3px 8px", background: dis ? "#1e2024" : "#282a2e",
    border: "1px solid #3a494a", borderRadius: "3px",
    color: dis ? "#849495" : "#b9caca", cursor: dis ? "not-allowed" : "pointer",
    opacity: dis ? 0.5 : 1, fontSize: 11, fontFamily: "'Geist',monospace",
  };
}
