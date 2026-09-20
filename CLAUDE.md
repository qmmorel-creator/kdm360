# Consignes pour les assistants (Claude, ChatGPT, autres)

Toute demande d'amélioration ou de correction sur KDM360 est suivie par une issue
GitHub.

**Avant de commencer un travail, lire [`.github/PROCESS.md`](.github/PROCESS.md)** et
appliquer la section « Convention pour l'assistant ».

## KDM360 est un dépôt public

Contrairement à OS360 (dépôt privé, site public), **le dépôt KDM360 est public dès le
code source**. Ne jamais committer : token, mot de passe, clé privée, `service_role`
Supabase, credential Google, secret Apps Script, URL contenant un token, secret
Netlify, fichier de compte de service, données personnelles inutiles au code.

Toute intégration de source (Supabase, Google Sheets/Apps Script) passe par une
configuration utilisateur (variables d'environnement / réglages), jamais par une
constante commitée — voir `docs/phase-0/00-avis-produit.md` section 3.

## Sources de données — ne pas modifier

Les sources maîtres restent celles d'OS360 : Supabase pour Budget, Google Sheets pour
Santé/Social. KDM360 ne crée aucune base parallèle. Voir
`docs/architecture/02-contrats-donnees.md` pour les contrats attendus et
`docs/architecture/04-matrice-migration.md` pour la correspondance avec OS360.

## Sankey — rendu figé

Les Sankey (`docs/phase-0/02-sankey-reference.md`) sont un rendu figé : aucune
modification visuelle, même involontaire, n'est acceptable. Toute évolution passe par
une issue dédiée qui référence explicitement ce document.

## Ne déploie pas de ta propre initiative

- Développe sur une branche `claude/...`, **jamais directement sur `main`**.
- Accumule les commits, annonce ce qui est prêt, et **demande le feu vert de Quentin**
  avant de fusionner sur `main`.
- Un feu vert vaut pour un lot, pas pour les suivants.
- **`Ref #N` dans les messages de commit, jamais `Fixes #N`/`Closes #N`/`Resolves #N`.**
  La fermeture des issues appartient à Quentin après validation.

## Structure

- `docs/phase-0/` — audit, avis produit, décisions de conception (métriques figées,
  règles de score).
- `docs/architecture/` — design system, stack technique, contrats de données, matrice
  de migration, roadmap.
- `prototypes/phase-0/` — maquettes visuelles de la Phase 0 (référence, non modifiées
  après validation).
- `src/` — code applicatif (voir `docs/architecture/01-architecture-technique.md`).
