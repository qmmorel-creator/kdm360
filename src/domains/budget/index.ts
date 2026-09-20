// Couche métier Budget — ne connaît rien de React. Combine la source de données
// et le moteur de score. Voir docs/architecture/01-architecture-technique.md.
import { scoreBudget, type CategoryConsumption } from '@/core/scoring/budget';
import { monthElapsedPct, monthIncome, monthExpense, monthSavings, wealthComposition, budgetTrajectory } from '@/data/finance/mock';

const CATEGORY_SPEND: CategoryConsumption[] = [
  { categoryId: 'cat-courses', name: 'Courses', spent: 415, allocated: 500 },
  { categoryId: 'cat-transport', name: 'Transport', spent: 120, allocated: 150 },
  { categoryId: 'cat-loisirs', name: 'Loisirs', spent: 180, allocated: 300 },
  { categoryId: 'cat-restaurants', name: 'Restaurants', spent: 95, allocated: 120 },
  { categoryId: 'cat-abonnements', name: 'Abonnements', spent: 68, allocated: 70 },
];

export function getBudgetOverview() {
  const monthBalance = monthIncome - monthExpense;
  const signals = scoreBudget({ categories: CATEGORY_SPEND, monthElapsedPct, monthBalance });
  return {
    monthIncome,
    monthExpense,
    monthBalance,
    monthSavings,
    monthElapsedPct,
    categories: CATEGORY_SPEND,
    wealthComposition,
    trajectory: budgetTrajectory,
    signals,
  };
}
