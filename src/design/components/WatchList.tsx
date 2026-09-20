import type { Signal } from '@/core/scoring/types';

const DOMAIN_COLOR: Record<Signal['domain'], string> = {
  budget: 'var(--teal-dark)',
  sante: 'var(--teal)',
  sport: 'var(--coral)',
  social: '#8f7fb0',
};

const DOMAIN_LABEL: Record<Signal['domain'], string> = {
  budget: 'Budget',
  sante: 'Santé',
  sport: 'Sport',
  social: 'Social',
};

export function WatchList({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) {
    return <p className="card-title-sub">Rien à signaler — tous les domaines sont dans leurs repères habituels.</p>;
  }
  return (
    <div className="watch-list">
      {signals.map((s, i) => (
        <div className="watch-row" key={s.detectorId + i}>
          <span className="watch-num">{String(i + 1).padStart(2, '0')}</span>
          <span className="watch-dot" style={{ background: DOMAIN_COLOR[s.domain] }} />
          <div className="watch-body">
            <div className="watch-title">
              {DOMAIN_LABEL[s.domain]} — {s.title}
            </div>
            <div className="watch-desc">{s.description}</div>
          </div>
          <div className="watch-right">
            <span
              className="watch-value"
              style={{ color: s.severity === 'critique' ? 'var(--coral)' : undefined }}
            >
              {s.value}
            </span>
            {s.valueSub && <span className="watch-sub">{s.valueSub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
