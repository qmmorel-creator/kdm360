import type { SankeyNode, SankeyLink } from '@/charts/Sankey';

// Données mock pour le Sankey mensuel — la mise en page/rendu suit
// docs/phase-0/02-sankey-reference.md, les montants sont fictifs (Phase 0).
export const sankeyMonthly: { columns: [string, string, string]; nodes: SankeyNode[]; links: SankeyLink[] } = {
  columns: ['ORIGINE', 'COMPTES', 'DESTINATION'],
  nodes: [
    { id: 'salaire', name: 'Salaire', value: 4250, color: '#3f806f', column: 0 },
    { id: 'compte-courant', name: 'Compte courant', value: 4250, color: '#24569a', column: 1 },
    { id: 'courses', name: 'Courses', value: 415, color: '#587894', column: 2 },
    { id: 'transport', name: 'Transport', value: 120, color: '#6a8fae', column: 2 },
    { id: 'loisirs', name: 'Loisirs', value: 180, color: '#7ea2bd', column: 2 },
    { id: 'restaurants', name: 'Restaurants', value: 95, color: '#93b5cc', column: 2 },
    { id: 'abonnements', name: 'Abonnements', value: 68, color: '#a8c7db', column: 2 },
    { id: 'epargne', name: 'Épargne', value: 600, color: '#3f806f', column: 2 },
    { id: 'solde', name: 'Solde restant', value: 2772, color: '#c2d8e8', column: 2 },
  ],
  links: [
    { source: 'salaire', target: 'compte-courant', value: 4250 },
    { source: 'compte-courant', target: 'courses', value: 415 },
    { source: 'compte-courant', target: 'transport', value: 120 },
    { source: 'compte-courant', target: 'loisirs', value: 180 },
    { source: 'compte-courant', target: 'restaurants', value: 95 },
    { source: 'compte-courant', target: 'abonnements', value: 68 },
    { source: 'compte-courant', target: 'epargne', value: 600 },
    { source: 'compte-courant', target: 'solde', value: 2772 },
  ],
};
