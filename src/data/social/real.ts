// Adaptateur Social réel — pont Apps Script (même contrat JSON que fichier.gs
// d'OS360, doGet -> buildPayload_()). L'URL n'est jamais codée en dur ici :
// elle vient des réglages utilisateur (localStorage), voir src/app/settings.ts
// et CLAUDE.md.
import { getSocialBridgeUrl } from '@/app/settings';
import type { Circle } from '@/core/scoring/social';

export interface RealCircle {
  id: string;
  name: string;
  color: string;
  reminderDays: number;
  warningDays: number | null;
  order: number;
  active: boolean;
}

export interface RealContact {
  id: string;
  name: string;
  circleId: string;
  importance: number;
  reminderDays: number | null;
  active: boolean;
  address: string;
  lat: number | null;
  lng: number | null;
}

export interface RealInteraction {
  id: string;
  interactionId: string;
  contactId: string;
  date: string;
  type: string;
  initiative: string;
  answered: boolean;
}

export interface SocialPayload {
  circles: RealCircle[];
  contacts: RealContact[];
  interactions: RealInteraction[];
  fetchedAt: string;
}

export class SocialNotConfiguredError extends Error {
  constructor() {
    super("Pont Social non configuré — renseigne l'URL dans Réglages pour brancher les données réelles.");
    this.name = 'SocialNotConfiguredError';
  }
}

export async function fetchSocialPayload(): Promise<SocialPayload> {
  const url = getSocialBridgeUrl();
  if (!url) throw new SocialNotConfiguredError();
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Social (pont) : ${res.status} ${res.statusText}`);
  return res.json();
}

/** Les 4 cercles génériques du moteur de score (05-regles-score-social.md) —
 * les cercles réels sont plus nombreux (CrossFit, Famille Elo, etc.), mappés
 * par ordre décroissant de `reminderDays` sur les 4 paliers connus du moteur.
 * Approximation à affiner si le mapping doit être exact (issue de suivi). */
export function mapCircleToGeneric(circle: RealCircle, allCircles: RealCircle[]): Circle {
  const sorted = [...allCircles].sort((a, b) => a.reminderDays - b.reminderDays);
  const idx = sorted.findIndex((c) => c.id === circle.id);
  const quartile = idx / Math.max(1, sorted.length - 1);
  if (quartile <= 0.25) return 'proche';
  if (quartile <= 0.5) return 'regulier';
  if (quartile <= 0.75) return 'occasionnel';
  return 'dormant';
}
