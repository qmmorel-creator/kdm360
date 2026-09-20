# KDM360 — Architecture technique

*Ref #1. Décidée après validation esthétique provisoire (direction F).*

## Stack retenue

- **Build/dev** : Vite + TypeScript. Choisi contre le mono-fichier minifié d'OS360
  (audit A1) — sources lisibles, diffs revuables dès le premier commit de code.
- **UI** : React 18, function components + hooks. Pas de framework méta (Next.js) —
  KDM360 est un SPA personnel, pas un site multi-page avec besoin de SSR/SEO.
- **State** : contexte React + hooks locaux pour la V1. Pas de librairie de state
  globale (Redux/Zustand) tant que la complexité ne le justifie pas — cohérent avec
  « ne pas concevoir pour des besoins hypothétiques » (limite volontaire).
- **Graphiques** : SVG fait main pour tous les composants du design system (cohérent
  avec la Phase 0). Le Sankey est réimplémenté fidèlement à l'algorithme documenté dans
  `02-sankey-reference.md` (moteur maison, pas de lib).
- **Budget** : client Supabase JS (`@supabase/supabase-js`), même schéma que
  `db/schema.sql` d'OS360 — sources inchangées.
- **Santé/Social** : lecture des Google Sheets existants via les ponts Apps Script
  actuels (`fichier.gs`, `sante-photos.gs`, etc.) — jamais d'URL ni de jeton en dur
  dans le code committé (contrainte du dépôt public, avis produit section 3).
- **Tests** : `vitest` pour la logique métier (moteur de score, calculs Budget), tests
  de non-régression visuelle à ajouter séparément pour le Sankey (section 18/25 du
  prompt de refonte) — hors scope de cette première passe.

## Structure de dossiers

```
src/
  app/            — bootstrap, routing (vue active), layout (sidebar + main)
  design/         — tokens CSS, composants UI partagés (Card, KpiTile, ProgressBar…)
  charts/         — graphiques SVG faits main (courbe, barres, heatmap) + Sankey
  core/           — moteur de règles de score/seuil (détecteurs par domaine)
  data/
    finance/      — accès Supabase, normalisation Budget
    health/       — accès Sheets Santé (Whoop/Withings/Nutrition)
    sport/        — accès données Sport (source déjà existante, à identifier)
    social/       — accès Sheets Social
  domains/
    budget/       — calculs métier Budget (règles Budget360 extraites d'OS360)
    health/       — calculs Santé
    sport/        — calculs Sport
    social/       — calculs Social (score de relance, cercles)
  pages/          — Aujourd'hui, Budget, Santé, Sport, Social, Explorer
tests/            — tests du moteur de score et des calculs métier
docs/             — documentation (existant)
prototypes/       — maquettes Phase 0 (existant, non touché)
```

Séparation stricte (avis produit section 19 du prompt) : un calcul métier n'est jamais
caché dans un composant graphique. `domains/*` ne connaît rien de React ; `pages/*`
n'a pas de logique de calcul, seulement de l'orchestration d'affichage.

## Ce qui n'est PAS fait dans cette passe (limites assumées)

- **Aucune connexion réelle aux sources** (Supabase, Sheets, Apps Script) : cette
  passe construit l'application avec un adaptateur de données mocké
  (`data/*/mock.ts`) qui respecte les contrats de `docs/architecture/02-contrats-donnees.md`.
  Brancher les vraies sources nécessite les URL/clés réelles que Quentin détient — ce
  n'est pas une donnée que je peux ou dois inventer. Chaque module `data/*` expose une
  interface (`FinanceSource`, `HealthSource`, etc.) : substituer le mock par
  l'implémentation réelle ne touche à aucune autre couche.
- **Extraction fidèle des règles métier Budget360** (`effective_date`/`bank_date`,
  transferts internes, etc.) : nécessite de lire le code source réel dans
  `index.html` d'OS360 avec la méthode documentée dans `AUDIT_OS360.md`. Fait dans
  cette passe pour les règles qui déterminent l'affichage (voir contrats de données),
  mais l'implémentation exacte des calculs de patrimoine/épargne à partir de données
  réelles reste à valider avec de vraies données une fois la source branchée.
- **Réimplémentation pixel-parfaite du Sankey** : le moteur (`Yf`/`Jf` documentés) est
  reproduit fidèlement dans cette passe à partir de la documentation, mais sans jeu de
  données réel pour comparer visuellement à la production OS360 — un test de
  non-régression visuel formel (section 18/25 du prompt) reste à construire.
- **Tests de non-régression visuelle**, **CI GitHub Actions**, **déploiement Netlify**.
