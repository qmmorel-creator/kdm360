# KDM360 — Roadmap

*Ref #1. Séquencement reprenant l'avis produit (`docs/phase-0/00-avis-produit.md`,
section 8) : sécuriser le risque le plus élevé d'abord, Explorer en dernier pour ne
pas capter le temps de développement.*

## V0 — cette passe (données mockées, direction F)

1. Design system + composants UI partagés.
2. Moteur de règles de score/seuil (Budget/Santé/Sport/Social), testé.
3. Composant Sankey figé (fidèle à `02-sankey-reference.md`, données mock).
4. Les 5 pages domaine + Aujourd'hui, données mockées via les contrats
   `02-contrats-donnees.md`.
5. Squelette Explorer (volontairement minimal).
6. Gouvernance GitHub (labels, templates).
7. Issues de suivi pour tout ce que cette passe ne couvre pas.

## V1 — après cette passe (nécessite des décisions/accès que cette session n'a pas)

1. Lecture du code source réel d'OS360 pour extraire fidèlement les règles Budget360
   non couvertes ici (épargne, ajustements) — méthode documentée dans
   `AUDIT_OS360.md` d'OS360.
2. Branchement réel Supabase (Budget) — nécessite les identifiants du projet, que
   Quentin détient.
3. Branchement réel Google Sheets/Apps Script (Santé, Social) — nécessite les URL de
   ponts avec jeton, en configuration utilisateur, jamais en dur dans le code
   (avis produit §3).
4. Identification précise de la source Sport actuelle (réutilisation, pas de nouvelle
   collecte — contrainte du prompt de refonte).
5. Lecture de `MODULE_GPS.md`/`gps.gs` pour la vue géographique Social.
6. Test de non-régression visuelle du Sankey contre la production OS360 réelle.
7. Décision explicite de Quentin sur Documents/Véhicule (abandon proposé en V1,
   `04-matrice-migration.md`).
8. Accessibilité approfondie (clavier, lecteurs d'écran) sur les nouveaux composants.
9. CI (tests + vérifications avant push, façon `npm run verify` d'OS360).

## Pourquoi Explorer est volontairement en dernier

Rappel de l'avis produit : Explorer est la page la plus facile à construire (réutilise
le plus de code existant) et la plus tentante à enrichir en premier — mais c'est
exactement le piège qui a fait dériver OS360 vers un constructeur de tableau de bord.
Le squelette V0 est minimal ; l'enrichissement réel n'est pas dans cette passe.
