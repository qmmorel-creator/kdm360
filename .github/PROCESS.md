# Suivi des demandes — KDM360

Les règles sont calquées sur celles de Nexora et d'OS360 : une demande = une issue, un
label de statut, aucune fermeture sans validation explicite de Quentin.

## Labels

- Statut (`statut:*`) :
  - `statut:backlog` — collectée, pas encore commencée
  - `statut:en-cours` — en cours de développement
  - `statut:à-tester` — déployé, en attente de validation par Quentin
  - `statut:fait` — validé et terminé
- Zone (`zone:*`) :

| Zone | Périmètre |
|---|---|
| `zone:budget` | Comptes, transactions, budgets, patrimoine, Sankey figé |
| `zone:sante` | Récupération, sommeil, composition corporelle, nutrition |
| `zone:sport` | Séances, charge, régularité, historique |
| `zone:social` | Cercles, contacts, relances, visualisations réseau |
| `zone:explorer` | Exploration analytique libre |
| `zone:design` | Design system, composants UI, esthétique |
| `zone:data` | Contrats de données, sources, adaptateurs |
| `zone:deploiement` | CI, build, déploiement |
| `zone:autre` | Hors des zones ci-dessus |

## Convention pour l'assistant

1. Avant un lot de travail, lire les issues `statut:backlog` de la ou les zones
   concernées.
2. Passer le label en `statut:en-cours` au démarrage.
3. Développer sur la branche de travail, y accumuler les commits.
4. **Ne jamais ouvrir de pull request ni fusionner sans le feu vert explicite de
   Quentin.** Annoncer ce qui est prêt, demander l'autorisation de publier le lot.
5. Une fois le feu vert donné : une pull request pour le lot, CI verte (une fois mise
   en place), une fusion. Commenter chaque issue concernée avec un résumé, passer en
   `statut:à-tester`.
6. Ne fermer une issue et passer en `statut:fait` qu'après validation explicite de
   Quentin dans un commentaire.
7. Un commit qui répond à une issue le mentionne (`Ref #12`), jamais de mot-clé de
   fermeture (`Closes #12`, `Fixes #12`, `Resolves #12`).
8. Toujours repartir du dernier état de `main` avant de coder.

## Garde-fous propres à KDM360

- Dépôt **public** dès le code source — aucun secret, jamais (voir `CLAUDE.md`).
- Sources maîtres inchangées (Supabase Budget, Google Sheets Santé/Social) — aucune
  base parallèle.
- Sankey : rendu figé, toute modification visuelle passe par une issue dédiée qui
  référence `docs/phase-0/02-sankey-reference.md`.
- Les trois visualisations Social (Radar/géographique/réseau) : fonction et type
  d'information à préserver, rendu adaptable — voir
  `docs/phase-0/05-regles-score-social.md`.
