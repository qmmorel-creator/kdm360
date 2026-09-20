import { scoreSocial } from '@/core/scoring/social';
import { contacts, circleCounts, totalContacts, camilleInteractionsPerMonth, camilleInteractionHistory } from '@/data/social/mock';

export function getSocialOverview() {
  const signals = scoreSocial(contacts.map((c) => ({
    contactId: c.id,
    name: c.name,
    circle: c.circle,
    daysSinceLastContact: c.daysSinceLastContact,
    contactThresholdDays: c.contactThresholdDays,
    awaitingReply: c.awaitingReply,
    awaitingReplySinceDays: c.awaitingReplySinceDays,
  })));
  return { contacts, circleCounts, totalContacts, camilleInteractionsPerMonth, camilleInteractionHistory, signals };
}
