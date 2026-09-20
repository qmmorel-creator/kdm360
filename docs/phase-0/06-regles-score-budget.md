# Règles de score — Budget — décisions avec Quentin

*Ref #1 — document de conception, aucun code applicatif engagé.*

Rappel : revenus/dépenses/delta du mois en cours sont **figés**
(`04-metriques-figees.md`). Ce qui suit couvre ce qui remonte par le score, au niveau
des catégories de dépenses.

## Filtre d'entrée — plancher de 150 €

Seules les catégories dont la **dépense effective du mois** dépasse **150 €** entrent
dans le calcul des détecteurs ci-dessous. En dessous, la catégorie n'est jamais
remontée, quel que soit son % de consommation — l'enjeu en euros est jugé trop faible
pour mériter l'attention, même si le budget est explosé en pourcentage.

Conséquence assumée sur nos données de démo (`shared/demo-data.md`) : la catégorie
« Abonnements » (68 €, 97 % consommé) ne remonterait plus, alors qu'elle apparaissait
« dérive » dans les 5 maquettes visuelles de Phase 0 — ces maquettes étaient une
démonstration du langage visuel, pas encore soumises à ce filtre.

## Détecteur A — Rythme de consommation d'une catégorie

- Ne s'applique qu'aux catégories passant le filtre des 150 €.
- Compare `% consommé` vs `% du mois écoulé`.
- Écart en points = `%consommé − %mois_écoulé`.
- Trois paliers :
  - **< 8 pts** → normal, ne remonte pas.
  - **8 à 15 pts** → proche limite.
  - **≥ 15 pts** → dérive.
  - **≥ 25 pts** → **critique** (dépassement de rythme très important — proposition à
    confirmer si le nombre ne convient pas).
- Score = l'écart en points (pas de pondération proportionnelle au montant du budget —
  seul le filtre des 150 € en entrée joue ce rôle).

## Détecteur B — Dépassement effectif

- Ne s'applique qu'aux catégories passant le filtre des 150 €.
- Se déclenche dès que `% consommé ≥ 100 %`, indépendamment du rythme.
- Score majoré par rapport au détecteur A, pour toujours remonter en priorité — un
  dépassement réel est un signal plus fort qu'une simple dérive de rythme, même en
  tout début de mois.

## Sélection à l'affichage

- **Page Budget** : toutes les catégories filtrées (> 150 € dépensés) avec un score
  > 0 (palier ≥ proche limite), triées par score décroissant.
- **Aujourd'hui** : la catégorie au score le plus élevé, affichée comme exemple (même
  format que dans les 5 maquettes de Phase 0 : « Courses : 83 % du budget à 66 % du
  mois »).

## Mis de côté pour cette phase — détecteurs nécessitant l'historique réel

Deux détecteurs mentionnés dans le prompt de refonte (section 9) ne peuvent pas être
spécifiés précisément avec des données de démo — ils nécessitent l'historique réel
(moyenne/écart-type sur plusieurs mois) pour fixer des seuils qui aient un sens :

- **Écarts inhabituels** : une catégorie qui dépense significativement plus que sa
  moyenne historique pour la même période du mois, même sans dépasser son budget
  alloué (ex. un budget large mais un mois anormal par rapport à l'habitude).
- **Projection mensuelle** : extrapoler la trajectoire actuelle sur le reste du mois
  et comparer à une trajectoire de référence (ex. moyenne des 6 derniers mois).

À écrire une fois les vraies données Supabase branchées (après validation esthétique
et développement de l'architecture technique), pas avant — inventer des seuils sans
données réelles produirait des règles arbitraires et probablement fausses.
