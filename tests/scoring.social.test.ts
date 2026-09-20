import { describe, it, expect } from 'vitest';
import { scoreSocial } from '@/core/scoring/social';

// Valeurs reprises de prototypes/phase-0/shared/demo-data.md
const contacts = [
  { contactId: 'camille', name: 'Camille', circle: 'proche' as const, daysSinceLastContact: 30, contactThresholdDays: 21, awaitingReply: false },
  { contactId: 'thomas', name: 'Thomas', circle: 'regulier' as const, daysSinceLastContact: 45, contactThresholdDays: 35, awaitingReply: true, awaitingReplySinceDays: 12 },
  { contactId: 'lea', name: 'Léa', circle: 'proche' as const, daysSinceLastContact: 25, contactThresholdDays: 21, awaitingReply: false },
  { contactId: 'marc', name: 'Marc', circle: 'regulier' as const, daysSinceLastContact: 40, contactThresholdDays: 35, awaitingReply: false },
  { contactId: 'dodo', name: 'Contact dormant', circle: 'dormant' as const, daysSinceLastContact: 400, contactThresholdDays: 9999, awaitingReply: false },
];

describe('scoreSocial', () => {
  it('signale les 4 contacts actifs en retard, jamais le contact dormant', () => {
    const signals = scoreSocial(contacts);
    const relanceSignals = signals.filter((s) => s.detectorId === 'social.A.relance');
    expect(relanceSignals).toHaveLength(4);
    expect(signals.find((s) => s.title.includes('dormant'))).toBeUndefined();
  });

  it('donne à Camille (cercle Proche) un score plus élevé que Marc (Régulier) à dépassement comparable', () => {
    const signals = scoreSocial(contacts);
    const camille = signals.find((s) => s.title.startsWith('Camille'));
    const marc = signals.find((s) => s.title.startsWith('Marc'));
    expect(camille!.score).toBeGreaterThan(marc!.score);
  });

  it("ne signale pas encore l'attente de Thomas (12 j < moitié du seuil de son cercle, 17,5 j)", () => {
    // 05-regles-score-social.md : seuil de patience = moitié du seuil de contact
    // du cercle. Thomas (Régulier, seuil 35 j) a un seuil de patience de 17,5 j ;
    // 12 j d'attente ne le dépasse pas encore. Il remonte déjà via le détecteur A
    // (45 j > 35 j de seuil de contact), donc rien n'est perdu.
    const signals = scoreSocial(contacts);
    expect(signals.find((s) => s.detectorId === 'social.B.attente_reponse')).toBeUndefined();
  });

  it("signale l'attente de réponse au-delà du seuil de patience", () => {
    const signals = scoreSocial([
      { contactId: 'x', name: 'Attente longue', circle: 'regulier', daysSinceLastContact: 10, contactThresholdDays: 35, awaitingReply: true, awaitingReplySinceDays: 20 },
    ]);
    expect(signals.find((s) => s.detectorId === 'social.B.attente_reponse')).toBeDefined();
  });

  it('ne signale rien pour un contact à jour', () => {
    const signals = scoreSocial([
      { contactId: 'ok', name: 'OK', circle: 'regulier', daysSinceLastContact: 5, contactThresholdDays: 35, awaitingReply: false },
    ]);
    expect(signals).toHaveLength(0);
  });
});
