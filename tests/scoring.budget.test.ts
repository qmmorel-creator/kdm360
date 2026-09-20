import { describe, it, expect } from 'vitest';
import { scoreBudget } from '@/core/scoring/budget';

// Valeurs reprises de prototypes/phase-0/shared/demo-data.md
const categories = [
  { categoryId: 'courses', name: 'Courses', spent: 415, allocated: 500 },
  { categoryId: 'transport', name: 'Transport', spent: 120, allocated: 150 },
  { categoryId: 'loisirs', name: 'Loisirs', spent: 180, allocated: 300 },
  { categoryId: 'restaurants', name: 'Restaurants', spent: 95, allocated: 120 },
  { categoryId: 'abonnements', name: 'Abonnements', spent: 68, allocated: 70 },
];

describe('scoreBudget', () => {
  it('remonte Courses en dérive (+17 pts) et pas Loisirs (normal)', () => {
    const signals = scoreBudget({ categories, monthElapsedPct: 66, monthBalance: 418 });
    const courses = signals.find((s) => s.title.startsWith('Courses'));
    expect(courses).toBeDefined();
    expect(courses?.severity).toBe('dérive');
    expect(courses?.score).toBeCloseTo(17, 0);
    expect(signals.find((s) => s.title.startsWith('Loisirs'))).toBeUndefined();
  });

  it('exclut Abonnements malgré 97 % consommé — sous le plancher de 150 €', () => {
    const signals = scoreBudget({ categories, monthElapsedPct: 66, monthBalance: 418 });
    expect(signals.find((s) => s.title.startsWith('Abonnements'))).toBeUndefined();
  });

  it('exclut Transport et Restaurants — sous le plancher de 150 € malgré leur écart de rythme', () => {
    // 06-regles-score-budget.md : le plancher de 150 € filtre AVANT le calcul de
    // rythme. Transport (120 €) et Restaurants (95 €) ont un écart de rythme
    // comparable à Courses, mais restent sous le plancher.
    const signals = scoreBudget({ categories, monthElapsedPct: 66, monthBalance: 418 });
    expect(signals.find((s) => s.title.startsWith('Transport'))).toBeUndefined();
    expect(signals.find((s) => s.title.startsWith('Restaurants'))).toBeUndefined();
  });

  it('remonte en "proche de la limite" une catégorie au-dessus du plancher avec un écart de 8-15 pts', () => {
    const signals = scoreBudget({
      categories: [{ categoryId: 'x', name: 'Grosse catégorie', spent: 300, allocated: 400 }], // 75%
      monthElapsedPct: 66, // écart 9 pts
      monthBalance: 418,
    });
    expect(signals[0].severity).toBe('attention');
  });

  it('détecte un dépassement effectif (≥100%) même sans un gros écart de rythme', () => {
    const signals = scoreBudget({
      categories: [{ categoryId: 'x', name: 'Test', spent: 500, allocated: 500 }],
      monthElapsedPct: 95,
      monthBalance: 100,
    });
    expect(signals[0].detectorId).toBe('budget.B.depassement');
    expect(signals[0].severity).toBe('critique');
  });

  it('signale un solde mensuel négatif en priorité absolue', () => {
    const signals = scoreBudget({ categories, monthElapsedPct: 66, monthBalance: -50 });
    const solde = signals.find((s) => s.detectorId === 'budget.C.solde_negatif');
    expect(solde?.severity).toBe('critique');
  });

  it('ne signale rien sur un mois sain (aucune catégorie en dérive, solde positif)', () => {
    const signals = scoreBudget({
      categories: [{ categoryId: 'a', name: 'A', spent: 200, allocated: 500 }],
      monthElapsedPct: 40,
      monthBalance: 300,
    });
    expect(signals).toHaveLength(0);
  });
});
