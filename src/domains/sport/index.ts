import { scoreSport } from '@/core/scoring/sport';
import { sportSummary } from '@/data/sport/mock';

export function getSportOverview() {
  const signals = scoreSport({
    loadLast7Days: sportSummary.loadLast7d,
    loadLast28Days: sportSummary.loadLast28d,
    daysSinceLastSession: sportSummary.daysSinceLastSession,
    avgIntervalDays: sportSummary.avgIntervalDays,
    restingHr: sportSummary.restingHr,
    disciplineTrends: sportSummary.disciplineTrends,
  });
  return { ...sportSummary, signals };
}
