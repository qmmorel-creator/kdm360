/** Courbe avec aire teintée — trajectoires temporelles (solde, poids…).
 * Voir docs/architecture/00-design-system.md. Fait main, pas de librairie. */
export function LineAreaChart({
  points,
  labels,
  width = 620,
  height = 220,
  formatValue = (v: number) => String(v),
}: {
  points: number[];
  labels: string[];
  width?: number;
  height?: number;
  formatValue?: (v: number) => string;
}) {
  if (points.length === 0) return null;
  const padL = 8;
  const padR = 40;
  const padT = 24;
  const padB = 26;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const x = (i: number) => padL + (i / (points.length - 1)) * innerW;
  const y = (v: number) => padT + innerH - ((v - min) / range) * innerH;
  // Ligne de référence : à 0 si la série la traverse (ex. solde), sinon en bas
  // du graphique — évite un indexOf(0) qui échoue quand aucun point ne vaut 0
  // (ex. courbe de poids, toujours positive).
  const zeroY = y(Math.max(min, Math.min(0, max)));

  const linePath = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const areaPath = `${linePath} L${x(points.length - 1)},${zeroY} L${x(0)},${zeroY} Z`;

  const peakIdx = points.indexOf(max);
  const troughIdx = points.indexOf(min);
  const lastIdx = points.length - 1;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trajectoire">
      <path d={areaPath} fill="var(--teal-pale-2)" />
      <line x1={padL} y1={zeroY} x2={width - padR} y2={zeroY} stroke="var(--border)" strokeWidth={1} />
      <path d={linePath} fill="none" stroke="var(--teal)" strokeWidth={2} />
      {points.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={i === lastIdx ? 4 : 3}
          fill={i === lastIdx ? 'var(--teal-dark)' : '#fff'}
          stroke="var(--teal)"
          strokeWidth={1.4}
        />
      ))}
      {[peakIdx, troughIdx, lastIdx].map((i) => (
        <text
          key={'lbl' + i}
          x={x(i)}
          y={y(points[i]) - (points[i] >= 0 ? 10 : -16)}
          fontSize={11.5}
          fontWeight={700}
          fill={points[i] < 0 ? 'var(--coral)' : 'var(--teal-dark)'}
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
        >
          {formatValue(points[i])}
        </text>
      ))}
      {labels.map((l, i) => (
        <text key={'x' + i} x={x(i)} y={height - 6} fontSize={10.5} fill="var(--gray-light)" textAnchor="middle" fontFamily="Inter, sans-serif">
          {l}
        </text>
      ))}
    </svg>
  );
}
