import { Card, CardHead } from '@/design/components/Card';
import { KpiTile } from '@/design/components/KpiTile';
import { WatchList } from '@/design/components/WatchList';
import { pickTopSignal, type Signal } from '@/core/scoring/types';
import { getBudgetOverview } from '@/domains/budget';
import { getHealthOverview } from '@/domains/health';
import { getSportOverview } from '@/domains/sport';
import { getSocialOverview } from '@/domains/social';

export function TodayPage() {
  const budget = getBudgetOverview();
  const health = getHealthOverview();
  const sport = getSportOverview();
  const social = getSocialOverview();

  // Sélection à l'affichage — un signal par domaine, priorité aux alertes
  // critiques (docs/phase-0/04-metriques-figees.md et 05-08-regles-score-*.md).
  const perDomain: Signal[] = [budget.signals, health.signals, sport.signals, social.signals]
    .map(pickTopSignal)
    .filter((s): s is Signal => !!s);

  const monthPct = (sport.monthHoursExcludingEbike / sport.monthObjectiveHours) * 100;

  return (
    <>
      <div className="breadcrumb">
        Espace personnel <span aria-hidden="true">›</span> <span className="current">Aujourd'hui</span>
      </div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Aujourd'hui</h1>
          <p className="page-sub">L'essentiel de votre journée en un coup d'œil — budget, corps, effort et relations.</p>
        </div>
        <span className="page-badge">Maquette · données fictives</span>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 14 }}>
        <KpiTile
          label="Budget du mois"
          value={`${budget.monthBalance >= 0 ? '+' : ''}${budget.monthBalance} €`}
          meta="+3 % vs mois précédent"
          metaDirection="up"
        />
        <KpiTile
          label="Poids / masse grasse"
          value={`${health.today.body.weightKg} kg`}
          meta={`${health.today.body.bodyFatPct} % masse grasse · dernière mesure`}
        />
        <KpiTile
          label="Objectif sport"
          value={`${monthPct.toFixed(0)} %`}
          meta={`${sport.monthHoursExcludingEbike.toFixed(1)}h / ~${sport.monthObjectiveHours}h, hors vélo électrique`}
        />
        <KpiTile label="Social" value={String(social.signals.length)} meta="Relances en attente" metaDirection={social.signals.length > 0 ? 'down' : 'neutral'} />
      </div>

      <Card>
        <CardHead title="À regarder" sub="Un signal par domaine, celui qui mérite votre attention aujourd'hui" badge={{ label: `${perDomain.length} signaux` }} />
        <WatchList signals={perDomain} />
      </Card>
    </>
  );
}
