import { useState } from 'react';
import { Card, CardHead, CardFoot } from '@/design/components/Card';
import { ProgressBar } from '@/design/components/ProgressBar';
import { BarChart } from '@/charts/BarChart';
import { getSportOverview } from '@/domains/sport';

const PERIODS = ['7 jours', '28 jours', 'Mois en cours', 'Année', 'Historique complet'];

export function SportPage() {
  const s = getSportOverview();
  const [period, setPeriod] = useState(PERIODS[0]);
  const monthPct = (s.monthHoursExcludingEbike / s.monthObjectiveHours) * 100;

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
        <span className="page-badge">Maquette · données fictives</span>
      </div>

      <div className="filters">
        {PERIODS.map((p) => (
          <button key={p} className={`filter-pill${p === period ? ' active' : ''}`} onClick={() => setPeriod(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 14 }}>
        <Card>
          <CardHead title="Activité & régularité" sub="7 derniers jours" badge={{ label: 'Sport' }} />
          <div className="grid grid-3" style={{ marginBottom: 14 }}>
            <div><div className="kpi-value" style={{ fontSize: 22 }}>{s.sessionsLast7d}</div><div className="card-title-sub">Séances / 7j</div></div>
            <div><div className="kpi-value" style={{ fontSize: 22 }}>{s.loadLast7d}</div><div className="card-title-sub">Charge cumulée / 7j</div></div>
            <div><div className="kpi-value" style={{ fontSize: 22 }}>{Math.floor(s.durationLast7dMin / 60)}h{s.durationLast7dMin % 60}</div><div className="card-title-sub">Durée totale</div></div>
          </div>
          <div className="card-title-sub" style={{ marginBottom: 6, fontWeight: 600 }}>Répartition par discipline — 28 jours</div>
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
          <CardHead title="Dernière séance" sub={`${s.lastSession.discipline} — ${s.lastSession.name}`} badge={{ label: s.lastSession.isCompetition ? 'Compétition' : 'Séance', tone: 'coral' }} />
          <div className="kpi-value" style={{ fontSize: 30, marginBottom: 12 }}>{s.lastSession.durationMin} min</div>
          <div className="grid grid-3">
            <div><div className="kpi-value" style={{ fontSize: 18 }}>{s.lastSession.load}</div><div className="card-title-sub">Charge</div></div>
            <div><div className="kpi-value" style={{ fontSize: 18 }}>{s.lastSession.avgHr} bpm</div><div className="card-title-sub">FC moyenne</div></div>
            <div><div className="kpi-value" style={{ fontSize: 18 }}>{s.lastSession.maxHr} bpm</div><div className="card-title-sub">FC pic</div></div>
          </div>
          <CardFoot><span>Séance {s.lastSession.date}, comptée dans la charge des 7 derniers jours.</span></CardFoot>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <CardHead title="Historique du volume" sub="12 derniers mois — heures d'entraînement" badge={{ label: 'Pic : juillet · 22h' }} />
          <BarChart values={s.volume12m.values} labels={s.volume12m.labels} formatValue={(v) => `${v}h`} highlightIndex={s.volume12m.values.indexOf(Math.max(...s.volume12m.values))} />
          <CardFoot><span>Creux en février, montée continue jusqu'au pic estival.</span></CardFoot>
        </Card>
        <Card>
          <CardHead title="Régularité" sub="Séances par semaine — 12 dernières semaines" badge={{ label: `${s.regularity12w.avg} / sem. en moyenne` }} />
          <BarChart values={s.regularity12w.values} labels={s.regularity12w.values.map((_, i) => `S-${11 - i}`)} referenceValue={s.regularity12w.avg} height={180} />
          <CardFoot><span>Tendance stable, pas de semaine blanche sur la période.</span></CardFoot>
        </Card>
      </div>
    </>
  );
}
