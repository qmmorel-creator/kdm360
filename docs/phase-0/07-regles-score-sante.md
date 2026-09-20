# Règles de score — Santé — décisions avec Quentin

*Ref #1 — document de conception, aucun code applicatif engagé.*

Rappel : nombre d'heures de sommeil, poids, masse grasse sont **figés**
(`04-metriques-figees.md`, derniers points enregistrés). Ce qui suit couvre le reste,
piloté par le score. Toutes les valeurs numériques ci-dessous sont des **propositions
de départ, modifiables plus tard** — aucune n'est gravée dans le marbre.

## Récupération

### Détecteur A — Chute de récupération

- Compare le Recovery du jour à la moyenne 7 jours.
- Écart = `moyenne_7j − recovery_jour` (positif = baisse).
- Seuils : **> 10 pts → à regarder**, **> 20 pts → critique**.

### Détecteur B — Surmenage (strain élevé + récupération basse combinés)

- Se déclenche quand strain élevé (**> 15/21**) **ET** recovery bas (**< 65 %**) le
  même jour ou le lendemain.
- Signal distinct du A : c'est la combinaison qui compte, pas chaque métrique isolément.

### Détecteur C — Anomalie physiologique isolée

- SpO2 **< 95 %**, ou température **> +0,5 °C** vs baseline.
- Signal fort indépendant du reste (piste infection/fatigue anormale) — remonte même
  seul, sans corrélation avec les autres détecteurs.

## Sommeil

### Détecteur D — Dette de sommeil vs besoin

- Écart = `besoin − durée réelle`.
- Seuils : **> 45 min → à regarder**, **> 1h30 → critique**.

## Composition corporelle

### Détecteur E — Dépassement d'un plafond configurable (poids et masse grasse)

- Deux plafonds réglables dans les paramètres utilisateur : `poids_plafond` et
  `masse_grasse_plafond`.
- Dès que la valeur du jour dépasse son plafond → **alerte critique systématique**,
  même pour un dépassement minime. C'est une limite absolue fixée par l'utilisateur,
  pas une dérive relative.
- Appliqué indépendamment et identiquement au poids et à la masse grasse (deux
  instances du même détecteur, un plafond chacune).

### Détecteur F — Tendance haussière (poids et masse grasse)

- Se déclenche **même sous le plafond** — c'est un signal précoce, indépendant du
  détecteur E.
- Deux conditions cumulées (pour ne pas réagir au bruit d'un jour) :
  1. La valeur brute est en hausse sur plusieurs jours consécutifs.
  2. La moyenne glissante (7 jours) est elle aussi orientée à la hausse sur la même
     période.
- Fenêtre proposée : **5 jours consécutifs** pour les deux conditions.
- Score proportionnel à la pente (kg/jour, ou point de %/jour pour la masse grasse) de
  la moyenne glissante.
- Appliqué identiquement au poids et à la masse grasse (deux instances du même
  détecteur).

## Nutrition

### Détecteur G — Facteur calorique en tendance haute

- `facteur_calorique_jour = calories consommées / calories dépensées` (pas l'objectif
  — la dépense énergétique réelle du jour, ex. donnée Whoop).
- Se déclenche si ce facteur reste **> 1 pendant plusieurs jours consécutifs**.
- Fenêtre proposée : **3 jours consécutifs**.
- Score proportionnel au nombre de jours consécutifs au-dessus de 1.
- Lien logique avec le détecteur F : un facteur calorique durablement > 1 est la cause
  probable d'une tendance haussière du poids détectée en amont — les deux détecteurs
  peuvent remonter ensemble sur la même période, ce qui est cohérent et attendu (pas
  une redondance à éliminer).

## Sélection à l'affichage

- **Page Santé** : tous les détecteurs déclenchés, regroupés par sous-thème
  (récupération / sommeil / composition / nutrition), triés par score décroissant à
  l'intérieur de chaque groupe.
- **Aujourd'hui** : le détecteur au score le plus élevé toutes catégories Santé
  confondues, affiché comme exemple — sauf si un détecteur E (dépassement de plafond)
  est actif, auquel cas il prime toujours (alerte critique = priorité absolue,
  cohérent avec le traitement du détecteur B Budget).

## Réglages utilisateur nécessaires (à prévoir dans l'architecture technique future)

- `poids_plafond` (kg)
- `masse_grasse_plafond` (%)

Ces deux valeurs n'existent dans aucune source actuelle (Whoop/Withings/Sheets) — ce
sont des préférences propres à KDM360, à stocker dans les réglages utilisateur, pas
dans les sources maîtres.
