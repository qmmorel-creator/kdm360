import { scoreSocial } from '@/core/scoring/social';
import { fetchSocialPayload, mapCircleToGeneric, type RealContact, type RealInteraction } from '@/data/social/real';

function daysSince(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
}

export async function getSocialOverview() {
  const payload = await fetchSocialPayload();
  const activeCircles = payload.circles.filter((c) => c.active);
  const activeContacts = payload.contacts.filter((c) => c.active);

  const interactionsByContact = new Map<string, RealInteraction[]>();
  for (const it of payload.interactions) {
    const list = interactionsByContact.get(it.contactId) ?? [];
    list.push(it);
    interactionsByContact.set(it.contactId, list);
  }
  for (const list of interactionsByContact.values()) list.sort((a, b) => (a.date < b.date ? 1 : -1));

  const contactsWithMeta = activeContacts.map((c: RealContact) => {
    const circle = payload.circles.find((ci) => ci.id === c.circleId);
    const genericCircle = circle ? mapCircleToGeneric(circle, payload.circles) : 'occasionnel';
    const threshold = c.reminderDays ?? circle?.reminderDays ?? 30;
    const lastInteraction = interactionsByContact.get(c.id)?.[0];
    const daysSinceLastContact = lastInteraction ? daysSince(lastInteraction.date) : threshold + 1;
    const awaitingReply = lastInteraction ? lastInteraction.initiative === 'Moi' && !lastInteraction.answered : false;
    return {
      id: c.id,
      name: c.name,
      circle: genericCircle,
      circleName: circle?.name ?? '—',
      contactThresholdDays: threshold,
      daysSinceLastContact,
      awaitingReply,
      awaitingReplySinceDays: awaitingReply && lastInteraction ? daysSince(lastInteraction.date) : undefined,
      lastInteraction,
    };
  });

  const signals = scoreSocial(
    contactsWithMeta.map((c) => ({
      contactId: c.id,
      name: c.name,
      circle: c.circle,
      daysSinceLastContact: c.daysSinceLastContact,
      contactThresholdDays: c.contactThresholdDays,
      awaitingReply: c.awaitingReply,
      awaitingReplySinceDays: c.awaitingReplySinceDays,
    })),
  );

  const circleCounts = { proche: 0, regulier: 0, occasionnel: 0, dormant: 0 };
  for (const c of contactsWithMeta) circleCounts[c.circle]++;

  return {
    contacts: contactsWithMeta,
    circles: activeCircles,
    circleCounts,
    totalContacts: contactsWithMeta.length,
    signals,
  };
}
