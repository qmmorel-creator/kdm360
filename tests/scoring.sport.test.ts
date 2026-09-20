import { describe, it, expect } from 'vitest';
import { scoreSport } from '@/core/scoring/sport';

const baseInput = {
  loadLast7Days: 41.2,
  loadLast28Days: 41.2 * 4, // ratio ~1 par construction
  daysSinceLastSession: 1,
  avgIntervalDays: 1.7, // ~4,2 séances/semaine
  restingHr: { today: 52, movingAvgToday: 52, movingAvgWindowAgo: 52 },
  disciplineTrends: [],
};

describe('scoreSport', () => {
  it('signale une surcharge quand le ratio ACWR dépasse 1,5', () => {
    const signals = scoreSport({ ...baseInput, loadLast7Days: 90, loadLast28Days: 41.2 * 4 });
    expect(signals.find((s) => s.detectorId === 'sport.A.acwr_surcharge')).toBeDefined();
  });

  it('signale une sous-charge quand le ratio ACWR passe sous 0,8', () => {
    const signals = scoreSport({ ...baseInput, loadLast7Days: 5, loadLast28Days: 41.2 * 4 });
    expect(signals.find((s) => s.detectorId === 'sport.A.acwr_souscharge')).toBeDefined();
  });

  it('signale une rupture de régularité au-delà de 2x l\'intervalle moyen', () => {
    const signals = scoreSport({ ...baseInput, daysSinceLastSession: 10, avgIntervalDays: 1.7 });
    expect(signals.find((s) => s.detectorId === 'sport.B.regularite')).toBeDefined();
  });

  it('signale une tendance FC repos en hausse', () => {
    const signals = scoreSport({
      ...baseInput,
      restingHr: { today: 55, movingAvgToday: 55, movingAvgWindowAgo: 51 },
    });
    expect(signals.find((s) => s.detectorId === 'sport.D.rhr_tendance')).toBeDefined();
  });

  it('signale une tendance FC CrossFit et Running séparément', () => {
    const signals = scoreSport({
      ...baseInput,
      disciplineTrends: [
        { discipline: 'CrossFit', avgHrRecent: 172, avgHrBaseline: 165 },
        { discipline: 'Running', avgHrRecent: 150, avgHrBaseline: 150 },
      ],
    });
    expect(signals.find((s) => s.detectorId === 'sport.E.fc_discipline')).toBeDefined();
    expect(signals.find((s) => s.detectorId === 'sport.F.fc_discipline')).toBeUndefined();
  });

  it('ne signale rien sur un profil stable', () => {
    const signals = scoreSport(baseInput);
    expect(signals).toHaveLength(0);
  });
});
