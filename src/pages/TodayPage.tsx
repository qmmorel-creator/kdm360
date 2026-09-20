import { Card, CardHead } from '@/design/components/Card';
import { KpiTile } from '@/design/components/KpiTile';
import { WatchList } from '@/design/components/WatchList';
import { DataState } from '@/design/components/DataState';
import { useAsync } from '@/app/useAsync';
import { pickTopSignal, type Signal } from '@/core/scoring/types';
import { getBudgetOverview } from '@/domains/budget';
import { getHealthOverview } from '@/domains/health';
import { getSportOverview } from '@/domains/sport';
import { getSocialOverview } from '@/domains/social';

async function loadToday() {
  const [budget, health, sport, social] = await Promise.all([
    getBudgetOverview(),
    getHealthOverview(),
    getSportOverview(),
    Promise.resolve(getSocialOverview()), // Social reste mock — voir issue de suivi
  ]);
  return { budget, health, sport, social };
}

export function TodayPage() {
  const state = useAsync(loadToday, []);

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
        <span className="page-badge">Sources réelles (Social : mock)</span>
      </div>

      <DataState state={state}>
        {({ budget, health, sport, social }) => {
          const perDomain: Signal[] = [budget.signals, health.signals, sport.signals, social.signals]
            .map(pickTopSignal)
            .filter((s): s is Signal => !!s);

          const monthPct = sport.monthObjectiveHours > 0 ? (sport.monthHoursExcludingEbike / sport.monthObjectiveHours) * 100 : 0;
          const t = health.today;

          return (
            <>
              <div className="grid grid-4" style={{ marginBottom: 14 }}>
                <KpiTile
                  label="Budget du mois"
                  value={`${budget.monthBalance >= 0 ? '+' : ''}${Math.round(budget.monthBalance)} €`}
                  meta={budget.monthBalance >= 0 ? 'Positif' : 'Négatif ce mois-ci'}
                  metaDirection={budget.monthBalance >= 0 ? 'up' : 'down'}
                />
                <KpiTile
                  label="Poids / masse grasse"
                  value={t?.weightKg ? `${t.weightKg} kg` : '—'}
                  meta={t?.bodyFatPct ? `${t.bodyFatPct} % masse grasse · ${t.date}` : 'Dernière mesure indisponible'}
                />
                <KpiTile
                  label="Objectif sport"
                  value={`${monthPct.toFixed(0)} %`}
                  meta={`${sport.monthHoursExcludingEbike.toFixed(1)}h / ~${sport.monthObjectiveHours}h, hors vélo électrique`}
                />
                <KpiTile label="Social" value={String(social.signals.length)} meta="Relances en attente (mock)" metaDirection={social.signals.length > 0 ? 'down' : 'neutral'} />
              </div>

              <Card>
                <CardHead title="À regarder" sub="Un signal par domaine, celui qui mérite votre attention aujourd'hui" badge={{ label: `${perDomain.length} signaux` }} />
                <WatchList signals={perDomain} />
              </Card>
            </>
          );
        }}
      </DataState>
    </>
  );
}
