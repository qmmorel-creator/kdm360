import type { CSSProperties, ReactNode } from 'react';

export function Card({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`card${className ? ' ' + className : ''}`} style={style}>
      {children}
    </div>
  );
}

export function CardHead({
  title,
  sub,
  badge,
}: {
  title: string;
  sub?: string;
  badge?: { label: string; tone?: 'neutral' | 'teal' | 'coral' };
}) {
  return (
    <div className="card-head">
      <div>
        <div className="card-title">{title}</div>
        {sub && <div className="card-title-sub">{sub}</div>}
      </div>
      {badge && <Badge label={badge.label} tone={badge.tone} />}
    </div>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'teal' | 'coral' }) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

export function CardFoot({ children }: { children: ReactNode }) {
  return <div className="card-foot">{children}</div>;
}
