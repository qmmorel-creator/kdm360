// Adaptateur mock Sport — valeurs de prototypes/phase-0/shared/demo-data.md.
export const sportSummary = {
  sessionsLast7d: 5,
  loadLast7d: 41.2,
  durationLast7dMin: 4 * 60 + 52,
  loadLast28d: 41.2 * 4 * 1.05,
  avgIntervalDays: 7 / 4.2,
  daysSinceLastSession: 1,
  lastSession: {
    discipline: 'CrossFit', name: 'Open 26.3', date: 'hier', durationMin: 24, load: 9.1, avgHr: 168, maxHr: 184, isCompetition: true,
  },
  disciplineSplit28d: [
    { name: 'CrossFit', pct: 45 },
    { name: 'Course', pct: 30 },
    { name: 'Vélo', pct: 15 },
    { name: 'Trail', pct: 10 },
  ],
  volume12m: { values: [14, 12, 10, 11, 9, 13, 16, 18, 20, 22, 19, 15], labels: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'] },
  regularity12w: { values: [4, 5, 3, 4, 5, 4, 3, 4, 5, 4, 5, 4], avg: 4.2 },
  restingHr: { today: 52, movingAvgToday: 52, movingAvgWindowAgo: 52 },
  disciplineTrends: [
    { discipline: 'CrossFit' as const, avgHrRecent: 170, avgHrBaseline: 166 },
    { discipline: 'Running' as const, avgHrRecent: 149, avgHrBaseline: 150 },
  ],
  // Total du mois hors vélo électrique, objectif 1h/jour cumulé (04-metriques-figees.md).
  monthHoursExcludingEbike: 19.07,
  monthObjectiveHours: 30,
};
