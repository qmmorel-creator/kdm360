/** Barres avec labels de valeur et repère optionnel — historiques (sport,
 * récupération…). Fait main, pas de librairie. */
export function BarChart({
  values,
  labels,
  width = 620,
  height = 220,
  formatValue = (v: number) => String(v),
  highlightIndex,
  referenceValue,
}: {
  values: number[];
  labels: string[];
  width?: number;
  height?: number;
  formatValue?: (v: number) => string;
  highlightIndex?: number;
  referenceValue?: number;
}) {
  if (values.length === 0) return null;
  const padL = 8;
  const padR = 8;
  const padT = 26;
  const padB = 26;
  const max = Math.max(...values, referenceValue ?? 0);
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const barGap = 8;
  const barW = innerW / values.length - barGap;

  const yFor = (v: number) => padT + innerH - (v / max) * innerH;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Historique">
      {referenceValue !== undefined && (
        <line
          x1={padL} x2={width - padR} y1={yFor(referenceValue)} y2={yFor(referenceValue)}
          stroke="var(--gray-light)" strokeDasharray="3 3" strokeWidth={1}
        />
      )}
      {values.map((v, i) => {
        const bx = padL + i * (barW + barGap);
        const by = yFor(v);
        const isHi = i === highlightIndex;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={padT + innerH - by} rx={3} fill={isHi ? 'var(--teal-dark)' : 'var(--teal)'} opacity={isHi ? 1 : 0.75} />
            <text x={bx + barW / 2} y={by - 8} fontSize={10.5} fontWeight={isHi ? 700 : 500} fill={isHi ? 'var(--teal-dark)' : 'var(--gray)'} textAnchor="middle" fontFamily="Inter, sans-serif">
              {formatValue(v)}
            </text>
            <text x={bx + barW / 2} y={height - 6} fontSize={10} fill="var(--gray-light)" textAnchor="middle" fontFamily="Inter, sans-serif">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
