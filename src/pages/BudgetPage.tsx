import { Card, CardHead, CardFoot } from '@/design/components/Card';
import { KpiTile } from '@/design/components/KpiTile';
import { ProgressBar } from '@/design/components/ProgressBar';
import { LineAreaChart } from '@/charts/LineAreaChart';
import { Sankey } from '@/charts/Sankey';
import { getBudgetOverview } from '@/domains/budget';
import { sankeyMonthly } from '@/domains/budget/sankeyMock';

export function BudgetPage() {
  const b = getBudgetOverview();

  return (
    <>
      <div className="breadcrumb">
        Espace personnel <span aria-hidden="true">›</span> <span className="current">Budget</span>
      </div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-sub">Le mois en cours, la trajectoire de trésorerie et le rythme de consommation par catégorie.</p>
        </div>
        <span className="page-badge">Maquette · données fictives</span>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <KpiTile label="Revenus" value={`${b.monthIncome.toLocaleString('fr-FR')} €`} meta="Ce mois-ci" />
        <KpiTile label="Dépenses" value={`${b.monthExpense.toLocaleString('fr-FR')} €`} meta="Ce mois-ci" />
        <KpiTile
          label="Solde"
          value={`${b.monthBalance >= 0 ? '+' : ''}${b.monthBalance.toLocaleString('fr-FR')} €`}
          meta={b.monthBalance >= 0 ? '+3 % vs mois précédent' : 'Solde négatif ce mois-ci'}
          metaDirection={b.monthBalance >= 0 ? 'up' : 'down'}
        />
        <KpiTile label="Épargne" value={`${b.monthSavings.toLocaleString('fr-FR')} €`} meta="Automatique, hors calcul dépenses" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 14 }}>
        <Card>
          <CardHead title="Trajectoire du solde" sub="12 derniers mois" badge={{ label: 'Oct. — Sept.' }} />
          <LineAreaChart
            points={b.trajectory.values}
            labels={b.trajectory.labels}
            formatValue={(v) => `${v >= 0 ? '+' : ''}${v}`}
          />
          <CardFoot>
            <span>Aire teintée = zone positive du solde mensuel.</span>
          </CardFoot>
        </Card>

        <Card>
          <CardHead
            title="Rythme de consommation"
            sub={`${b.monthElapsedPct} % du mois écoulé`}
            badge={{ label: `${b.categories.filter((c) => c.spent / c.allocated * 100 - b.monthElapsedPct >= 15).length} dérives`, tone: 'coral' }}
          />
          {b.categories.map((c) => {
            const pct = (c.spent / c.allocated) * 100;
            const gap = pct - b.monthElapsedPct;
            return (
              <ProgressBar
                key={c.categoryId}
                name={c.name}
                valueLabel={`${c.spent} € / ${c.allocated} € · ${pct.toFixed(0)} %`}
                pct={pct}
                targetPct={b.monthElapsedPct}
                tone={gap >= 15 ? 'coral' : 'teal'}
              />
            );
          })}
          <CardFoot>
            <span>Rythme ≠ dépassement de budget.</span>
          </CardFoot>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <CardHead title="Patrimoine" sub="Vue consolidée" badge={{ label: '+2,1 % · 3 mois' }} />
          <div className="kpi-value" style={{ fontSize: 30, marginBottom: 10 }}>
            {b.wealthComposition.total.toLocaleString('fr-FR')} €
          </div>
          <div className="wealth-bar">
            <div style={{ width: `${b.wealthComposition.epargne}%`, background: 'var(--teal-dark)' }} />
            <div style={{ width: `${b.wealthComposition.investissements}%`, background: 'var(--teal)' }} />
            <div style={{ width: `${b.wealthComposition.liquidites}%`, background: 'var(--teal-pale)' }} />
          </div>
          <div className="wealth-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--teal-dark)' }} />Épargne · {b.wealthComposition.epargne} %</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--teal)' }} />Investissements · {b.wealthComposition.investissements} %</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--teal-pale)' }} />Liquidités · {b.wealthComposition.liquidites} %</span>
          </div>
        </Card>

        <Card>
          <CardHead title="Exploration des flux" sub="Sankey des flux financiers" badge={{ label: 'Verrouillé' }} />
          <Sankey
            title="Sankey mensuel"
            columns={sankeyMonthly.columns}
            nodes={sankeyMonthly.nodes}
            links={sankeyMonthly.links}
          />
          <CardFoot>
            <span>Sankey OS360 — rendu figé, réimplémenté fidèlement (voir docs/phase-0/02-sankey-reference.md).</span>
          </CardFoot>
        </Card>
      </div>
    </>
  );
}
