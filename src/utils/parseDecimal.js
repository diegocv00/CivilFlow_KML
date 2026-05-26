export function parseDecimalInput(value) {
  const raw = value.replace(/,/g, '.');
  const v = parseFloat(raw);
  return (!isNaN(v) && raw !== '') ? v : null;
}
