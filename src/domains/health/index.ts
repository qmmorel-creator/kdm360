import { scoreHealth } from '@/core/scoring/health';
import { fetchHealthDaily, type DailyHealthRow } from '@/data/health/real';

// Pas de "besoin de sommeil" dans la source réelle (Whoop expose seulement le
// sommeil réel) — valeur de repère fixe en attendant une vraie donnée. Signalé
// dans l'UI comme estimation, jamais présenté comme une mesure.
const ASSUMED_SLEEP_NEED_MIN = 8 * 60;

function movingAvg(rows: DailyHealthRow[], field: keyof DailyHealthRow, fromIndex: number, window = 7): number | undefined {
  const slice = rows.slice(fromIndex, fromIndex + window).map((r) => r[field]).filter((v): v is number => typeof v === 'number');
  if (slice.length === 0) return undefined;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function countRisingDays(rows: DailyHealthRow[], field: keyof DailyHealthRow, window = 5): number {
  // rows[0] = aujourd'hui, ordre décroissant. Compte les jours consécutifs où la
  // moyenne glissante 7j monte par rapport à la veille.
  let count = 0;
  for (let i = 0; i < window; i++) {
    const today = movingAvg(rows, field, i, 7);
    const yesterday = movingAvg(rows, field, i + 1, 7);
    if (today !== undefined && yesterday !== undefined && today > yesterday) count++;
    else break;
  }
  return count;
}

export async function getHealthOverview() {
  const rows = await fetchHealthDaily(120); // le plus récent en premier

  const today = rows[0];
  const recoveryAvg7d = movingAvg(rows, 'recoveryPct', 1, 7); // hors aujourd'hui
  const weightMovingAvgToday = movingAvg(rows, 'weightKg', 0, 7);
  const weightMovingAvg5dAgo = movingAvg(rows, 'weightKg', 5, 7);
  const bodyFatMovingAvgToday = movingAvg(rows, 'bodyFatPct', 0, 7);
  const bodyFatMovingAvg5dAgo = movingAvg(rows, 'bodyFatPct', 5, 7);

  const caloricFactorDaysAbove1 = (() => {
    let n = 0;
    for (const r of rows) {
      if (r.kcalConsumed && r.kcalExpended && r.kcalExpended > 0 && r.kcalConsumed / r.kcalExpended > 1) n++;
      else break;
    }
    return n;
  })();

  const signals = today
    ? scoreHealth({
        recoveryToday: today.recoveryPct ?? 0,
        recoveryAvg7d: recoveryAvg7d ?? today.recoveryPct ?? 0,
        strainYesterday: rows[1]?.strain ?? 0,
        spo2: today.spo2Pct ?? 100,
        tempDeltaC: 0, // pas de baseline fiable dans la source réelle — à affiner (issue de suivi)
        sleepDurationMin: (today.sleepHours ?? 0) * 60,
        sleepNeedMin: ASSUMED_SLEEP_NEED_MIN,
        weight: {
          today: today.weightKg ?? 0,
          movingAvgToday: weightMovingAvgToday ?? today.weightKg ?? 0,
          movingAvgWindowAgo: weightMovingAvg5dAgo ?? today.weightKg ?? 0,
          risingDays: countRisingDays(rows, 'weightKg'),
        },
        bodyFat: {
          today: today.bodyFatPct ?? 0,
          movingAvgToday: bodyFatMovingAvgToday ?? today.bodyFatPct ?? 0,
          movingAvgWindowAgo: bodyFatMovingAvg5dAgo ?? today.bodyFatPct ?? 0,
          risingDays: countRisingDays(rows, 'bodyFatPct'),
        },
        caloricFactorDaysAbove1,
      })
    : [];

  return {
    today,
    last7Recovery: rows.slice(0, 7).reverse(),
    last7Sleep: rows.slice(0, 7).reverse(),
    last90Weight: rows.slice(0, 90).filter((r) => r.weightKg !== undefined).reverse(),
    sleepNeedMin: ASSUMED_SLEEP_NEED_MIN,
    signals,
  };
}
