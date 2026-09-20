// Adaptateur Budget réel — projet Supabase "kdm360" (finance_*), bascule effective
// depuis le 28/08/2026 (finance_cutover_state.active = true, mode "supabase_canonical").
// Schéma réel, pas celui inféré en Phase 0 — voir docs/architecture/02-contrats-donnees.md.
import { supabase } from './supabaseClient';
import { getSession } from './supabaseAuth';

export interface RealTransaction {
  transaction_id: string;
  effective_date: string;
  transaction_type: 'Dépense' | 'Revenu' | 'Remboursement' | 'Budget' | 'Ajustement' | 'Annulation' | 'Ouverture' | 'Transfert';
  account_id: string;
  signed_amount: number;
  merchant: string | null;
  category: string | null;
  subcategory: string | null;
}

export interface RealAccount {
  account_id: string;
  name: string;
  account_type: string;
  opening_balance: number;
  color: string | null;
  active: boolean;
}

export interface RealCategory {
  category: string;
  monthly_budget: number | null;
  color: string | null;
  active: boolean;
}

function monthStartISO(d = new Date()): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

/** La RLS de finance_* exige une session authentifiée (auth.uid() = current_app_owner()) —
 * la clé publiable seule ne renvoie rien. Erreur explicite plutôt qu'un résultat vide
 * silencieux, cf. principe "jamais un zéro silencieux" (avis produit §22). */
async function requireSession(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error('Non connecté à Supabase — renseigne tes identifiants dans Réglages.');
}

export async function fetchAccounts(): Promise<RealAccount[]> {
  await requireSession();
  const { data, error } = await supabase
    .from('finance_accounts_current')
    .select('account_id,name,account_type,opening_balance,color,active')
    .eq('active', true);
  if (error) throw error;
  return (data ?? []) as RealAccount[];
}

export async function fetchCategories(): Promise<RealCategory[]> {
  const { data, error } = await supabase
    .from('finance_categories_current')
    .select('category,monthly_budget,color,active')
    .eq('active', true);
  if (error) throw error;
  return (data ?? []) as RealCategory[];
}

/** Overrides de budget pour un mois donné (finance_category_budgets) — priment sur
 * monthly_budget de finance_categories_current quand présents. */
export async function fetchBudgetOverrides(month = monthStartISO()): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('finance_category_budgets')
    .select('category,budget_amount')
    .eq('month', month);
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.category as string] = Number(row.budget_amount);
  return out;
}

export async function fetchMonthTransactions(month = monthStartISO()): Promise<RealTransaction[]> {
  const { data, error } = await supabase
    .from('finance_transactions_current')
    .select('transaction_id,effective_date,transaction_type,account_id,signed_amount,merchant,category,subcategory')
    .gte('effective_date', month)
    .order('effective_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as RealTransaction[];
}

export async function fetchRecentTransactions(limit = 5): Promise<RealTransaction[]> {
  const { data, error } = await supabase
    .from('finance_transactions_current')
    .select('transaction_id,effective_date,transaction_type,account_id,signed_amount,merchant,category,subcategory')
    .in('transaction_type', ['Dépense', 'Revenu', 'Remboursement'])
    .order('effective_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as RealTransaction[];
}

export async function fetchWealthHistory(months = 12): Promise<{ date: string; total: number }[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const { data, error } = await supabase
    .from('finance_account_balances')
    .select('as_of_date,balance,account_id')
    .gte('as_of_date', since.toISOString().slice(0, 10))
    .order('as_of_date', { ascending: true });
  if (error) throw error;
  const byMonth = new Map<string, number>();
  for (const row of data ?? []) {
    const key = String(row.as_of_date).slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(row.balance));
  }
  return [...byMonth.entries()].map(([date, total]) => ({ date, total }));
}

export { monthStartISO };
