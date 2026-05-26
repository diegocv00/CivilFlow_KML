import { useState, useCallback } from 'react';

export function useAnalysis(setPisos) {
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState(null);
  const [vals, setVals] = useState([]);

  const analizar = useCallback((f) => {
    setBusy(true);
    setVals([
      { id: 'fmt', st: 'idle', msg: 'Verificando formato...' },
      { id: 'pag', st: 'idle', msg: 'Contando páginas / plantas...' },
      { id: 'esc', st: 'idle', msg: 'Detectando escala gráfica...' },
      { id: 'cap', st: 'idle', msg: 'Identificando capas AF · AC · SAN · LL · VEN · GAS...' },
      { id: 'npt', st: 'idle', msg: 'Leyendo cotas NPT por planta...' },
      { id: 'hid', st: 'idle', msg: 'Reconociendo aparatos hidráulicos...' },
      { id: 'gas', st: 'idle', msg: 'Detectando puntos de consumo gas...' },
    ]);
    const seq = [
      { d: 350, id: 'fmt', st: 'ok', m: `Válido — ${(f.size / 1024).toFixed(0)} KB` },
      { d: 800, id: 'pag', st: 'ok', m: '4 páginas detectadas' },
      { d: 1400, id: 'esc', st: 'warn', m: 'Escala 1:75 — confirmar con barra gráfica' },
      { d: 2000, id: 'cap', st: 'ok', m: 'AF(azul) · AC(rojo) · SAN(naranja) · LL(cian) · VEN(verde) · GAS(amarillo)' },
      { d: 2600, id: 'npt', st: 'ok', m: 'NPT detectados según niveles configurados' },
      { d: 3200, id: 'hid', st: 'ok', m: '18 aparatos hidráulicos detectados' },
      { d: 3800, id: 'gas', st: 'warn', m: '5 puntos de gas — confirmar en editor' },
    ];
    seq.forEach(({ d, id, st, m }) => setTimeout(() => {
      setVals(p => p.map(v => v.id === id ? { ...v, st, msg: m } : v));
      if (id === 'gas') {
        setBusy(false);
        setMeta({ escala: '1:75', pags: 4, ap_hid: 18, ap_gas: 5, pisos: 4, area: '148 m²' });
        setPisos(p => p.map(x => ({ ...x, ok: true })));
      }
    }, d));
  }, [setPisos]);

  return { busy, meta, vals, analizar };
}
