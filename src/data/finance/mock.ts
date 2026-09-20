// Adaptateur mock — voir docs/architecture/02-contrats-donnees.md.
// Valeurs reprises de prototypes/phase-0/shared/demo-data.md, aucune donnée réelle.
import type { Account, Bank, Category, Transaction, BudgetAllocation, WealthSnapshot, FinanceSource } from './types';

const banks: Bank[] = [
  { id: 'bank-1', name: 'Banque principale', color: '#256d85' },
  { id: 'bank-2', name: 'Livret', color: '#cf7856' },
];

const accounts: Account[] = [
  { id: 'acc-courant', name: 'Compte courant', type: 'courant', bankId: 'bank-1', balance: 4653 },
  { id: 'acc-epargne', name: 'Livret A', type: 'epargne', bankId: 'bank-2', balance: 25803 },
  { id: 'acc-invest', name: 'Investissements', type: 'investissement', bankId: 'bank-1', balance: 11844 },
];

const categories: Category[] = [
  { id: 'cat-courses', name: 'Courses', excludedFromSpending: false },
  { id: 'cat-transport', name: 'Transport', excludedFromSpending: false },
  { id: 'cat-loisirs', name: 'Loisirs', excludedFromSpending: false },
  { id: 'cat-restaurants', name: 'Restaurants', excludedFromSpending: false },
  { id: 'cat-abonnements', name: 'Abonnements', excludedFromSpending: false },
  { id: 'cat-revenus', name: 'Revenus', excludedFromSpending: true },
  { id: 'cat-epargne', name: 'Épargne automatique', excludedFromSpending: true },
];

const CURRENT_MONTH = '2026-09';

const allocations: BudgetAllocation[] = [
  { categoryId: 'cat-courses', monthlyAmount: 500, month: CURRENT_MONTH },
  { categoryId: 'cat-transport', monthlyAmount: 150, month: CURRENT_MONTH },
  { categoryId: 'cat-loisirs', monthlyAmount: 300, month: CURRENT_MONTH },
  { categoryId: 'cat-restaurants', monthlyAmount: 120, month: CURRENT_MONTH },
  { categoryId: 'cat-abonnements', monthlyAmount: 70, month: CURRENT_MONTH },
];

const transactions: Transaction[] = [
  { id: 't1', accountId: 'acc-courant', categoryId: 'cat-courses', amount: -58.4, type: 'depense', effectiveDate: '2026-09-19', bankDate: '2026-09-19', label: 'Carrefour City', isFuture: false },
  { id: 't2', accountId: 'acc-courant', categoryId: 'cat-abonnements', amount: -24, type: 'depense', effectiveDate: '2026-09-17', bankDate: '2026-09-17', label: 'Abonnement Whoop', isFuture: false },
  { id: 't3', accountId: 'acc-courant', categoryId: 'cat-transport', amount: -38.5, type: 'depense', effectiveDate: '2026-09-16', bankDate: '2026-09-16', label: 'SNCF Connect', isFuture: false },
  { id: 't4', accountId: 'acc-courant', categoryId: 'cat-revenus', amount: 4250, type: 'revenu', effectiveDate: '2026-09-15', bankDate: '2026-09-15', label: 'Virement salaire', isFuture: false },
  { id: 't5', accountId: 'acc-courant', categoryId: 'cat-restaurants', amount: -31.8, type: 'depense', effectiveDate: '2026-09-14', bankDate: '2026-09-14', label: 'Le Petit Bistrot', isFuture: false },
];

// Trajectoire 12 mois du solde (revenus - dépenses), pic +520 en juillet, creux -90 en décembre.
const wealthMonthlyBalances = [220, 180, -90, 340, 410, 150, 60, 380, 290, 520, 190, 418];
const wealthLabels = ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'];

const wealthHistory: WealthSnapshot[] = wealthMonthlyBalances.map((total, i) => ({
  date: wealthLabels[i],
  total,
  byType: {},
}));

export const financeMock: FinanceSource = {
  async getAccounts() { return accounts; },
  async getBanks() { return banks; },
  async getCategories() { return categories; },
  async getTransactions() { return transactions; },
  async getBudgetAllocations() { return allocations; },
  async getWealthHistory() { return wealthHistory; },
};

export const budgetTrajectory = { values: wealthMonthlyBalances, labels: wealthLabels };
export const wealthComposition = { epargne: 61, investissements: 28, liquidites: 11, total: 42300 };
export const monthElapsedPct = 66;
export const monthIncome = 4250;
export const monthExpense = 3832;
export const monthSavings = 600;
