// Only distinguish a maximum when at least two known, different values exist.
export function isHighest(value:unknown,values:unknown[]):boolean {
  const known=values.filter((v):v is number=>typeof v==='number'&&Number.isFinite(v));
  return typeof value==='number'&&known.length>=2&&new Set(known).size>1&&value===Math.max(...known);
}
