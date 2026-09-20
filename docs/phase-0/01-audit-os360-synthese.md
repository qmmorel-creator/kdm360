# Synthèse de l'audit OS360 — pour la Phase 0 KDM360

*Ref #1 — document de conception, aucun code applicatif engagé.*

Ce document ne remplace pas l'audit existant dans `qmmorel-creator/OS360`
(`AUDIT_OS360.md` = grille d'audit, `RAPPORT_AUDIT_2026-09-15.md` = résultat complet,
44 tests + 11 scénarios, tout vert au 15/09/2026). Il en extrait ce qui engage
directement les décisions de KDM360.

## Ce qu'OS360 est réellement

- Application mono-fichier : `index.html` (3 052 638 octets), un seul
  `<script type="module">` minifié (~2,82 Mo, 94 % du fichier), lignes jusqu'à
  356 000 caractères. **Les sources non minifiées n'existent pas dans le dépôt.**
  React 19, ECharts (build complet), Supabase JS, GridStack inlinés ; Leaflet chargé à
  la demande depuis unpkg.com.
- 8 modules applicatifs : Social, Budget, Documents, Santé, GPS, Patrimoine, Véhicule,
  Réglages.
- 7 thèmes visuels (`pop`, `solaire`, `foret`, `argile`, `nuit`, `lagune`, `carmin`),
  68 variables CSS, pilotés par `data-theme`.
- Backend Budget : Supabase, RLS pinée sur un propriétaire unique
  (`current_app_owner()`), schéma dans `db/schema.sql` (4 tables, 4 politiques,
  4 fonctions).
- Ponts de données : 5 Web Apps Google Apps Script à la racine du dépôt (`fichier.gs`,
  `gps.gs`, `vehicule.gs`, `sante-photos.gs`, `documents.gs`), non déployées avec le
  site — publiées séparément depuis l'éditeur Apps Script.
- CI : `npm run verify` (script `verify-os360.mjs` + 5 fichiers `tests/*.test.mjs` +
  `tools/test-sync-merge.mjs`) avant tout push. Déploiement : push sur `main` →
  production immédiate via `.github/workflows/deploy.yml`, qui ne publie que
  `index.html`.

## Ce qui engage directement KDM360

### Dette structurante (A1 du rapport)

Le dépôt contient l'artefact de build, pas la source. Chaque évolution actuelle d'OS360
est une édition chirurgicale dans du minifié, sans diff relisible. **KDM360 ne doit pas
reconduire ce mode de fonctionnement** — c'est la décision la plus structurante de la
section 19 du prompt de refonte (sources lisibles, séparation accès-données /
normalisation / calculs métier / visualisations / UI dès le premier commit de code).
Cette phase 0 ne construit pas encore cette architecture (conformément à la consigne de
l'issue #1), mais elle en pose la nécessité.

### Sécurité — pertinent pour les intégrations futures, pas pour cette phase

D1-D4 du rapport (ponts Apps Script sans authentification, jeton `Azerty1234!` en clair,
clé Supabase par défaut) concernent la configuration des sources, qui restent celles
d'OS360 par consigne du prompt. KDM360 ne recopie ni les URL de ponts ni les jetons dans
son propre code (le dépôt est **public**, contrainte plus stricte qu'OS360 dont le dépôt
est privé). Point de vigilance à porter dans l'architecture technique post-validation :
toute intégration de source doit être une configuration utilisateur, jamais une
constante commitée. Aucune action requise en Phase 0.

### Robustesse (B1)

Un `catch` vide avale une écriture Supabase (`os360_preferences`) sans trace ni retour
utilisateur. C'est exactement la classe d'erreur que la section 23 du prompt KDM360
interdit explicitement (« aucun `catch {}` silencieux »). Confirme que l'exigence du
prompt n'est pas théorique : elle corrige un problème réel observé dans le code
existant.

### UX (F1, G1, G2)

- 18 `confirm()` + 6 `alert()` natifs sur les actions destructrices, alors qu'un système
  de toasts existe déjà. KDM360 doit prévoir un composant de confirmation unique dès la
  conception du design system (cf. avis produit, section 3).
- `color-scheme` figé sur `light` malgré un thème sombre existant — pertinent si une des
  5 directions visuelles retenues est sombre (direction D).
- Accessibilité : socle correct (lien d'évitement, `role="status"`, 210 `aria-label`,
  18 `:focus-visible`, 8 `prefers-reduced-motion`) mais 0 `scope="col"` sur 10 tableaux,
  25 graphes ECharts sans alternative textuelle, GridStack sans alternative clavier.
  KDM360 abandonnant GridStack comme paradigme central pour la navigation principale
  (cf. avis produit), le point clavier de GridStack devient sans objet pour Aujourd'hui/
  Budget/Santé/Sport/Social ; il reste pertinent uniquement si Explorer réutilise
  GridStack (à trancher en architecture technique, pas en Phase 0).

### Fonctions à préserver explicitement (inventaire de départ pour la future matrice de parité)

Cette liste n'est pas la matrice de parité complète demandée section 24 du prompt
(qui viendra après validation esthétique) — c'est l'inventaire des règles et
fonctionnalités identifiées comme non négociables à ce stade :

| Domaine | À préserver | Source |
|---|---|---|
| Budget | distinction `effective_date`/`bank_date` | Supabase, moteur Budget360 |
| Budget | transferts internes, transactions futures autorisées | idem |
| Budget | budgets exclus des dépenses, règles d'épargne, ajustements | idem |
| Budget | calculs historiques et patrimoine | idem |
| Budget | Sankey (voir `02-sankey-reference.md`) | rendu figé |
| Santé | flux Whoop, Withings, Nutrition (Google Sheets) | routines de collecte inchangées |
| Social | cercles, contacts, interactions, participants, paramètres | Sheets + Apps Script |
| Social | règles de seuil / relance / dernier contact | logique métier existante |
| Sport | données déjà collectées, aucune nouvelle source | réutilisation, pas recopie |
| Process | `Ref #N` en commit, jamais `Fixes/Closes/Resolves #N` | gouvernance Nexora reprise |

## Ce que cette phase ne couvre pas (volontairement)

Conformément à l'issue #1 : pas d'architecture technique définitive, pas de data
contracts, pas de matrice de parité complète, pas de branchement de source réelle. Ces
chantiers sont listés section 27 du prompt et engagés seulement après le choix explicite
de Quentin sur une des 5 directions visuelles.
