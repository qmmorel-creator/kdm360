# Règles de score — Sport — décisions avec Quentin

*Ref #1 — document de conception, aucun code applicatif engagé.*

Rappel : le % d'heures de sport vs objectif (1h/jour cumulé sur le mois, hors vélo
électrique) est **figé** (`04-metriques-figees.md`). Ce qui suit couvre le reste,
piloté par le score. Toutes les valeurs numériques sont des propositions de départ,
modifiables plus tard. **Tous les détecteurs ci-dessous excluent le vélo électrique**
des calculs de charge/volume, par cohérence avec le figé.

## Détecteur A — Charge aiguë vs chronique (ratio ACWR)

- `ratio = charge cumulée 7 jours / (charge cumulée 28 jours ÷ 4)` — mesure standard en
  science du sport pour repérer une montée en charge trop rapide (risque de blessure).
- Seuils (repères de littérature sportive générale, à ajuster) : **ratio > 1,5 →
  surcharge / risque de blessure**, **ratio < 0,8 → sous-charge / déconditionnement
  possible**.
- Signal sur le *pattern d'entraînement*, distinct de ce que Santé calcule
  (récupération/strain) — pas de redondance.

## Détecteur B — Rupture de régularité (silence prolongé)

- Compare le nombre de jours depuis la dernière séance à l'intervalle moyen habituel
  (12 dernières semaines).
- Se déclenche si `jours depuis dernière séance > 2× l'intervalle moyen`.
- Score proportionnel au dépassement.

## Repère neutre — Séance exceptionnelle (pic d'intensité)

- **Tranché par Quentin : hors catalogue de score.** Une séance dont la charge dépasse
  1,5× la moyenne glissante des séances récentes est simplement signalée comme
  information neutre sur la page Sport (ex. un badge « séance exceptionnelle » sur la
  séance concernée) — elle ne remonte jamais en « à regarder » sur Sport ni sur
  Aujourd'hui, contrairement aux détecteurs A, B, D, E, F.

## Détecteur D — Tendance de la fréquence cardiaque au repos (RHR)

- Moyenne glissante 7 jours du RHR comparée à elle-même 5 jours plus tôt (même
  mécanique que le détecteur de tendance poids/masse grasse en Santé,
  `07-regles-score-sante.md`).
- **Hausse** durable (**+3 bpm sur 5 jours consécutifs**) : signal de fatigue
  accumulée / surentraînement possible.
- **Baisse** durable : traitée symétriquement comme un signal positif à noter
  (meilleure récupération cardiovasculaire) — extension par cohérence de la décision
  prise pour les détecteurs E et F ci-dessous ; à confirmer si Quentin veut la même
  règle sur le RHR.
- C'est la même donnée RHR qu'un futur signal Santé pourrait utiliser : **un seul
  calcul partagé**, pas un recalcul divergent, pour éviter le risque de double lecture
  signalé dans l'avis produit initial (`00-avis-produit.md`, section 4).

## Détecteurs E et F — Tendance de la FC moyenne par discipline (CrossFit et Running)

- Une instance du même détecteur par discipline : **E = CrossFit**, **F = Running**.
- Pour chaque discipline séparément : compare la FC moyenne des 5 dernières séances de
  la discipline à la baseline des 20 séances précédentes de la même discipline.
- **Hausse** durable (**+5 bpm**) : signal de fatigue/surentraînement possible sur
  cette discipline spécifique.
- **Baisse** durable : signal positif à noter (meilleure condition physique pour un
  effort équivalent) — **confirmé par Quentin**, remonte aussi en « à regarder ».

## Sélection à l'affichage

- **Page Sport** : tous les détecteurs déclenchés, triés par score décroissant.
- **Aujourd'hui** : le détecteur au score le plus élevé, affiché comme exemple —
  même logique de priorité que les autres domaines (un signal critique prime toujours
  sur un signal simple).

