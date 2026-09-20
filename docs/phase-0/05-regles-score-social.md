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

**Tranché avec Quentin : contrairement au Sankey, le rendu visuel de ces trois
visualisations peut être adapté à la nouvelle direction graphique.** Ce qui doit être
préservé à l'identique, c'est la **fonctionnalité** et le **type d'information**
restitué — pas le pixel :

1. **Radar** (relationnel, vue polaire) : même principe (positionnement des contacts
   par ancienneté/proximité de contact autour d'un centre, filtrage par cercle) et les
   mêmes données affichées, dans un nouveau langage visuel.
2. **Vue géographique** (module GPS existant — `gps.gs`, `MODULE_GPS.md`) : même
   fonction (localiser des données dans l'espace), à ré-habiller.
3. **Réseau** : même fonction (visualiser le graphe relationnel entre contacts), à
   ré-habiller.

Contrairement au Sankey, pas besoin d'un contrat de non-régression pixel-à-pixel. Un
inventaire précis de **ce que chaque vue montre et permet de faire aujourd'hui**
(champs affichés, filtres, interactions, pas la géométrie du rendu) reste utile avant
le développement réel, pour s'assurer qu'aucune fonction n'est perdue en changeant
d'habillage — c'est le même principe que la matrice de parité prévue section 24 du
prompt de refonte, appliqué ici par anticipation à ces trois composants précis.
