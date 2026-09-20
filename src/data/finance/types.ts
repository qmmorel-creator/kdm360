// Contrat Budget — voir docs/architecture/02-contrats-donnees.md
// AVERTISSEMENT : le schéma réel finance_* n'est pas accessible depuis cette
// session (db/schema.sql d'OS360 ne couvre que la synchro des préférences).
// Ces types sont inférés, à valider avant tout branchement réel.

export interface Account {
  id: string;
  name: string;
  type: 'courant' | 'epargne' | 'investissement' | 'especes';
  bankId: string;
  color?: string;
  balance: number;
}

export interface Bank {
  id: string;
  name: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  excludedFromSpending: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: 'depense' | 'revenu' | 'remboursement' | 'transfert_interne' | 'ajustement';
  effectiveDate: string;
  bankDate: string;
  label: string;
  isFuture: boolean;
}

export interface BudgetAllocation {
  categoryId: string;
  monthlyAmount: number;
  month: string;
}

export interface WealthSnapshot {
  date: string;
  total: number;
  byType: Partial<Record<Account['type'], number>>;
}

export interface FinanceSource {
  getAccounts(): Promise<Account[]>;
  getBanks(): Promise<Bank[]>;
  getCategories(): Promise<Category[]>;
  getTransactions(range: { from: string; to: string }): Promise<Transaction[]>;
  getBudgetAllocations(month: string): Promise<BudgetAllocation[]>;
  getWealthHistory(range: { from: string; to: string }): Promise<WealthSnapshot[]>;
}
