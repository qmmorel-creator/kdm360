// Détecteurs Social — voir docs/phase-0/05-regles-score-social.md
import type { Signal } from './types';

export type Circle = 'proche' | 'regulier' | 'occasionnel' | 'dormant';

const CIRCLE_WEIGHT: Record<Circle, number> = {
  proche: 4,
  regulier: 3,
  occasionnel: 2,
  dormant: 0, // exclu par construction — jamais de relance automatique
};

export interface SocialContactInput {
  contactId: string;
  name: string;
  circle: Circle;
  daysSinceLastContact: number;
  contactThresholdDays: number;
  awaitingReply: boolean;
  awaitingReplySinceDays?: number;
}

export function scoreSocial(contacts: SocialContactInput[]): Signal[] {
  const signals: Signal[] = [];

  for (const c of contacts) {
    const weight = CIRCLE_WEIGHT[c.circle];
    if (weight === 0) continue; // cercle dormant exclu

    // Détecteur A — relance en retard (dépassement du seuil de contact).
    if (c.daysSinceLastContact > c.contactThresholdDays) {
      const overrun = (c.daysSinceLastContact - c.contactThresholdDays) / c.contactThresholdDays;
      signals.push({
        domain: 'social',
        detectorId: 'social.A.relance',
        severity: overrun > 0.5 ? 'dérive' : 'attention',
        score: overrun * weight,
        title: `${c.name} dépasse son délai de contact`,
        description: `Cercle ${c.circle}, dernier contact il y a ${c.daysSinceLastContact} jours (seuil ${c.contactThresholdDays} jours).`,
        value: `+${c.daysSinceLastContact - c.contactThresholdDays} j`,
        valueSub: 'au-delà du seuil',
      });
    }

    // Détecteur B — réponse en attente (seuil de patience = moitié du seuil de contact).
    const patienceThreshold = c.contactThresholdDays / 2;
    if (c.awaitingReply && (c.awaitingReplySinceDays ?? 0) > patienceThreshold) {
      const days = c.awaitingReplySinceDays ?? 0;
      signals.push({
        domain: 'social',
        detectorId: 'social.B.attente_reponse',
        severity: 'attention',
        score: (days / patienceThreshold) * weight,
        title: `${c.name} — en attente de réponse`,
        description: `Cercle ${c.circle}, en attente depuis ${days} jours.`,
        value: `${days} j`,
        valueSub: "en attente",
      });
    }
  }

  return signals;
}
