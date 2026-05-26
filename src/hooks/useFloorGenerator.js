import { useState, useCallback } from 'react';

export function useFloorGenerator(pisos, setPisos) {
  const [nSotanos, setNSotanos] = useState('');
  const [nPisos, setNPisos] = useState('');
  const [altPiso, setAltPiso] = useState(0);
  const [altSotano, setAltSotano] = useState(0);
  const [nptPiso1, setNptPiso1] = useState(0);
  const [conCubierta, setConCubierta] = useState(false);

  const generarPisos = useCallback(() => {
    const lista = [];
    const ns = Number(nSotanos) || 0;
    const np = Number(nPisos) || 0;
    for (let i = ns; i >= 1; i--) lista.push({ id: 's' + i, n: -i, npt: parseFloat((nptPiso1 - (i * altSotano)).toFixed(2)), ok: false, tipo: 'sotano' });
    for (let i = 1; i <= np; i++) lista.push({ id: 'p' + i, n: i, npt: parseFloat((nptPiso1 + ((i - 1) * altPiso)).toFixed(2)), ok: false, tipo: 'piso' });
    if (conCubierta) lista.push({ id: 'cub', n: 99, npt: parseFloat((nptPiso1 + (np * altPiso)).toFixed(2)), ok: false, tipo: 'cubierta' });
    setPisos(lista);
  }, [nSotanos, nPisos, altPiso, altSotano, nptPiso1, conCubierta, setPisos]);

  const addPiso = useCallback(() => setPisos(prev => {
    const pisosPOS = prev.filter(p => p.n > 0);
    const maxN = pisosPOS.length ? Math.max(...pisosPOS.map(p => p.n)) : 0;
    const ln = prev[prev.length - 1]?.npt || 0;
    return [...prev, { id: Date.now(), n: maxN + 1, npt: parseFloat((ln + 3.10).toFixed(2)), ok: false }];
  }), [setPisos]);

  const addSotano = useCallback(() => setPisos(prev => {
    const pisoNEG = prev.filter(p => p.n < 0);
    const minN = pisoNEG.length ? Math.min(...pisoNEG.map(p => p.n)) : 0;
    const fn = prev[0]?.npt || 0;
    return [{ id: Date.now(), n: minN - 1, npt: parseFloat((fn - 3.00).toFixed(2)), ok: false }, ...prev];
  }), [setPisos]);

  return {
    nSotanos, setNSotanos,
    nPisos, setNPisos,
    altPiso, setAltPiso,
    altSotano, setAltSotano,
    nptPiso1, setNptPiso1,
    conCubierta, setConCubierta,
    generarPisos, addPiso, addSotano
  };
}
