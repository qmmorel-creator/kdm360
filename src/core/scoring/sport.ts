// Détecteurs Sport — voir docs/phase-0/08-regles-score-sport.md
// Tous excluent le vélo électrique du calcul (cohérent avec la métrique figée
// Sport, 04-metriques-figees.md) — l'exclusion se fait en amont, dans la couche
// domains/sport qui construit ces agrégats, pas ici.
import type { Signal } from './types';

export interface DisciplineHrTrend {
  /** Nom de la discipline tel qu'il apparaît dans la source réelle (Strava) —
   * plus restreint aux seuls CrossFit/Running de la Phase 0 mock, une fois
   * branché sur les vraies données. */
  discipline: string;
  avgHrRecent: number; // moyenne des 5 dernières séances
  avgHrBaseline: number; // moyenne des 20 séances précédentes
}

export interface SportScoringInput {
  loadLast7Days: number;
  loadLast28Days: number;
  daysSinceLastSession: number;
  avgIntervalDays: number; // intervalle moyen habituel, 12 dernières semaines
  restingHr: { today: number; movingAvgToday: number; movingAvgWindowAgo: number };
  disciplineTrends: DisciplineHrTrend[];
}

const ACWR_SURCHARGE = 1.5;
const ACWR_SOUS_CHARGE = 0.8;
const REGULARITE_MULTIPLICATEUR = 2;
const RHR_HAUSSE_BPM = 3;
const DISCIPLINE_HAUSSE_BPM = 5;

export function scoreSport(input: SportScoringInput): Signal[] {
  const signals: Signal[] = [];

  // Détecteur A — charge aiguë vs chronique (ACWR).
  const chronicWeekly = input.loadLast28Days / 4;
  const acwr = chronicWeekly > 0 ? input.loadLast7Days / chronicWeekly : 0;
  if (acwr > ACWR_SURCHARGE) {
    signals.push({
      domain: 'sport',
      detectorId: 'sport.A.acwr_surcharge',
      severity: 'dérive',
      score: acwr * 10,
      title: 'Charge en forte hausse',
      description: `Ratio charge aiguë/chronique à ${acwr.toFixed(2)} (seuil ${ACWR_SURCHARGE}) — risque de surcharge.`,
      value: acwr.toFixed(2),
      valueSub: 'ratio ACWR',
    });
  } else if (acwr < ACWR_SOUS_CHARGE && acwr > 0) {
    signals.push({
      domain: 'sport',
      detectorId: 'sport.A.acwr_souscharge',
      severity: 'attention',
      score: (1 - acwr) * 10,
      title: 'Charge en net repli',
      description: `Ratio charge aiguë/chronique à ${acwr.toFixed(2)} (seuil ${ACWR_SOUS_CHARGE}) — déconditionnement possible.`,
      value: acwr.toFixed(2),
      valueSub: 'ratio ACWR',
    });
  }

  // Détecteur B — rupture de régularité.
  if (input.daysSinceLastSession > input.avgIntervalDays * REGULARITE_MULTIPLICATEUR) {
    signals.push({
      domain: 'sport',
      detectorId: 'sport.B.regularite',
      severity: 'attention',
      score: input.daysSinceLastSession - input.avgIntervalDays,
      title: 'Silence prolongé',
      description: `${input.daysSinceLastSession} jours sans séance, pour un intervalle moyen habituel de ${input.avgIntervalDays.toFixed(1)} jours.`,
      value: `${input.daysSinceLastSession} j`,
      valueSub: 'depuis dernière séance',
    });
  }

  // Détecteur D — tendance FC au repos.
  const rhrDelta = input.restingHr.movingAvgToday - input.restingHr.movingAvgWindowAgo;
  if (Math.abs(rhrDelta) >= RHR_HAUSSE_BPM) {
    const rising = rhrDelta > 0;
    signals.push({
      domain: 'sport',
      detectorId: 'sport.D.rhr_tendance',
      severity: rising ? 'attention' : 'attention',
      score: Math.abs(rhrDelta) * 10,
      title: rising ? 'FC au repos en hausse' : 'FC au repos en baisse',
      description: rising
        ? 'Fatigue accumulée ou surentraînement possible.'
        : 'Meilleure récupération cardiovasculaire.',
      value: `${rhrDelta > 0 ? '+' : ''}${rhrDelta.toFixed(1)} bpm`,
      valueSub: 'tendance FC repos',
    });
  }

  // Détecteurs E/F — tendance FC moyenne par discipline (CrossFit, Running).
  for (const trend of input.disciplineTrends) {
    const delta = trend.avgHrRecent - trend.avgHrBaseline;
    if (Math.abs(delta) >= DISCIPLINE_HAUSSE_BPM) {
      const rising = delta > 0;
      const slug = trend.discipline.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_');
      signals.push({
        domain: 'sport',
        detectorId: `sport.discipline_${slug}.fc_discipline`,
        severity: 'attention',
        score: Math.abs(delta) * 10,
        title: `${trend.discipline} — FC moyenne en ${rising ? 'hausse' : 'baisse'}`,
        description: rising
          ? `Fatigue/surentraînement possible sur ${trend.discipline}.`
          : `Meilleure condition physique sur ${trend.discipline} pour un effort équivalent.`,
        value: `${delta > 0 ? '+' : ''}${delta.toFixed(0)} bpm`,
        valueSub: 'vs baseline 20 séances',
      });
    }
  }

  return signals;
}
