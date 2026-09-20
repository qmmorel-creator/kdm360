import { scoreHealth } from '@/core/scoring/health';
import { healthToday, weightTrend, bodyFatTrend, caloricFactorDaysAbove1, userSettings, recovery7d, weight90d } from '@/data/health/mock';

export function getHealthOverview() {
  const signals = scoreHealth({
    recoveryToday: healthToday.recovery,
    recoveryAvg7d: healthToday.recoveryAvg7d,
    strainYesterday: healthToday.strainYesterday,
    spo2: healthToday.spo2,
    tempDeltaC: healthToday.tempDeltaC,
    sleepDurationMin: healthToday.sleep.durationMin,
    sleepNeedMin: healthToday.sleep.needMin,
    weight: { ...weightTrend, ceiling: userSettings.poidsPlafondKg },
    bodyFat: { ...bodyFatTrend, ceiling: userSettings.masseGraissePlafondPct },
    caloricFactorDaysAbove1,
  });
  return { today: healthToday, recovery7d, weight90d, signals };
}
