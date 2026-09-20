# Règles de score — Social — décisions avec Quentin

*Ref #1 — document de conception, aucun code applicatif engagé.*

## Détecteurs retenus

### A — Relance en retard (dépassement du seuil de contact)

- Condition de déclenchement : `jours depuis dernier contact > seuil du cercle`
- Intensité : `(jours dépassés − seuil) / seuil` (dépassement relatif)
- Score = intensité × poids du cercle

### B — Réponse en attente (j'ai relancé, pas de nouvelles)

- Condition de déclenchement : `initiative = attente de réponse` et l'attente dépasse
  un seuil de patience dédié
- Seuil de patience (provisoire, à ajuster) : la moitié du seuil de contact du cercle
- Score = même logique que A, pondérée par le cercle

## Poids des cercles

- Proche = 4
- Régulier = 3
- Occasionnel = 2
- Dormant = **exclu** (mis de côté volontairement par construction, pas de relance
  automatique dessus)

## Sélection à l'affichage

- **Page Social** : tous les contacts avec un score > 0, triés par score décroissant
  (liste « à relancer »).
- **Aujourd'hui** : compteur total des contacts en score > 0, + le contact au score le
  plus élevé affiché comme exemple (cohérent avec les 5 maquettes de Phase 0, qui
  montraient déjà « 4 relances » + 1 exemple).

## Point noté pour la suite — trois visualisations Social à préserver impérativement

Quentin a demandé de garder, dans KDM360, les trois visualisations Social existantes
d'OS360 :

1. **Radar** (relationnel, vue polaire — visible dans `screen/filtres.png` d'OS360 :
   « Radar relationnel · polaire », cercles concentriques par ancienneté de contact,
   filtre par cercle).
2. **Vue géographique** (probablement liée au module GPS d'OS360 — `gps.gs`,
   `MODULE_GPS.md` — à vérifier précisément).
3. **Réseau** (visualisation du graphe relationnel).

Ce n'est pas encore documenté avec le même niveau de précision que le Sankey figé
(`02-sankey-reference.md`). Contrairement au Sankey, rien n'indique à ce stade que ces
trois visualisations doivent être **pixel-identiques** à l'existant (ce n'est pas une
contrainte énoncée dans le prompt de refonte comme pour le Sankey) — seulement qu'elles
doivent être **conservées comme fonctionnalités**, avec le nouveau langage visuel
retenu. À confirmer avec Quentin : ces trois vues doivent-elles rester à l'identique
visuellement (comme le Sankey), ou seulement fonctionnellement (même information,
nouveau design) ?

Si nécessaire, un audit précis de ces trois composants dans `index.html` (source,
config, interactions) pourra être fait sur le même modèle que celui du Sankey, avant le
développement réel.
