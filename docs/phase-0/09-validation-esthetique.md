# Validation esthétique — Phase 0

*Ref #1.*

## Décision

Quentin a validé la **direction F — Cartes premium**
(`prototypes/phase-0/f-cartes-premium/index.html`) comme direction visuelle de
KDM360, après un rejet complet des 5 directions initiales A-E et une itération basée
sur deux captures de référence qu'il a fournies.

**Validation explicitement provisoire** : « validé pour l'instant, il faudra que je la
teste en production et en condition réelle. Attends-toi à des modifications. » — ce
n'est pas un arrêt définitif du travail sur le design, mais le déblocage du
développement réel (section 2 et 27 du prompt de refonte : le STOP de la Phase 0 porte
sur l'architecture définitive, la migration, le branchement de sources réelles et les
PR, pas sur des ajustements visuels ultérieurs).

## Ce que ça débloque

Conformément à la section 27 du prompt de refonte, une fois la direction choisie :

1. Formaliser le design system (à partir de la direction F).
2. Mettre en place les règles GitHub inspirées de Nexora (labels, templates,
   statuts).
3. Définir l'architecture technique.
4. Écrire les contrats de données.
5. Créer la matrice de migration OS360 → KDM360.
6. Créer la roadmap.
7. Ouvrir les issues nécessaires.
8. Commencer le développement sur branche dédiée.

## Ce que ça ne débloque pas encore

Le caractère provisoire de la validation ne change rien aux garde-fous déjà actés :
aucune PR, aucune fusion, aucun déploiement sans feu vert explicite supplémentaire — et
il faut s'attendre à revenir sur des détails visuels de la direction F pendant que le
développement réel avance (densité, couleurs, composants), sans que cela remette en
cause le choix de direction lui-même.
