import type { SankeyNode, SankeyLink } from '@/charts/Sankey';
import type { CategoryConsumption } from '@/core/scoring/budget';

const CATEGORY_PALETTE = ['#587894', '#6a8fae', '#7ea2bd', '#93b5cc', '#a8c7db', '#bcd6e6'];

/** Construit les données du Sankey mensuel (ORIGINE → COMPTES → DESTINATION) à
 * partir des catégories de dépenses réelles du mois. Rendu figé, voir
 * docs/phase-0/02-sankey-reference.md — seules les données varient, jamais le
 * moteur de mise en page/style (src/charts/Sankey.tsx). */
export function buildSankeyFromCategories(categories: CategoryConsumption[], monthIncome: number) {
  const spendCategories = categories.filter((c) => c.spent > 0);
  if (spendCategories.length === 0 || monthIncome <= 0) {
    return { columns: ['ORIGINE', 'COMPTES', 'DESTINATION'] as [string, string, string], nodes: [] as SankeyNode[], links: [] as SankeyLink[] };
  }

  const totalSpent = spendCategories.reduce((s, c) => s + c.spent, 0);
  const solde = Math.max(0, monthIncome - totalSpent);

  const nodes: SankeyNode[] = [
    { id: 'revenus', name: 'Revenus', value: monthIncome, color: '#3f806f', column: 0 },
    { id: 'compte', name: 'Compte courant', value: monthIncome, color: '#24569a', column: 1 },
    ...spendCategories.map((c, i) => ({
      id: c.categoryId,
      name: c.name,
      value: c.spent,
      color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
      column: 2 as const,
    })),
  ];
  if (solde > 0) nodes.push({ id: 'solde', name: 'Solde restant', value: solde, color: '#c2d8e8', column: 2 });

  const links: SankeyLink[] = [
    { source: 'revenus', target: 'compte', value: monthIncome },
    ...spendCategories.map((c) => ({ source: 'compte', target: c.categoryId, value: c.spent })),
  ];
  if (solde > 0) links.push({ source: 'compte', target: 'solde', value: solde });

  return { columns: ['ORIGINE', 'COMPTES', 'DESTINATION'] as [string, string, string], nodes, links };
}
