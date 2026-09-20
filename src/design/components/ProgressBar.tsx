/** Barre de progression avec marqueur de valeur actuelle et repère de cible en
 * pointillé — utilisée pour le rythme budgétaire, la récupération/sommeil,
 * les objectifs Sport. Voir docs/architecture/00-design-system.md. */
export function ProgressBar({
  name,
  valueLabel,
  pct,
  targetPct,
  tone = 'teal',
}: {
  name: string;
  valueLabel: string;
  /** 0-100, position du marqueur. */
  pct: number;
  /** 0-100, position du repère pointillé (facultatif). */
  targetPct?: number;
  tone?: 'teal' | 'coral';
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = tone === 'coral' ? 'var(--coral)' : 'var(--teal)';
  return (
    <div className="metric-row">
      <div className="metric-top">
        <span className="metric-name">{name}</span>
        <span className="metric-figs">{valueLabel}</span>
      </div>
      <div style={{ position: 'relative', height: 8 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: '#f1efe8' }} />
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 6,
            width: `${clamped}%`, background: color,
          }}
        />
        <div
          style={{
            position: 'absolute', top: -3, width: 14, height: 14, borderRadius: '50%',
            background: '#fff', border: `2px solid ${color}`, left: `calc(${clamped}% - 7px)`,
          }}
        />
        {targetPct !== undefined && (
          <div
            style={{
              position: 'absolute', top: -4, bottom: -4, left: `${targetPct}%`,
              borderLeft: '1.5px dashed var(--gray-light)',
            }}
          />
        )}
      </div>
    </div>
  );
}
