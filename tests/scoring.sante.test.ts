import { describe, it, expect } from 'vitest';
import { scoreHealth } from '@/core/scoring/health';

const baseInput = {
  recoveryToday: 71,
  recoveryAvg7d: 60, // volontairement proche pour isoler le test A
  strainYesterday: 10,
  spo2: 97,
  tempDeltaC: 0.2,
  // Volontairement égal au besoin pour isoler chaque test — 6h42 vs 7h50 (valeurs
  // réelles de démo) déclenche à lui seul le détecteur D, testé séparément plus bas.
  sleepDurationMin: 7 * 60 + 50,
  sleepNeedMin: 7 * 60 + 50,
  weight: { today: 78.4, movingAvgToday: 78.4, movingAvgWindowAgo: 78.4, risingDays: 0, ceiling: 85 },
  bodyFat: { today: 15.2, movingAvgToday: 15.2, movingAvgWindowAgo: 15.2, risingDays: 0, ceiling: 18 },
  caloricFactorDaysAbove1: 0,
};

describe('scoreHealth', () => {
  it('signale une chute de récupération (>10 pts)', () => {
    const signals = scoreHealth({ ...baseInput, recoveryToday: 71, recoveryAvg7d: 83 });
    const s = signals.find((x) => x.detectorId === 'sante.A.recovery');
    expect(s).toBeDefined();
    expect(s?.severity).toBe('attention');
  });

  it('signale un surmenage quand strain élevé et recovery bas coïncident', () => {
    const signals = scoreHealth({ ...baseInput, strainYesterday: 18.2, recoveryToday: 60 });
    expect(signals.find((x) => x.detectorId === 'sante.B.surmenage')).toBeDefined();
  });

  it('signale une anomalie SpO2 basse indépendamment du reste', () => {
    const signals = scoreHealth({ ...baseInput, spo2: 92 });
    const s = signals.find((x) => x.detectorId === 'sante.C.anomalie');
    expect(s?.severity).toBe('critique');
  });

  it('signale une dette de sommeil au-delà de 45 minutes', () => {
    const signals = scoreHealth({ ...baseInput, sleepDurationMin: 6 * 60, sleepNeedMin: 7 * 60 + 50 });
    expect(signals.find((x) => x.detectorId === 'sante.D.sommeil')).toBeDefined();
  });

  it('déclenche une alerte critique au dépassement du plafond de poids', () => {
    const signals = scoreHealth({
      ...baseInput,
      weight: { today: 86, movingAvgToday: 86, movingAvgWindowAgo: 85.5, risingDays: 0, ceiling: 85 },
    });
    const s = signals.find((x) => x.detectorId === 'sante.E.weight_plafond');
    expect(s?.severity).toBe('critique');
  });

  it('signale une tendance haussière du poids même sous le plafond', () => {
    const signals = scoreHealth({
      ...baseInput,
      weight: { today: 79, movingAvgToday: 79, movingAvgWindowAgo: 78, risingDays: 5, ceiling: 85 },
    });
    expect(signals.find((x) => x.detectorId === 'sante.F.weight_tendance')).toBeDefined();
  });

  it('ne signale pas de tendance en dessous de 5 jours de hausse', () => {
    const signals = scoreHealth({
      ...baseInput,
      weight: { today: 79, movingAvgToday: 79, movingAvgWindowAgo: 78, risingDays: 3, ceiling: 85 },
    });
    expect(signals.find((x) => x.detectorId === 'sante.F.weight_tendance')).toBeUndefined();
  });

  it('signale un facteur calorique élevé après 3 jours consécutifs', () => {
    const signals = scoreHealth({ ...baseInput, caloricFactorDaysAbove1: 3 });
    expect(signals.find((x) => x.detectorId === 'sante.G.facteur_calorique')).toBeDefined();
  });

  it('ne signale rien sur un profil stable', () => {
    const signals = scoreHealth(baseInput);
    expect(signals).toHaveLength(0);
  });
});
