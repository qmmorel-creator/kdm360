# Brief commun aux 5 maquettes — Phase 0 KDM360

*Ref #1.* Ce brief est le cahier des charges commun envoyé à chaque direction (A à E).
Il fixe ce qui doit être identique pour que la comparaison porte sur le langage visuel,
pas sur le contenu ou la structure.

## Livrable attendu par direction

Un seul fichier HTML autonome (CSS + JS inline, aucune dépendance externe sauf
polices Google Fonts si besoin), navigable, montrant au minimum 5 vues accessibles par
une navigation interne (onglets ou équivalent) :

1. Aujourd'hui
2. Budget
3. Santé
4. Sport
5. Social

## Contenu obligatoire par vue (données figées, voir `demo-data.md`)

Reprendre exactement les valeurs numériques du fichier `demo-data.md` du même dossier.
Ne pas inventer d'autres chiffres — la mise en forme change, pas le contenu.

## Règle absolue — Sankey

Ne pas dessiner de Sankey personnalisé. Dans l'onglet Budget → zone d'exploration,
placer un bloc clairement délimité avec le label « Sankey OS360 — rendu figé,
intégration pixel-identique prévue (voir docs/phase-0/02-sankey-reference.md) » et,
à l'intérieur, une simple description textuelle ou un schéma neutre (pas un vrai
Sankey stylisé) indiquant qu'il s'agit d'un espace réservé. Les 5 directions doivent
traiter ce bloc de façon strictement identique (même texte, même position dans la
page) — c'est le seul élément qui ne doit PAS varier entre les 5 maquettes.

## Exigences transverses

- Desktop ET mobile : le fichier doit être responsive (au moins un point de rupture
  vers 700px), à tester en réduisant la fenêtre.
- Accessibilité de base : structure sémantique (`nav`, `main`, `h1`/`h2`), contraste
  suffisant, focus visible au clavier sur les éléments interactifs.
- Pas d'emoji comme langage graphique. Pas de glassmorphism gratuit, pas de dégradés
  arc-en-ciel, pas de gros pictogrammes ludiques, pas de jauges gadget.
- Densité maîtrisée : chaque vue doit refléter la philosophie « peu de choses, mais
  les bonnes » — pas un mur de cartes, même dans la direction B (Cockpit), où la
  densité doit venir de l'organisation de l'information, pas de son accumulation.
- Typographie soignée et cohérente avec la direction assignée (voir ci-dessous).
- Au moins un vrai graphique (SVG ou Canvas fait main, pas de placeholder image)
  illustrant une donnée de `demo-data.md` : par exemple la trajectoire budgétaire du
  mois, ou l'historique sport 12 mois, ou la heatmap Social. Il doit respecter les
  mêmes exigences de qualité que le reste du prompt de refonte (grille, labels,
  légende, pas de rendu « bibliothèque par défaut »).
- Nom de fichier : `prototypes/phase-0/<lettre>-<slug>/index.html` (ex. :
  `prototypes/phase-0/a-editorial/index.html`).

## Ce qui doit rester interdit dans toutes les directions

Repris du prompt de refonte : pas de look « fun », pas d'esthétique enfantine, pas de
couleurs bonbon, pas de gros boutons type appli grand public, pas de cartes arrondies
systématiques, pas d'ombres énormes, pas d'UI template SaaS générique.
