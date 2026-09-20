// Couche métier Budget — données réelles (Supabase, projet kdm360).
import { scoreBudget, type CategoryConsumption } from '@/core/scoring/budget';
import {
  fetchAccounts,
  fetchCategories,
  fetchBudgetOverrides,
  fetchMonthTransactions,
  fetchRecentTransactions,
  fetchWealthHistory,
  monthStartISO,
} from '@/data/finance/real';

// Catégories/types exclus du calcul de dépenses — transferts internes et lignes
// techniques "Budget" (pseudo-transactions de suivi, pas de vraies dépenses).
const EXCLUDED_TYPES = new Set(['Transfert', 'Budget', 'Annulation']);
const EXCLUDED_CATEGORIES = new Set(['Transferts internes']);

function monthElapsedPct(): number {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.round((now.getDate() / daysInMonth) * 100);
}

export async function getBudgetOverview() {
  const month = monthStartISO();
  const [accounts, categories, overrides, transactions, recent, wealthHistory] = await Promise.all([
    fetchAccounts(),
    fetchCategories(),
    fetchBudgetOverrides(month),
    fetchMonthTransactions(month),
    fetchRecentTransactions(5),
    fetchWealthHistory(12),
  ]);

  let monthIncome = 0;
  let monthExpense = 0;
  const spentByCategory = new Map<string, number>();

  for (const t of transactions) {
    if (EXCLUDED_TYPES.has(t.transaction_type)) continue;
    if (t.category && EXCLUDED_CATEGORIES.has(t.category)) continue;
    if (t.transaction_type === 'Revenu') monthIncome += t.signed_amount;
    if (t.transaction_type === 'Dépense') {
      monthExpense += -t.signed_amount;
      if (t.category) spentByCategory.set(t.category, (spentByCategory.get(t.category) ?? 0) - t.signed_amount);
    }
  }

  const monthBalance = monthIncome - monthExpense;

  const categoryConsumption: CategoryConsumption[] = categories
    .filter((c) => !EXCLUDED_CATEGORIES.has(c.category))
    .map((c) => ({
      categoryId: c.category,
      name: c.category,
      spent: spentByCategory.get(c.category) ?? 0,
      allocated: overrides[c.category] ?? c.monthly_budget ?? 0,
    }))
    .filter((c) => c.allocated > 0);

  const elapsedPct = monthElapsedPct();
  const signals = scoreBudget({ categories: categoryConsumption, monthElapsedPct: elapsedPct, monthBalance });

  const totalWealth = accounts.reduce((s, a) => s + a.opening_balance, 0);
  const byType = new Map<string, number>();
  for (const a of accounts) byType.set(a.account_type, (byType.get(a.account_type) ?? 0) + a.opening_balance);

  return {
    monthIncome,
    monthExpense,
    monthBalance,
    monthSavings: spentByCategory.get('Épargne') ?? 0,
    monthElapsedPct: elapsedPct,
    categories: categoryConsumption,
    wealthComposition: {
      total: totalWealth,
      breakdown: [...byType.entries()].map(([type, amount]) => ({
        type,
        amount,
        pct: totalWealth > 0 ? Math.round((amount / totalWealth) * 100) : 0,
      })),
    },
    trajectory: {
      values: wealthHistory.map((w) => Math.round(w.total)),
      labels: wealthHistory.map((w) => w.date),
    },
    recentTransactions: recent,
    signals,
  };
}
