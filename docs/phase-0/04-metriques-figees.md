# Métriques figées — décisions avec Quentin

*Ref #1 — document de conception, aucun code applicatif engagé.*

Ce document capture les métriques **figées** (toujours visibles, indépendamment de
tout score d'importance) décidées avec Quentin, en complément de l'approche « règles
de score/seuil » retenue pour le reste de l'information (voir `00-avis-produit.md`,
section 1).

## Critère retenu pour figer une métrique

Une métrique est figée si on veut en suivre la **trajectoire dans le temps**,
indépendamment de tout seuil d'alerte — on la regarde parce qu'on suit une évolution,
pas parce qu'il y a un problème. Une métrique qui n'a de sens que « quand ça déraille »
reste entièrement côté scoré (ex. strain, dérive budgétaire par catégorie).

## Liste des métriques figées par domaine

### Santé

- Nombre d'heures de sommeil (dernière nuit / dernier point enregistré)
- Poids (dernier point enregistré)
- Masse grasse (dernier point enregistré)

### Budget

- Revenus du mois en cours
- Dépenses du mois en cours
- Delta (solde = revenus − dépenses)

### Sport

- Total des heures de sport sur le mois en cours, **hors vélo électrique**, rapporté à
  un objectif de **1h de sport par jour cumulée sur le mois** (objectif mensuel = 1h ×
  nombre de jours du mois). Affiché en pourcentage d'avancement.

### Social

- Rien de figé. Entièrement piloté par les règles de score à venir.

## Où ces métriques apparaissent

- **Sur chaque page domaine concernée** (Santé, Budget, Sport) : les métriques figées
  du domaine sont toujours visibles, en plus de ce que les règles de score font
  remonter.
- **Sur Aujourd'hui** : un sous-ensemble condensé, un chiffre par domaine (pas de
  duplication complète des pages domaine) —
  - Santé : dernier poids enregistré, dernière masse grasse enregistrée.
  - Budget : solde mensuel actuel (revenus − dépenses).
  - Sport : pourcentage d'avancement des heures de sport (hors vélo électrique) vs
    objectif 1h/jour sur le mois.
  - Social : rien de figé — Aujourd'hui continue d'afficher pour Social uniquement ce
    que les règles de score font remonter (ex. relances en retard).

Ces figés cohabitent avec la zone « À regarder » pilotée par les règles de score : les
figés répondent à « où j'en suis en continu », la zone scorée répond à « qu'est-ce qui
mérite mon attention maintenant ». Les deux peuvent porter sur le même domaine sans
redondance, puisqu'ils répondent à des questions différentes.

## Point ouvert à trancher avant l'écriture des règles

Le poids et la masse grasse ne sont pas mesurés tous les jours (dépend de la fréquence
d'usage de la balance connectée). « Dernier point enregistré » peut donc dater de
plusieurs jours. Faut-il afficher la date du point à côté de la valeur pour éviter de
laisser croire qu'il s'agit d'une mesure du jour même ? Recommandation : oui,
systématiquement (cohérent avec la section 22 du prompt de refonte sur les états de
données explicites — ne jamais laisser une valeur ancienne se faire passer pour une
valeur fraîche).

## Prochaine étape

Une fois cette liste validée, écrire les règles de score/seuil (catalogue de règles de
détection + algorithme de sélection décrit dans la conversation) pour le reste de
l'information par domaine.
