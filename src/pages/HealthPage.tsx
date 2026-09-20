import { Card, CardHead, CardFoot } from '@/design/components/Card';
import { ProgressBar } from '@/design/components/ProgressBar';
import { BarChart } from '@/charts/BarChart';
import { LineAreaChart } from '@/charts/LineAreaChart';
import { getHealthOverview } from '@/domains/health';

export function HealthPage() {
  const h = getHealthOverview();
  const t = h.today;

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
        <span className="page-badge">Maquette · données fictives</span>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 14 }}>
        <Card>
          <CardHead title="Récupération" sub="Indicateurs physiologiques du jour" badge={{ label: 'Whoop' }} />
          <ProgressBar name="Recovery" valueLabel={`${t.recovery} % · hier ${t.recoveryYesterday} %`} pct={t.recovery} targetPct={t.recoveryYesterday} tone={t.recovery < t.recoveryYesterday - 10 ? 'coral' : 'teal'} />
          <ProgressBar name="HRV" valueLabel={`${t.hrvMs} ms · moyenne 7j ${t.hrvAvg7d} ms`} pct={(t.hrvMs / 100) * 100} targetPct={(t.hrvAvg7d / 100) * 100} />
          <ProgressBar name="FC repos" valueLabel={`${t.restingHr} bpm · stable`} pct={(t.restingHr / 100) * 100} />
          <div className="grid grid-3" style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
            <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.spo2} %</div><div className="card-title-sub">SpO2</div></div>
            <div><div className="kpi-value" style={{ fontSize: 18 }}>+{t.tempDeltaC} °C</div><div className="card-title-sub">Température vs baseline</div></div>
            <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.strainYesterday}/21</div><div className="card-title-sub">Strain hier</div></div>
          </div>
        </Card>

        <Card>
          <CardHead title="Sommeil" sub="Nuit précédente" badge={{ label: `${Math.floor(t.sleep.durationMin / 60)}h${t.sleep.durationMin % 60} / ${Math.floor(t.sleep.needMin / 60)}h${t.sleep.needMin % 60}` }} />
          <ProgressBar name="Durée de sommeil" valueLabel={`${Math.floor(t.sleep.durationMin / 60)}h${t.sleep.durationMin % 60} · besoin ${Math.floor(t.sleep.needMin / 60)}h${t.sleep.needMin % 60}`} pct={(t.sleep.durationMin / t.sleep.needMin) * 100} targetPct={100} tone={t.sleep.durationMin < t.sleep.needMin - 45 ? 'coral' : 'teal'} />
          <ProgressBar name="Performance" valueLabel={`${t.sleep.performancePct} % · cible 90 %`} pct={t.sleep.performancePct} targetPct={90} />
          <div className="grid grid-3" style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
            <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.sleep.efficiencyPct} %</div><div className="card-title-sub">Efficacité</div></div>
            <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.sleep.remPct} %</div><div className="card-title-sub">Sommeil REM</div></div>
            <div><div className="kpi-value" style={{ fontSize: 18 }}>{t.sleep.swsPct} %</div><div className="card-title-sub">Sommeil profond</div></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 14 }}>
        <Card>
          <CardHead title="Composition corporelle" sub="Dernière mesure" badge={{ label: '90 jours' }} />
          <div className="grid grid-3" style={{ marginBottom: 12 }}>
            <div><div className="kpi-value" style={{ fontSize: 22 }}>{t.body.weightKg} kg</div><div className="card-title-sub">Poids ({t.body.weightDeltaKg30d} kg / 30j)</div></div>
            <div><div className="kpi-value" style={{ fontSize: 22 }}>{t.body.bodyFatPct} %</div><div className="card-title-sub">Masse grasse</div></div>
            <div><div className="kpi-value" style={{ fontSize: 22 }}>{t.body.muscleMassKg} kg</div><div className="card-title-sub">Masse musculaire</div></div>
          </div>
          <div className="card-title-sub" style={{ marginBottom: 6, fontWeight: 600 }}>Poids — 90 derniers jours</div>
          <LineAreaChart points={h.weight90d.values} labels={h.weight90d.labels} formatValue={(v) => `${v.toFixed(1)} kg`} height={180} />
          <CardFoot><span>Tendance suivie par le détecteur de plafond/tendance (docs/phase-0/07-regles-score-sante.md).</span></CardFoot>
        </Card>

        <Card>
          <CardHead title="Nutrition" sub="Hier" badge={{ label: 'Nutrition' }} />
          <ProgressBar name="Calories" valueLabel={`${t.nutrition.kcal} kcal / ${t.nutrition.kcalGoal} kcal`} pct={(t.nutrition.kcal / t.nutrition.kcalGoal) * 100} targetPct={100} />
          <ProgressBar name="Protéines" valueLabel={`${t.nutrition.proteinG} g / ${t.nutrition.proteinGoal} g`} pct={(t.nutrition.proteinG / t.nutrition.proteinGoal) * 100} targetPct={100} />
          <ProgressBar name="Glucides" valueLabel={`${t.nutrition.carbsG} g · sans objectif`} pct={70} />
          <div className="card-title-sub" style={{ marginTop: 8 }}>
            Facteur calorique (consommé/dépensé) : {(t.nutrition.kcal / t.nutrition.kcalExpended).toFixed(2)}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Récupération — 7 derniers jours" sub="Score quotidien Whoop" badge={{ label: `${t.recoveryYesterday - t.recovery} pts vs hier`, tone: 'coral' }} />
        <BarChart values={h.recovery7d.values} labels={h.recovery7d.labels} formatValue={(v) => `${v} %`} highlightIndex={h.recovery7d.values.length - 1} height={180} />
      </Card>
    </>
  );
}
