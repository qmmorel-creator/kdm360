// Détecteurs Budget — voir docs/phase-0/06-regles-score-budget.md
import type { Signal } from './types';

export interface CategoryConsumption {
  categoryId: string;
  name: string;
  spent: number;
  allocated: number;
}

export interface BudgetScoringInput {
  categories: CategoryConsumption[];
  /** % du mois déjà écoulé, 0-100. */
  monthElapsedPct: number;
  /** revenus − dépenses du mois en cours. */
  monthBalance: number;
}

/** Plancher de dépense effective en dessous duquel une catégorie n'est jamais
 * remontée, quel que soit son % de consommation (06-regles-score-budget.md). */
const SPEND_FLOOR_EUR = 150;
const PROCHE_LIMITE_PTS = 8;
const DERIVE_PTS = 15;
const CRITIQUE_PTS = 25;

export function scoreBudget(input: BudgetScoringInput): Signal[] {
  const signals: Signal[] = [];

  for (const cat of input.categories) {
    if (cat.spent <= SPEND_FLOOR_EUR) continue;
    const consumedPct = (cat.spent / cat.allocated) * 100;
    const gap = consumedPct - input.monthElapsedPct;

    // Détecteur B — dépassement effectif : prioritaire, indépendant du rythme.
    if (consumedPct >= 100) {
      signals.push({
        domain: 'budget',
        detectorId: 'budget.B.depassement',
        severity: 'critique',
        score: 1000 + gap,
        title: `${cat.name} — budget dépassé`,
        description: `${cat.spent.toFixed(0)} € / ${cat.allocated.toFixed(0)} € consommés (${consumedPct.toFixed(0)} %).`,
        value: `${consumedPct.toFixed(0)} %`,
        valueSub: 'dépassement effectif',
      });
      continue;
    }

    // Détecteur A — rythme de consommation, trois paliers + critique.
    if (gap >= PROCHE_LIMITE_PTS) {
      const severity = gap >= CRITIQUE_PTS ? 'critique' : gap >= DERIVE_PTS ? 'dérive' : 'attention';
      signals.push({
        domain: 'budget',
        detectorId: 'budget.A.rythme',
        severity,
        score: gap,
        title: `${cat.name} — ${severity === 'attention' ? 'proche de la limite' : 'dérive de rythme'}`,
        description: `${cat.spent.toFixed(0)} € / ${cat.allocated.toFixed(0)} € (${consumedPct.toFixed(0)} %) pour ${input.monthElapsedPct.toFixed(0)} % du mois écoulé.`,
        value: `+${gap.toFixed(0)} pts`,
        valueSub: 'écart vs rythme',
      });
    }
  }

  // Détecteur C — solde mensuel négatif : prime toujours (score très élevé).
  if (input.monthBalance < 0) {
    signals.push({
      domain: 'budget',
      detectorId: 'budget.C.solde_negatif',
      severity: 'critique',
      score: 2000 + Math.abs(input.monthBalance),
      title: 'Solde du mois négatif',
      description: `Le solde du mois (revenus − dépenses) est passé à ${input.monthBalance.toFixed(0)} €.`,
      value: `${input.monthBalance.toFixed(0)} €`,
      valueSub: 'solde mensuel',
    });
  }

  return signals;
}
