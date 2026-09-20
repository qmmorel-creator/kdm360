export function KpiTile({
  label,
  num,
  value,
  meta,
  metaDirection,
}: {
  label: string;
  num?: string;
  value: string;
  meta?: string;
  metaDirection?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="card kpi-tile">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {num && <span className="kpi-num">{num}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      {meta && (
        <div className={`kpi-meta${metaDirection === 'up' ? ' up' : metaDirection === 'down' ? ' down' : ''}`}>
          {meta}
        </div>
      )}
    </div>
  );
}
