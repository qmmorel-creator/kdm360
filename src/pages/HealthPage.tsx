import { Card, CardHead, CardFoot } from '@/design/components/Card';
import { ProgressBar } from '@/design/components/ProgressBar';
import { DataState } from '@/design/components/DataState';
import { BarChart } from '@/charts/BarChart';
import { LineAreaChart } from '@/charts/LineAreaChart';
import { useAsync } from '@/app/useAsync';
import { getHealthOverview } from '@/domains/health';

function fmtHours(h: number | undefined): string {
  if (h === undefined) return '—';
  const totalMin = Math.round(h * 60);
  return `${Math.floor(totalMin / 60)}h${String(totalMin % 60).padStart(2, '0')}`;
}

export function HealthPage() {
  const state = useAsync(getHealthOverview, []);

  return (
    <>
      <div className="breadcrumb">
        Espace personnel <span aria-hidden="true">›</span> <span className="current">Santé</span>
      </div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Santé</h1>
          <p className="page-sub">Récupération, sommeil, composition corporelle et nutrition — l'état du corps au quotidien.</p>
        </div>
        <span className="page-badge">Source réelle · Whoop / Withings</span>
      </div>

      <DataState state={state}>
        {(h) => {
          const t = h.today;
          if (!t) return <Card><p className="card-title-sub">Aucune donnée récente disponible.</p></Card>;
          return (
            <>
              <div className="grid grid-2" style={{ marginBottom: 14 }}>
                <Card>
                  <CardHead title="Récupération" sub="Indicateurs physiologiques du jour" badge={{ label: 'Whoop' }} />
                  <ProgressBar name="Recovery" valueLabel={`${t.recoveryPct ?? '—'} %`} pct={t.recoveryPct ?? 0} />
                  <ProgressBar name="HRV" valueLabel={`${t.hrvMs ?? '—'} ms`} pct={((t.hrvMs ?? 0) / 100) * 100} />
                  <ProgressBar name="FC repos" valueLabel={`${t.restingHr ?? '—'} bpm`} pct={((t.restingHr ?? 0) / 100) * 100} />
                  <div className="grid grid-3" style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
                    <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.spo2Pct ?? '—'} %</div><div className="card-title-sub">SpO2</div></div>
                    <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.skinTempC ?? '—'} °C</div><div className="card-title-sub">Température cutanée</div></div>
                    <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.strain ?? '—'}/21</div><div className="card-title-sub">Strain</div></div>
                  </div>
                </Card>

                <Card>
                  <CardHead title="Sommeil" sub="Dernière nuit" badge={{ label: `${fmtHours(t.sleepHours)} / ~${fmtHours(h.sleepNeedMin / 60)}` }} />
                  <ProgressBar name="Durée de sommeil" valueLabel={`${fmtHours(t.sleepHours)} · besoin estimé ${fmtHours(h.sleepNeedMin / 60)}`} pct={((t.sleepHours ?? 0) * 60 / h.sleepNeedMin) * 100} targetPct={100} />
                  <ProgressBar name="Performance" valueLabel={`${t.sleepPerfPct ?? '—'} %`} pct={t.sleepPerfPct ?? 0} />
                  <div className="grid grid-3" style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
                    <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.sleepEffPct ?? '—'} %</div><div className="card-title-sub">Efficacité</div></div>
                    <div><div className="kpi-value" style={{ fontSize: 18 }}>{fmtHours(t.remSleepHours)}</div><div className="card-title-sub">Sommeil REM</div></div>
                    <div><div className="kpi-value" style={{ fontSize: 18 }}>{fmtHours(t.deepSleepHours)}</div><div className="card-title-sub">Sommeil profond</div></div>
                  </div>
                  <CardFoot><span>Besoin de sommeil estimé (8h) — la source réelle n'expose pas de valeur de besoin calculée.</span></CardFoot>
                </Card>
              </div>

              <div className="grid grid-2" style={{ marginBottom: 14 }}>
                <Card>
                  <CardHead title="Composition corporelle" sub="Dernière mesure" badge={{ label: 'Withings' }} />
                  <div className="grid grid-3" style={{ marginBottom: 12 }}>
                    <div><div className="kpi-value" style={{ fontSize: 22 }}>{t.weightKg ?? '—'} kg</div><div className="card-title-sub">Poids</div></div>
                    <div><div className="kpi-value" style={{ fontSize: 22 }}>{t.bodyFatPct ?? '—'} %</div><div className="card-title-sub">Masse grasse</div></div>
                    <div><div className="kpi-value" style={{ fontSize: 22 }}>{t.muscleMassKg ?? '—'} kg</div><div className="card-title-sub">Masse musculaire</div></div>
                  </div>
                  <div className="card-title-sub" style={{ marginBottom: 6, fontWeight: 600 }}>Poids — mesures récentes</div>
                  {h.last90Weight.length > 1 ? (
                    <LineAreaChart
                      points={h.last90Weight.map((r) => r.weightKg!)}
                      labels={h.last90Weight.map((r) => r.date.slice(5))}
                      formatValue={(v) => `${v.toFixed(1)} kg`}
                      height={180}
                    />
                  ) : (
                    <p className="card-title-sub">Pas assez de mesures pour tracer une tendance.</p>
                  )}
                </Card>

                <Card>
                  <CardHead title="Nutrition" sub="Hier" badge={{ label: 'Déclaratif' }} />
                  <ProgressBar name="Calories" valueLabel={`${t.kcalConsumed ?? '—'} kcal`} pct={t.kcalConsumed ? (t.kcalConsumed / 2400) * 100 : 0} />
                  <ProgressBar name="Protéines" valueLabel={`${t.proteinG ?? '—'} g`} pct={t.proteinG ? (t.proteinG / 160) * 100 : 0} />
                  <ProgressBar name="Glucides" valueLabel={`${t.carbsG ?? '—'} g · sans objectif`} pct={t.carbsG ? Math.min(100, t.carbsG / 3) : 0} />
                  {t.kcalConsumed && t.kcalExpended && (
                    <div className="card-title-sub" style={{ marginTop: 8 }}>
                      Facteur calorique (consommé/dépensé) : {(t.kcalConsumed / t.kcalExpended).toFixed(2)}
                    </div>
                  )}
                </Card>
              </div>

              <Card>
                <CardHead title="Récupération — 7 derniers jours" sub="Score quotidien Whoop" badge={{ label: 'Live' }} />
                {h.last7Recovery.some((r) => r.recoveryPct !== undefined) ? (
                  <BarChart
                    values={h.last7Recovery.map((r) => r.recoveryPct ?? 0)}
                    labels={h.last7Recovery.map((r) => r.date.slice(5))}
                    formatValue={(v) => `${v} %`}
                    highlightIndex={h.last7Recovery.length - 1}
                    height={180}
                  />
                ) : (
                  <p className="card-title-sub">Pas de données de récupération récentes.</p>
                )}
              </Card>
            </>
          );
        }}
      </DataState>
    </>
  );
}
