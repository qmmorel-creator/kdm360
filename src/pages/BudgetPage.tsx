import { Card, CardHead, CardFoot } from '@/design/components/Card';
import { KpiTile } from '@/design/components/KpiTile';
import { ProgressBar } from '@/design/components/ProgressBar';
import { DataState } from '@/design/components/DataState';
import { LineAreaChart } from '@/charts/LineAreaChart';
import { Sankey } from '@/charts/Sankey';
import { useAsync } from '@/app/useAsync';
import { getBudgetOverview } from '@/domains/budget';
import { buildSankeyFromCategories } from '@/domains/budget/sankeyFromReal';

const WEALTH_COLORS = ['var(--teal-dark)', 'var(--teal)', 'var(--teal-pale)', 'var(--coral)', '#8f7fb0'];

export function BudgetPage() {
  const state = useAsync(getBudgetOverview, []);

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
        <span className="page-badge">Source réelle · Supabase</span>
      </div>

      <DataState state={state}>
        {(b) => (
          <>
            <div className="grid grid-4" style={{ marginBottom: 14 }}>
              <KpiTile label="Revenus" value={`${Math.round(b.monthIncome).toLocaleString('fr-FR')} €`} meta="Ce mois-ci" />
              <KpiTile label="Dépenses" value={`${Math.round(b.monthExpense).toLocaleString('fr-FR')} €`} meta="Ce mois-ci" />
              <KpiTile
                label="Solde"
                value={`${b.monthBalance >= 0 ? '+' : ''}${Math.round(b.monthBalance).toLocaleString('fr-FR')} €`}
                meta={b.monthBalance >= 0 ? 'Positif ce mois-ci' : 'Solde négatif ce mois-ci'}
                metaDirection={b.monthBalance >= 0 ? 'up' : 'down'}
              />
              <KpiTile label="Épargne" value={`${Math.round(b.monthSavings).toLocaleString('fr-FR')} €`} meta="Ce mois-ci" />
            </div>

            <div className="grid grid-2" style={{ marginBottom: 14 }}>
              <Card>
                <CardHead title="Trajectoire du patrimoine" sub="12 derniers mois" badge={{ label: 'Relevés mensuels' }} />
                {b.trajectory.values.length > 1 ? (
                  <LineAreaChart
                    points={b.trajectory.values}
                    labels={b.trajectory.labels}
                    formatValue={(v) => `${v >= 0 ? '+' : ''}${Math.round(v).toLocaleString('fr-FR')}`}
                  />
                ) : (
                  <p className="card-title-sub">Pas assez de relevés de solde historiques pour tracer une trajectoire.</p>
                )}
                <CardFoot>
                  <span>Somme des relevés de solde (finance_account_balances) par mois.</span>
                </CardFoot>
              </Card>

              <Card>
                <CardHead
                  title="Rythme de consommation"
                  sub={`${b.monthElapsedPct} % du mois écoulé`}
                  badge={{ label: `${b.signals.filter((s) => s.detectorId.startsWith('budget.A') || s.detectorId.startsWith('budget.B')).length} signal(aux)`, tone: 'coral' }}
                />
                {b.categories.length === 0 && <p className="card-title-sub">Aucune catégorie budgétée ce mois-ci.</p>}
                {b.categories.map((c) => {
                  const pct = (c.spent / c.allocated) * 100;
                  const gap = pct - b.monthElapsedPct;
                  return (
                    <ProgressBar
                      key={c.categoryId}
                      name={c.name}
                      valueLabel={`${Math.round(c.spent)} € / ${Math.round(c.allocated)} € · ${pct.toFixed(0)} %`}
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

            <div className="grid grid-2" style={{ marginBottom: 14 }}>
              <Card>
                <CardHead title="Patrimoine" sub="Vue consolidée" badge={{ label: `${b.wealthComposition.breakdown.length} types de compte` }} />
                <div className="kpi-value" style={{ fontSize: 30, marginBottom: 10 }}>
                  {Math.round(b.wealthComposition.total).toLocaleString('fr-FR')} €
                </div>
                <div className="wealth-bar">
                  {b.wealthComposition.breakdown.map((w, i) => (
                    <div key={w.type} style={{ width: `${w.pct}%`, background: WEALTH_COLORS[i % WEALTH_COLORS.length] }} />
                  ))}
                </div>
                <div className="wealth-legend">
                  {b.wealthComposition.breakdown.map((w, i) => (
                    <span className="legend-item" key={w.type}>
                      <span className="legend-dot" style={{ background: WEALTH_COLORS[i % WEALTH_COLORS.length] }} />
                      {w.type} · {w.pct} %
                    </span>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHead title="Dernières transactions" sub="5 mouvements les plus récents" badge={{ label: 'Live' }} />
                <table>
                  <thead>
                    <tr><th>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th></tr>
                  </thead>
                  <tbody>
                    {b.recentTransactions.map((t) => (
                      <tr key={t.transaction_id}>
                        <td>{new Date(t.effective_date).toLocaleDateString('fr-FR')}</td>
                        <td>{t.merchant ?? '—'}</td>
                        <td><span className="tag">{t.category ?? '—'}</span></td>
                        <td className={t.signed_amount < 0 ? 'amount-neg' : 'amount-pos'}>
                          {t.signed_amount >= 0 ? '+' : ''}{t.signed_amount.toLocaleString('fr-FR')} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            <Card>
              <CardHead title="Exploration des flux" sub="Sankey des flux financiers" badge={{ label: 'Verrouillé' }} />
              {(() => {
                const sk = buildSankeyFromCategories(b.categories, b.monthIncome);
                return sk.nodes.length > 1 ? (
                  <Sankey title="Sankey mensuel" columns={sk.columns} nodes={sk.nodes} links={sk.links} />
                ) : (
                  <p className="card-title-sub">Pas assez de mouvements ce mois-ci pour tracer le Sankey.</p>
                );
              })()}
              <CardFoot>
                <span>Sankey OS360 — rendu figé, réimplémenté fidèlement (voir docs/phase-0/02-sankey-reference.md).</span>
              </CardFoot>
            </Card>
          </>
        )}
      </DataState>
    </>
  );
}
