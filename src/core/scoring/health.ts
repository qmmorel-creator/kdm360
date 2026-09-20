// Détecteurs Santé — voir docs/phase-0/07-regles-score-sante.md
import type { Signal } from './types';

export interface TrendInput {
  today: number;
  movingAvgToday: number;
  /** Moyenne glissante il y a `risingWindowDays` jours — pour juger la tendance. */
  movingAvgWindowAgo: number;
  /** Nombre de jours consécutifs où la valeur brute ET la moyenne glissante montent. */
  risingDays: number;
  /** Plafond réglé par l'utilisateur (réglages KDM360, pas une source maître). */
  ceiling?: number;
}

export interface HealthScoringInput {
  recoveryToday: number;
  recoveryAvg7d: number;
  strainYesterday: number;
  spo2: number;
  tempDeltaC: number;
  sleepDurationMin: number;
  sleepNeedMin: number;
  weight: TrendInput;
  bodyFat: TrendInput;
  /** Nombre de jours consécutifs où calories consommées / calories dépensées > 1. */
  caloricFactorDaysAbove1: number;
}

const RECOVERY_ATTENTION_PTS = 10;
const RECOVERY_CRITIQUE_PTS = 20;
const STRAIN_SEUIL = 15;
const RECOVERY_SURMENAGE_SEUIL = 65;
const SPO2_SEUIL = 95;
const TEMP_SEUIL_C = 0.5;
const SLEEP_DEBT_ATTENTION_MIN = 45;
const SLEEP_DEBT_CRITIQUE_MIN = 90;
const TREND_WINDOW_DAYS = 5;
const CALORIC_FACTOR_WINDOW_DAYS = 3;

function scoreTrend(kind: 'poids' | 'masse grasse', unit: string, t: TrendInput): Signal[] {
  const signals: Signal[] = [];
  const id = kind === 'poids' ? 'weight' : 'bodyfat';

  // Détecteur E — plafond configurable : alerte critique systématique.
  if (t.ceiling !== undefined && t.today > t.ceiling) {
    signals.push({
      domain: 'sante',
      detectorId: `sante.E.${id}_plafond`,
      severity: 'critique',
      score: 1000 + (t.today - t.ceiling),
      title: `${kind[0].toUpperCase()}${kind.slice(1)} au-dessus du plafond`,
      description: `${t.today}${unit} dépasse le plafond réglé (${t.ceiling}${unit}).`,
      value: `${t.today}${unit}`,
      valueSub: 'plafond dépassé',
    });
  }

  // Détecteur F — tendance haussière, même sous le plafond.
  if (t.risingDays >= TREND_WINDOW_DAYS && t.movingAvgToday > t.movingAvgWindowAgo) {
    const slope = (t.movingAvgToday - t.movingAvgWindowAgo) / TREND_WINDOW_DAYS;
    signals.push({
      domain: 'sante',
      detectorId: `sante.F.${id}_tendance`,
      severity: 'attention',
      score: slope * 100,
      title: `${kind[0].toUpperCase()}${kind.slice(1)} en tendance haussière`,
      description: `Moyenne glissante en hausse sur ${t.risingDays} jours consécutifs.`,
      value: `+${slope.toFixed(2)}${unit}/j`,
      valueSub: 'tendance 5 j',
    });
  }

  return signals;
}

export function scoreHealth(input: HealthScoringInput): Signal[] {
  const signals: Signal[] = [];

  // Détecteur A — chute de récupération.
  const recoveryGap = input.recoveryAvg7d - input.recoveryToday;
  if (recoveryGap > RECOVERY_ATTENTION_PTS) {
    signals.push({
      domain: 'sante',
      detectorId: 'sante.A.recovery',
      severity: recoveryGap > RECOVERY_CRITIQUE_PTS ? 'critique' : 'attention',
      score: recoveryGap,
      title: 'Récupération en baisse',
      description: `Recovery à ${input.recoveryToday} % contre une moyenne 7 jours de ${input.recoveryAvg7d} %.`,
      value: `-${recoveryGap.toFixed(0)} pts`,
      valueSub: 'récupération',
    });
  }

  // Détecteur B — surmenage (combinaison strain élevé + récupération basse).
  if (input.strainYesterday > STRAIN_SEUIL && input.recoveryToday < RECOVERY_SURMENAGE_SEUIL) {
    signals.push({
      domain: 'sante',
      detectorId: 'sante.B.surmenage',
      severity: 'dérive',
      score: input.strainYesterday + (RECOVERY_SURMENAGE_SEUIL - input.recoveryToday),
      title: 'Signes de surmenage',
      description: `Strain élevé hier (${input.strainYesterday}/21) combiné à une récupération basse (${input.recoveryToday} %).`,
      value: `${input.strainYesterday}/21`,
      valueSub: 'strain hier',
    });
  }

  // Détecteur C — anomalie physiologique isolée.
  if (input.spo2 < SPO2_SEUIL || input.tempDeltaC > TEMP_SEUIL_C) {
    signals.push({
      domain: 'sante',
      detectorId: 'sante.C.anomalie',
      severity: 'critique',
      score: (SPO2_SEUIL - input.spo2) * 10 + input.tempDeltaC * 10,
      title: 'Anomalie physiologique',
      description:
        input.spo2 < SPO2_SEUIL
          ? `SpO2 à ${input.spo2} %, sous le seuil de ${SPO2_SEUIL} %.`
          : `Température à +${input.tempDeltaC}°C vs baseline.`,
      value: input.spo2 < SPO2_SEUIL ? `${input.spo2} %` : `+${input.tempDeltaC}°C`,
      valueSub: 'signal isolé',
    });
  }

  // Détecteur D — dette de sommeil.
  const sleepDebt = input.sleepNeedMin - input.sleepDurationMin;
  if (sleepDebt > SLEEP_DEBT_ATTENTION_MIN) {
    signals.push({
      domain: 'sante',
      detectorId: 'sante.D.sommeil',
      severity: sleepDebt > SLEEP_DEBT_CRITIQUE_MIN ? 'critique' : 'attention',
      score: sleepDebt,
      title: 'Dette de sommeil',
      description: `${Math.round(input.sleepDurationMin / 60)}h${input.sleepDurationMin % 60} dormies pour un besoin de ${Math.round(input.sleepNeedMin / 60)}h${input.sleepNeedMin % 60}.`,
      value: `-${Math.round(sleepDebt)} min`,
      valueSub: 'vs besoin',
    });
  }

  // Détecteurs E/F — poids et masse grasse, même logique appliquée deux fois.
  signals.push(...scoreTrend('poids', ' kg', input.weight));
  signals.push(...scoreTrend('masse grasse', ' %', input.bodyFat));

  // Détecteur G — facteur calorique en tendance haute.
  if (input.caloricFactorDaysAbove1 >= CALORIC_FACTOR_WINDOW_DAYS) {
    signals.push({
      domain: 'sante',
      detectorId: 'sante.G.facteur_calorique',
      severity: 'attention',
      score: input.caloricFactorDaysAbove1 * 10,
      title: 'Facteur calorique élevé',
      description: `Calories consommées supérieures aux calories dépensées depuis ${input.caloricFactorDaysAbove1} jours consécutifs.`,
      value: `${input.caloricFactorDaysAbove1} j`,
      valueSub: 'facteur > 1',
    });
  }

  return signals;
}
