import { useState } from 'react';
import { Card, CardHead, CardFoot } from '@/design/components/Card';
import { ProgressBar } from '@/design/components/ProgressBar';
import { DataState } from '@/design/components/DataState';
import { BarChart } from '@/charts/BarChart';
import { useAsync } from '@/app/useAsync';
import { getSportOverview } from '@/domains/sport';

const PERIODS = ['7 jours', '28 jours', 'Mois en cours', 'Année', 'Historique complet'] as const;

/** Fenêtre (en jours) de la « Répartition par discipline » pour chaque période —
 * les autres métriques de la page (charge 7j, objectif mensuel, tendances) restent
 * sur leur fenêtre fixe, cf. domains/sport/index.ts. */
function periodDays(period: (typeof PERIODS)[number]): number {
  switch (period) {
    case '7 jours':
      return 7;
    case '28 jours':
      return 28;
    case 'Mois en cours': {
      const now = new Date();
      return now.getDate();
    }
    case 'Année':
      return 365;
    case 'Historique complet':
      return 3650;
  }
}

export function SportPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[1]);
  const state = useAsync(() => getSportOverview(periodDays(period)), [period]);

  return (
    <>
      <div className="breadcrumb">
        Espace personnel <span aria-hidden="true">›</span> <span className="current">Sport</span>
      </div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Sport</h1>
          <p className="page-sub">Charge, répartition par discipline et régularité de l'entraînement.</p>
        </div>
        <span className="page-badge">Source réelle · Strava</span>
      </div>

      <div className="filters">
        {PERIODS.map((p) => (
          <button key={p} className={`filter-pill${p === period ? ' active' : ''}`} onClick={() => setPeriod(p)}>
            {p}
          </button>
        ))}
      </div>

      <DataState state={state}>
        {(s) => {
          const monthPct = s.monthObjectiveHours > 0 ? (s.monthHoursExcludingEbike / s.monthObjectiveHours) * 100 : 0;
          return (
            <>
              <div className="grid grid-2" style={{ marginBottom: 14 }}>
                <Card>
                  <CardHead title="Activité & régularité" sub="7 derniers jours" badge={{ label: 'Sport' }} />
                  <div className="grid grid-3" style={{ marginBottom: 14 }}>
                    <div><div className="kpi-value" style={{ fontSize: 22 }}>{s.sessionsLast7d}</div><div className="card-title-sub">Séances / 7j</div></div>
                    <div><div className="kpi-value" style={{ fontSize: 22 }}>{s.loadLast7d}</div><div className="card-title-sub">Charge cumulée / 7j (min)</div></div>
                    <div><div className="kpi-value" style={{ fontSize: 22 }}>{Math.floor(s.durationLast7dMin / 60)}h{String(s.durationLast7dMin % 60).padStart(2, '0')}</div><div className="card-title-sub">Durée totale</div></div>
                  </div>
                  <div className="card-title-sub" style={{ marginBottom: 6, fontWeight: 600 }}>Répartition par discipline — {period.toLowerCase()}</div>
                  {s.disciplineSplit28d.length === 0 && <p className="card-title-sub">Aucune séance sur la période sélectionnée.</p>}
                  {s.disciplineSplit28d.map((d) => (
                    <div className="disc-row" key={d.name}>
                      <span className="disc-name">{d.name}</span>
                      <div className="disc-track"><div className="disc-fill" style={{ width: `${d.pct}%`, background: 'var(--teal)' }} /></div>
                      <span className="disc-pct">{d.pct} %</span>
                    </div>
                  ))}
                  <ProgressBar
                    name="Objectif mensuel — 1h/jour (hors vélo électrique)"
                    valueLabel={`${s.monthHoursExcludingEbike.toFixed(1)}h / ~${s.monthObjectiveHours}h · ${monthPct.toFixed(0)} %`}
                    pct={monthPct}
                  />
                  <CardFoot><span>Régularité : {s.regularity12w.avg} séances/semaine en moyenne sur 12 semaines.</span></CardFoot>
                </Card>

                <Card>
                  <CardHead title="Dernière séance" sub={s.lastSession ? `${s.lastSession.discipline} — ${s.lastSession.title || 'sans titre'}` : '—'} badge={{ label: 'Live' }} />
                  {s.lastSession ? (
                    <>
                      <div className="kpi-value" style={{ fontSize: 30, marginBottom: 12 }}>{s.lastSession.durationMin ?? '—'} min</div>
                      <div className="grid grid-3">
                        <div><div className="kpi-value" style={{ fontSize: 18 }}>{s.lastSession.distanceKm?.toFixed(1) ?? '—'} km</div><div className="card-title-sub">Distance</div></div>
                        <div><div className="kpi-value" style={{ fontSize: 18 }}>{s.lastSession.avgHr ?? '—'} bpm</div><div className="card-title-sub">FC moyenne</div></div>
                        <div><div className="kpi-value" style={{ fontSize: 18 }}>{s.lastSession.maxHr ?? '—'} bpm</div><div className="card-title-sub">FC pic</div></div>
                      </div>
                      <CardFoot><span>{new Date(s.lastSession.date).toLocaleDateString('fr-FR')} — dénivelé {s.lastSession.elevationM ?? '—'} m.</span></CardFoot>
                    </>
                  ) : (
                    <p className="card-title-sub">Aucune séance récente.</p>
                  )}
                </Card>
              </div>

              <div className="grid grid-2">
                <Card>
                  <CardHead title="Historique du volume" sub="12 derniers mois — heures d'entraînement" badge={{ label: 'Hors vélo électrique' }} />
                  {s.volume12m.values.length > 0 ? (
                    <BarChart values={s.volume12m.values} labels={s.volume12m.labels} formatValue={(v) => `${v}h`} highlightIndex={s.volume12m.values.indexOf(Math.max(...s.volume12m.values))} />
                  ) : (
                    <p className="card-title-sub">Pas assez d'historique.</p>
                  )}
                </Card>
                <Card>
                  <CardHead title="Régularité" sub="Séances par semaine — 12 dernières semaines" badge={{ label: `${s.regularity12w.avg} / sem. en moyenne` }} />
                  {s.regularity12w.values.length > 0 ? (
                    <BarChart values={s.regularity12w.values} labels={s.regularity12w.values.map((_, i) => `S-${s.regularity12w.values.length - 1 - i}`)} referenceValue={s.regularity12w.avg} height={180} />
                  ) : (
                    <p className="card-title-sub">Pas assez d'historique.</p>
                  )}
                </Card>
              </div>
            </>
          );
        }}
      </DataState>
    </>
  );
}
