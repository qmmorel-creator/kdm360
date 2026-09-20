// Réglages utilisateur stockés uniquement en localStorage — jamais envoyés
// ailleurs qu'à l'URL elle-même, jamais commités. Voir CLAUDE.md : toute
// intégration de source passe par une configuration utilisateur, jamais par
// une constante commitée (vrai pour le pont Social, qui a un accès en
// écriture non authentifié côté OS360 — cf. finding D1 de l'audit OS360).
const SOCIAL_BRIDGE_KEY = 'kdm360:social_bridge_url';

export function getSocialBridgeUrl(): string {
  try {
    return localStorage.getItem(SOCIAL_BRIDGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setSocialBridgeUrl(url: string): void {
  try {
    if (url.trim() === '') localStorage.removeItem(SOCIAL_BRIDGE_KEY);
    else localStorage.setItem(SOCIAL_BRIDGE_KEY, url.trim());
  } catch {
    // localStorage indisponible (navigation privée, etc.) — dégradation silencieuse,
    // l'utilisateur reverra le champ vide au prochain chargement.
  }
}
