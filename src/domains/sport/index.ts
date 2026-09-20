import { scoreSport } from '@/core/scoring/sport';
import { fetchSportSessions, isElectricBike, type SportSessionRow } from '@/data/sport/real';
import { fetchHealthDaily } from '@/data/health/real';

/** Charge de séance approximée par la durée (minutes) — la source réelle
 * (Strava) n'expose pas de charge d'entraînement calculée (type TRIMP/TSS).
 * Approximation à affiner si une vraie métrique de charge devient disponible. */
function sessionLoad(s: SportSessionRow): number {
  return s.durationMin ?? 0;
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
}

/** `splitWindowDays` contrôle la fenêtre de la « Répartition par discipline » —
 * c'est le réglage piloté par les boutons de période de la page Sport. Les autres
 * métriques (charge/durée 7j, objectif mensuel, tendances) restent sur leur fenêtre
 * fixe : ce sont des indicateurs définis par métrique figée, pas par la période
 * choisie à l'écran (docs/phase-0/04-metriques-figees.md). */
export async function getSportOverview(splitWindowDays = 28) {
  const [allSessions, healthRows] = await Promise.all([fetchSportSessions(365), fetchHealthDaily(60)]);
  const sessions = allSessions.filter((s) => !isElectricBike(s));

  const today = new Date().toISOString().slice(0, 10);
  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

  const last7 = sessions.filter((s) => s.date >= daysAgo(7));
  const last28 = sessions.filter((s) => s.date >= daysAgo(splitWindowDays));
  const last12Weeks = sessions.filter((s) => s.date >= daysAgo(84));

  const loadLast7Days = last7.reduce((sum, s) => sum + sessionLoad(s), 0);
  const loadLast28Days = last28.reduce((sum, s) => sum + sessionLoad(s), 0);
  const durationLast7dMin = last7.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);

  const daysSinceLastSession = sessions.length > 0 ? daysBetween(today, sessions[0].date) : Infinity;
  const avgIntervalDays = last12Weeks.length > 1 ? 84 / last12Weeks.length : 7;

  // Répartition par discipline (28 jours)
  const disciplineTotals = new Map<string, number>();
  for (const s of last28) disciplineTotals.set(s.discipline, (disciplineTotals.get(s.discipline) ?? 0) + 1);
  const totalCount28 = [...disciplineTotals.values()].reduce((a, b) => a + b, 0) || 1;
  const disciplineSplit28d = [...disciplineTotals.entries()]
    .map(([name, count]) => ({ name, pct: Math.round((count / totalCount28) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  // Historique 12 mois (heures)
  const volumeByMonth = new Map<string, number>();
  for (const s of sessions) {
    const key = s.date.slice(0, 7);
    volumeByMonth.set(key, (volumeByMonth.get(key) ?? 0) + (s.durationMin ?? 0) / 60);
  }
  const months = [...volumeByMonth.keys()].sort().slice(-12);
  const volume12m = {
    values: months.map((m) => Math.round(volumeByMonth.get(m) ?? 0)),
    labels: months.map((m) => new Date(`${m}-01`).toLocaleDateString('fr-FR', { month: 'short' })),
  };

  // Régularité 12 semaines (séances/semaine)
  const weekOf = (d: string) => {
    const date = new Date(d);
    const jan1 = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  };
  const byWeek = new Map<number, number>();
  for (const s of last12Weeks) byWeek.set(weekOf(s.date), (byWeek.get(weekOf(s.date)) ?? 0) + 1);
  const weekKeys = [...byWeek.keys()].sort((a, b) => a - b).slice(-12);
  const regularity12w = {
    values: weekKeys.map((w) => byWeek.get(w) ?? 0),
    avg: weekKeys.length ? Number((weekKeys.reduce((s, w) => s + (byWeek.get(w) ?? 0), 0) / weekKeys.length).toFixed(1)) : 0,
  };

  // Tendance FC repos (santé, même source que la page Santé — pas de recalcul divergent)
  const rhrToday = healthRows.slice(0, 7).map((r) => r.restingHr).filter((v): v is number => typeof v === 'number');
  const rhr5dAgo = healthRows.slice(5, 12).map((r) => r.restingHr).filter((v): v is number => typeof v === 'number');
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const restingHr = { today: rhrToday[0] ?? 0, movingAvgToday: avg(rhrToday), movingAvgWindowAgo: avg(rhr5dAgo) };

  // Tendance FC moyenne par discipline (5 dernières séances vs 20 précédentes)
  const disciplines = [...new Set(sessions.slice(0, 30).map((s) => s.discipline))].filter(Boolean);
  const disciplineTrends = disciplines
    .map((discipline) => {
      const sessionsOfDiscipline = sessions.filter((s) => s.discipline === discipline && s.avgHr);
      const recent = sessionsOfDiscipline.slice(0, 5);
      const baseline = sessionsOfDiscipline.slice(5, 25);
      if (recent.length === 0 || baseline.length === 0) return null;
      return {
        discipline,
        avgHrRecent: avg(recent.map((s) => s.avgHr!)),
        avgHrBaseline: avg(baseline.map((s) => s.avgHr!)),
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  const signals = scoreSport({ loadLast7Days, loadLast28Days, daysSinceLastSession, avgIntervalDays, restingHr, disciplineTrends });

  const lastSession = sessions[0];

  // Métrique figée : total du mois hors vélo électrique vs objectif 1h/jour
  // cumulé (docs/phase-0/04-metriques-figees.md).
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthSessions = sessions.filter((s) => s.date >= monthStart);
  const monthHoursExcludingEbike = monthSessions.reduce((sum, s) => sum + (s.durationMin ?? 0) / 60, 0);
  const monthObjectiveHours = daysInMonth;

  return {
    sessionsLast7d: last7.length,
    loadLast7d: Math.round(loadLast7Days),
    durationLast7dMin: Math.round(durationLast7dMin),
    lastSession,
    disciplineSplit28d,
    splitWindowDays,
    volume12m,
    regularity12w,
    monthHoursExcludingEbike,
    monthObjectiveHours,
    signals,
  };
}
