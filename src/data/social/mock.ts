// Adaptateur mock Social — valeurs de prototypes/phase-0/shared/demo-data.md.
import type { Circle } from '@/core/scoring/social';

export interface SocialContact {
  id: string;
  name: string;
  circle: Circle;
  importance: 'haute' | 'normale' | 'basse';
  contactThresholdDays: number;
  daysSinceLastContact: number;
  lastContactType: 'appel' | 'message' | 'repas' | 'visite';
  awaitingReply: boolean;
  awaitingReplySinceDays?: number;
}

export const contacts: SocialContact[] = [
  { id: 'camille', name: 'Camille', circle: 'proche', importance: 'haute', contactThresholdDays: 21, daysSinceLastContact: 30, lastContactType: 'appel', awaitingReply: false },
  { id: 'thomas', name: 'Thomas', circle: 'regulier', importance: 'normale', contactThresholdDays: 35, daysSinceLastContact: 45, lastContactType: 'message', awaitingReply: true, awaitingReplySinceDays: 12 },
  { id: 'lea', name: 'Léa', circle: 'proche', importance: 'haute', contactThresholdDays: 21, daysSinceLastContact: 25, lastContactType: 'message', awaitingReply: false },
  { id: 'marc', name: 'Marc', circle: 'regulier', importance: 'normale', contactThresholdDays: 35, daysSinceLastContact: 40, lastContactType: 'appel', awaitingReply: false },
];

export const circleCounts = { proche: 6, regulier: 12, occasionnel: 11, dormant: 5 };
export const totalContacts = 34;

export const camilleInteractionsPerMonth = [3, 1, 4, 2, 2, 3, 1, 2, 2, 0, 0, 3]; // Oct→Sep, creux juillet-août
export const camilleInteractionHistory = [
  { date: '21/08', type: 'Appel', detail: '18 min' },
  { date: '02/08', type: 'Message', detail: 'Échange court' },
  { date: '14/07', type: 'Repas', detail: '1h30' },
  { date: '28/06', type: 'Appel', detail: '25 min' },
  { date: '09/06', type: 'Message', detail: 'Échange court' },
  { date: '22/05', type: 'Visite', detail: '2h15' },
];
