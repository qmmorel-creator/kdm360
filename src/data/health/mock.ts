// Adaptateur mock Santé — valeurs de prototypes/phase-0/shared/demo-data.md.
export const healthToday = {
  recovery: 71,
  recoveryYesterday: 83,
  recoveryAvg7d: 60,
  hrvMs: 58,
  hrvAvg7d: 60,
  restingHr: 52,
  strainYesterday: 18.2,
  spo2: 97,
  tempDeltaC: 0.2,
  sleep: { durationMin: 6 * 60 + 42, needMin: 7 * 60 + 50, performancePct: 86, efficiencyPct: 91, remPct: 22, swsPct: 18 },
  body: { weightKg: 78.4, weightDeltaKg30d: -0.3, bodyFatPct: 15.2, muscleMassKg: 61.8 },
  nutrition: { kcal: 2340, kcalGoal: 2400, proteinG: 148, proteinGoal: 160, carbsG: 210, kcalExpended: 2280 },
};

export const recovery7d = { values: [76, 80, 74, 79, 83, 83, 71], labels: ['J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'Hier', 'Auj.'] };
export const weight90d = { values: [79.1, 79.3, 78.9, 79.5, 78.7, 78.6, 78.4], labels: ['J-90', 'J-75', 'J-60', 'J-45', 'J-30', 'J-15', 'J-0'] };

// Fenêtre de tendance (5 jours) — poids stable ces derniers jours dans ce scénario,
// donc le détecteur F ne se déclenche pas par défaut (cohérent avec "-0,3kg/30j",
// tendance lente, pas une hausse rapide sur 5 jours).
export const weightTrend = { today: 78.4, movingAvgToday: 78.5, movingAvgWindowAgo: 78.7, risingDays: 0 };
export const bodyFatTrend = { today: 15.2, movingAvgToday: 15.2, movingAvgWindowAgo: 15.3, risingDays: 0 };
export const caloricFactorDaysAbove1 = 1; // pas encore 3 jours consécutifs — pas d'alerte
export const userSettings = { poidsPlafondKg: 85, masseGraissePlafondPct: 20 };
