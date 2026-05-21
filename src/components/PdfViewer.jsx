import { useState, useRef, useEffect, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const COLORS = [
  { id: "af", hex: "#2563EB", label: "AF" },
  { id: "ac", hex: "#ff6b6b", label: "AC" },
  { id: "san", hex: "#f5a623", label: "SAN" },
  { id: "ll", hex: "#22d3ee", label: "LL" },
  { id: "ven", hex: "#a3e635", label: "VEN" },
  { id: "gas", hex: "#c084fc", label: "GAS" },
  { id: "blk", hex: "#e2e2e8", label: "Negro" },
];

const WIDTHS = [
  { id: "thin", value: 2, label: "Fino" },
  { id: "medium", value: 4, label: "Medio" },
  { id: "thick", value: 8, label: "Grueso" },
];

export default function PdfViewer({ files, activeIndex, onSelectPlan, onAddPlan, onRemovePlan }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [mode, setMode] = useState("draw");
  const [color, setColor] = useState(COLORS[0].hex);
  const [stroke, setStroke] = useState(2);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentFile = files[activeIndex]?.file;
  const currentId = files[activeIndex]?.id;

  const pdfDocRef = useRef(null);
  const pdfCanvasRef= useRef(null);
  const drawCanvasRef=useRef(null);
  const containerRef= useRef(null);
  const isDrawing = useRef(false);
  const pathsRef = useRef({});
  const currentPath = useRef(null);
  const mountId = useRef(0);
  const renderTaskRef = useRef(null);
  const pagePathsRef = useRef({});

  /* ── Cargar PDF cuando cambia el archivo activo ───────────────────────── */
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
      setError(new Error("No se pudo leer el archivo. Verifique que sea un PDF válido."));
      setLoading(false);
    };

    reader.readAsArrayBuffer(currentFile);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Re-renderizar cuando cambia el zoom ─────────────────────────────── */
  useEffect(() => {
    if (!pdfDocRef.current) return;
    mountId.current += 1;
    renderPage(pageNumber, scale, mountId.current);
  }, [scale]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Renderizar página ──────────────────────────────────────────────── */
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
        redrawPaths(pageNum);
      }
    } catch (err) {
      if (err?.name === 'RenderingCancelledException') return;
      if (mountCheck && mountCheck !== mountId.current) return;
      console.error("Error renderizando página:", err);
      setError(err);
    }
  };

  /* ── Redibujar paths ────────────────────────────────────────────────── */
  const redrawPaths = (pageNum) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const key = `${currentId}_${pageNum}`;
    const pagePaths = pagePathsRef.current[key] || [];
    for (const path of pagePaths) {
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (path.points.length > 0) {
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
      }
      ctx.stroke();
    }
  };

  /* ── Guardar paths ───────────────────────────────────────────────────── */
  const savePath = (pageNum) => {
    const key = `${currentId}_${pageNum}`;
    if (!pathsRef.current[pageNumber]) return;
    pagePathsRef.current[key] = [...pathsRef.current[pageNumber]];
  };

  /* ── Dibujo con el mouse ────────────────────────────────────────────── */
  const getPos = (e) => {
    const canvas = drawCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (cx - rect.left) * (canvas.width / rect.width),
      y: (cy - rect.top) * (canvas.height / rect.height),
    };
  };

  const onPointerDown = useCallback((e) => {
    if (mode !== "draw") return;
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    currentPath.current = { color, width: stroke, points: [pos] };
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = stroke;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.moveTo(pos.x, pos.y);
    if (!pathsRef.current[pageNumber]) pathsRef.current[pageNumber] = [];
  }, [mode, color, stroke, pageNumber]);

  const onPointerMove = useCallback((e) => {
    if (!isDrawing.current || mode !== "draw") return;
    e.preventDefault();
    const pos = getPos(e);
    currentPath.current.points.push(pos);
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [mode]);

  const onPointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentPath.current?.points.length > 1) {
      if (!pathsRef.current[pageNumber]) pathsRef.current[pageNumber] = [];
      pathsRef.current[pageNumber].push(currentPath.current);
      savePath(pageNumber);
    }
    currentPath.current = null;
  }, [pageNumber]);

  /* ── Navegación / Zoom ──────────────────────────────────────────────── */
  const goToPage = useCallback((target) => {
    if (target < 1 || target > numPages) return;
    setPageNumber(target);
    mountId.current += 1;
    renderPage(target, scale, mountId.current);
  }, [numPages, scale]);

  const changeZoom = useCallback((delta) => {
    setScale(s => Math.max(0.5, Math.min(3, s + delta)));
  }, []);

  /* ── Undo / Clear ───────────────────────────────────────────────────── */
  const handleUndo = useCallback(() => {
    if (pathsRef.current[pageNumber]?.length) {
      pathsRef.current[pageNumber].pop();
      redrawPaths(pageNumber);
      savePath(pageNumber);
    }
  }, [pageNumber]);

  const handleClear = useCallback(() => {
    if (window.confirm("¿Limpiar todas las anotaciones de esta página?")) {
      pathsRef.current[pageNumber] = [];
      redrawPaths(pageNumber);
      const key = `${currentId}_${pageNumber}`;
      delete pagePathsRef.current[key];
    }
  }, [pageNumber, currentId]);

  /* ── Actualizar comportamiento del canvas de dibujo ─────────────────── */
  useEffect(() => {
    const c = drawCanvasRef.current;
    if (c) {
      c.style.pointerEvents = mode === "draw" ? "auto" : "none";
      c.style.cursor = mode === "draw" ? "crosshair" : "default";
    }
  }, [mode]);

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
      background: "#111317", borderRadius: "0px",
      border: "1px solid #3a494a", overflow: "hidden",
    }}>
      {/* Toolbar con selector de planos */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
        background: "#1a1c20", borderBottom: "1px solid #3a494a", flexShrink: 0, flexWrap: "wrap",
      }}>
        {/* Selector de planos */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
          {files.map((f, i) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <button
                onClick={() => onSelectPlan(i)}
                style={{
                  padding: "5px 10px",
                  background: i === activeIndex ? "#2563EB" : "#1e2024",
                  border: `1px solid ${i === activeIndex ? "#2563EB" : "#3a494a"}`,
                  borderRight: "none",
                  borderRadius: i === 0 ? "4px 0 0 4px" : "0",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'Hanken Grotesk',sans-serif",
                  maxWidth: 100,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={f.file.name}
              >
                {f.file.name.replace('.pdf', '').substring(0, 12)}
              </button>
              <button
                onClick={() => onRemovePlan(i)}
                style={{
                  padding: "5px 6px",
                  background: "#1e2024",
                  border: "1px solid #3a494a",
                  borderLeft: "none",
                  borderRadius: i === files.length - 1 ? "0 4px 4px 0" : "0",
                  color: "#ffb4ab",
                  cursor: "pointer",
                  fontSize: 10,
                }}
                title={files.length === 1 ? "Cerrar visor" : "Eliminar plano"}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={onAddPlan}
            style={{
              padding: "5px 12px",
              background: "#1e2024",
              border: "1px dashed #3a494a",
              borderRadius: "4px",
              color: "#b9caca",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Hanken Grotesk',sans-serif",
            }}
            title="Añadir otro plano"
          >
            + Añadir plano
          </button>
        </div>

        <div style={vDivider} />

        {/* Modos dibujar */}
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={() => setMode("view")} style={btnStyle(mode === "view", false)}>🖱️ Ver</button>
          <button onClick={() => setMode("draw")} style={btnStyle(mode === "draw", true)}>✏️ Dibujar</button>
        </div>
        <div style={vDivider} />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {COLORS.map((c) => (
            <button key={c.id} onClick={() => setColor(c.hex)} title={c.label} style={{
              width: 22, height: 22, borderRadius: "50%",
              border: color === c.hex ? "2px solid #fff" : `2px solid ${c.hex}`,
              background: c.hex, cursor: "pointer", padding: 0, outline: "none",
              boxShadow: color === c.hex ? `0 0 8px ${c.hex}` : "none", transition: "all .15s",
            }} />
          ))}
        </div>
        <div style={vDivider} />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {WIDTHS.map((w) => (
            <button key={w.id} onClick={() => setStroke(w.value)} style={{
              padding: "4px 10px",
              background: stroke === w.value ? "#2563EB" : "#1e2024",
              border: `1px solid ${stroke === w.value ? "#2563EB" : "#3a494a"}`,
              borderRadius: "0px", color: stroke === w.value ? "#fff" : "#849495",
              cursor: "pointer", fontSize: 10, fontFamily: "'Geist',monospace", fontWeight: 500,
            }}>{w.label}</button>
          ))}
        </div>
        <div style={vDivider} />
        <button onClick={handleUndo} style={iconBtn} title="Deshacer">↩</button>
        <button onClick={handleClear} style={{ ...iconBtn, color: "#ffb4ab" }} title="Limpiar">🗑</button>
      </div>

      {/* Área de visualización */}
      <div style={{
        flex: 1, overflow: "auto", display: "flex", justifyContent: "center",
        alignItems: "flex-start", padding: 16, background: "#111317", position: "relative",
      }}>
        {error ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40 }}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <div style={{ color: "#ffb4ab", fontFamily: "'Geist',monospace", fontSize: 13 }}>Error al cargar el PDF</div>
            <div style={{ color: "#849495", fontFamily: "'Geist',monospace", fontSize: 11 }}>{error.message || String(error)}</div>
          </div>
        ) : (
          <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
            <canvas ref={pdfCanvasRef} style={{ display: "block", background: "#fff" }} />
            <canvas
              ref={drawCanvasRef}
              style={{
                position: "absolute", top: 0, left: 0,
                pointerEvents: mode === "draw" ? "auto" : "none",
                cursor: mode === "draw" ? "crosshair" : "default",
              }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
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
      </div>

      {/* Barra inferior */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
        padding: "8px 16px", background: "#1a1c20", borderTop: "1px solid #3a494a", flexShrink: 0,
      }}>
        <button onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1} style={navBtn(pageNumber <= 1)}>◀</button>
        <span style={{ fontFamily: "'Geist',monospace", fontSize: 12, color: "#e2e2e8", minWidth: 50, textAlign: "center" }}>
          {pageNumber} / {numPages || "—"}
        </span>
        <button onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= numPages} style={navBtn(pageNumber >= numPages)}>▶</button>
        <div style={{ width: 1, height: 20, background: "#3a494a" }} />
        <button onClick={() => changeZoom(-0.25)} style={navBtn(false)}>−</button>
        <span style={{ fontFamily: "'Geist',monospace", fontSize: 12, color: "#e2e2e8", minWidth: 48, textAlign: "center" }}>
          {scale.toFixed(2)}×
        </span>
        <button onClick={() => changeZoom(0.25)} style={navBtn(false)}>+</button>
      </div>
    </div>
  );
}

function btnStyle(active, isPri) {
  return {
    padding: "5px 12px",
    background: active ? (isPri ? "#2563EB" : "#3a494a") : "#1e2024",
    border: `1px solid ${active ? (isPri ? "#2563EB" : "#3a494a") : "#3a494a"}`,
    borderRadius: "0px", color: active ? "#fff" : "#b9caca", cursor: "pointer",
    fontSize: 11, fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 500, transition: "all .15s",
  };
}

const vDivider = { width: 1, height: 22, background: "#3a494a", flexShrink: 0 };
const iconBtn = {
  padding: "4px 10px", background: "#1e2024", border: "1px solid #3a494a",
  borderRadius: "0px", color: "#b9caca", cursor: "pointer", fontSize: 13,
  fontFamily: "'Geist',monospace",
};
function navBtn(dis) {
  return {
    padding: "4px 12px", background: dis ? "#1e2024" : "#282a2e",
    border: "1px solid #3a494a", borderRadius: "0px",
    color: dis ? "#849495" : "#b9caca", cursor: dis ? "not-allowed" : "pointer",
    opacity: dis ? 0.5 : 1, fontSize: 12, fontFamily: "'Geist',monospace",
  };
}
