# KDM360 — Matrice de parité OS360 → KDM360

*Ref #1. Basée sur l'inventaire de l'audit OS360 (`AUDIT_OS360.md`,
`RAPPORT_AUDIT_2026-09-15.md`) et les décisions prises en Phase 0. Première passe —
à affiner une fois les sources réelles branchées.*

| Fonction OS360 | Source | Règle métier | Équivalent KDM360 | Statut |
|---|---|---|---|---|
| Sankey mensuel/annuel des flux | Supabase | Moteur SVG maison (`Ef`, `Yf`) | Composant Sankey figé | Conservée à l'identique (pixel) |
| Sankey structure du patrimoine | Supabase | Moteur SVG maison (`Df`, `Yf`) | Composant Sankey figé | Conservée à l'identique (pixel) |
| Budget : `effective_date`/`bank_date` | Supabase | Distinction déjà en place | Contrat `Transaction` (`02-contrats-donnees.md`) | Conservée, nouvelle UX |
| Budget : transferts internes | Supabase | Exclus des calculs de dépense | Détecteurs A/B Budget | Conservée à l'identique |
| Budget : transactions futures | Supabase | Autorisées, `isFuture` | Contrat `Transaction` | Conservée à l'identique |
| Budget : budgets exclus des dépenses | Supabase | `excludedFromSpending` | Contrat `Category` | Conservée à l'identique |
| Budget : règles d'épargne, ajustements | Supabase | Non extraites en détail (accès limité, voir avertissement `02-contrats-donnees.md`) | À valider avec le schéma réel | **À vérifier avant migration** |
| Sunburst dépenses | ECharts (OS360) | — | Graphique SVG maison, zone Exploration Budget | Conservée, nouvelle UX |
| Tableau de bord Budget (widgets libres) | GridStack | — | Page Budget à lecture unique + Explorer | Fusionnée / nouvelle UX (avis produit §6) |
| Cascade temporelle (waterfall) | ECharts | — | Zone Exploration Budget | Déplacée vers Explorer |
| Calendrier annuel | Widget GridStack | — | Non prioritaire V1 | À trancher (Explorer ou abandon si redondant avec la trajectoire) |
| Whoop (récupération, sommeil, strain) | Google Sheets | Collecte inchangée | Page Santé, détecteurs A/B/C/D | Conservée, nouvelle UX |
| Withings (poids, masse grasse) | Google Sheets | Collecte inchangée | Métriques figées Santé, détecteurs E/F | Conservée, nouvelle UX |
| Nutrition | Google Sheets | Collecte inchangée | Page Santé, détecteur G (facteur calorique) | Conservée, nouvelle UX |
| Sport (CrossFit, course, vélo, trail) | Source existante (à identifier précisément) | — | Page Sport, détecteurs A/B/D/E/F | Conservée, nouvelle UX |
| Radar relationnel (polaire) | ECharts (OS360) | — | Aperçu SVG Social (rendu adaptable) | Conservée avec nouvelle UX (fonction identique, rendu libre — `05-regles-score-social.md`) |
| Vue géographique (GPS) | `gps.gs` + Google Sheets | Module GPS existant | Aperçu SVG Social | Conservée avec nouvelle UX — **détail fonctionnel exact à vérifier dans `MODULE_GPS.md`/`gps.gs` avant migration réelle** |
| Réseau relationnel (graphe) | ECharts (OS360) | — | Aperçu SVG Social | Conservée avec nouvelle UX |
| Cercles, seuils, relances | Google Sheets + Apps Script | Logique de seuil par cercle | Détecteurs A/B Social | Conservée à l'identique (règles), nouvelle UX |
| Fiche contact (heatmap, historique) | Google Sheets | — | Page Social, fiche contact | Conservée, nouvelle UX |
| Module Documents | `documents.gs` + Google Drive | Recherche Drive (faille D2 de l'audit) | Non repris en V1 | **Abandonnée en V1** — à rouvrir seulement après correction de la faille de sécurité côté source (hors périmètre KDM360, cf. avis produit §3) |
| Module Véhicule | `vehicule.gs` | CRUD véhicules non authentifié (faille D1) | Non repris en V1 | **Abandonnée en V1** — même réserve de sécurité |
| Système de widgets GridStack (catalogue, placement libre, duplication) | OS360 natif | — | Aucun équivalent — paradigme abandonné | **Abandonnée** (avis produit §1 et §3) — remplacé par hiérarchisation automatique + Explorer pour la composition libre |
| 7 thèmes visuels (`pop`, `solaire`, etc.) | OS360 natif | — | Design system direction F unique | **Abandonnée** — un seul langage visuel pour l'instant, thème sombre non prioritaire (`00-design-system.md`) |
| `confirm()`/`alert()` natifs | OS360 natif | — | Composant de confirmation du design system | Remplacée (corrige F1 de l'audit) |

## Statuts non résolus à cette étape

- **Règles d'épargne et d'ajustement Budget** : nécessitent une lecture du code source
  réel dans `index.html` (méthode `AUDIT_OS360.md`), non faite dans cette passe faute
  de code applicatif à disposition avec le niveau de détail suffisant sans risque
  d'erreur d'interprétation. À faire avant de brancher la vraie source Budget.
- **Module GPS / vue géographique** : `MODULE_GPS.md` existe dans OS360 mais n'a pas
  été audité en détail dans cette passe. À lire avant l'implémentation réelle de
  l'aperçu géographique Social.
- **Documents et Véhicule** : la décision de ne pas les migrer en V1 est une
  proposition de cette passe, pas une décision actée par Quentin — à confirmer, les
  deux modules restant fonctionnels dans OS360 lui-même en attendant.
