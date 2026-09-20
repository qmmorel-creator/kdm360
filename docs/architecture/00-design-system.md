# KDM360 — Design System

*Ref #1. Formalisé à partir de la direction visuelle validée (Phase 0, direction F —
`prototypes/phase-0/f-cartes-premium/index.html`), après retours de Quentin sur la
police des chiffres et la densité. Validation provisoire — voir
`docs/phase-0/09-validation-esthetique.md`.*

## Principes

- Cartes blanches à coins arrondis sur fond crème chaud, densité élevée, pas d'espace
  perdu.
- Les chiffres clés sont **toujours** en sans-serif (Inter), jamais en serif — règle
  stricte issue d'un retour explicite de Quentin.
- La couleur code l'information (positif/négatif/neutre), jamais la décoration.
- Aucun emoji comme langage graphique, aucun gradient arc-en-ciel, aucune jauge gadget.

## Tokens de couleur

```css
--bg:#F7F5F0;            /* fond de page */
--card:#FFFFFF;          /* fond des cartes */
--border:#E7E2D6;        /* bordures fines */
--teal:#3f7a6a;          /* accent principal — positif, actif, lien */
--teal-dark:#2b5044;     /* texte/valeurs sur accent teal */
--teal-pale:#e9f1ee;     /* fond teinté (nav active, badges) */
--coral:#c17552;         /* alerte / négatif — jamais un rouge vif agressif */
--coral-pale:#f7e9e1;    /* fond teinté corail */
--peach-pale:#faf0e8;    /* fond neutre secondaire (badges, encarts) */
--ink:#1a2420;           /* texte fort, valeurs */
--gray:#6b7268;          /* texte secondaire */
--gray-light:#9a9d94;    /* labels, texte tertiaire */
--radius:16px;           /* rayon des cartes */
--radius-sm:10px;        /* rayon des éléments internes */
--shadow: 0 1px 2px rgba(26,36,32,.04), 0 1px 1px rgba(26,36,32,.03); /* ombre discrète */
```

Palette sémantique fixe : `teal` = positif/actif, `coral` = négatif/alerte. Jamais
d'autre couleur pour ces deux rôles, dans aucune page.

## Typographie

- **Titres (H1/H2, `.page-title`, `.card-title`)** : Fraunces (serif display),
  graisse 600-700.
- **Tout le reste, y compris toutes les valeurs numériques** : Inter, avec
  `font-variant-numeric: tabular-nums` sur les nombres.
- Labels de section : petites capitales, `letter-spacing` large, `--gray-light`.
- `.kpi-value` : Inter, `font-weight:800`, `letter-spacing:-0.8px` — jamais Fraunces.

## Densité (valeurs de référence après le retour de Quentin)

- Padding carte : `16px 18px`.
- Gap de grille : `14px`.
- `main` padding : `24px 30px 44px`.
- `.page-head` margin-bottom : `18px`.
- Listes internes (`.watch-row`, `.contact-row`) : padding vertical `9-10px`.

## Composants

| Composant | Classe | Usage |
|---|---|---|
| Carte | `.card` | Conteneur de base, partout |
| Tuile KPI | `.kpi-tile` | Chiffre clé + delta + mini-graphe |
| Ligne « à regarder » | `.watch-row` | Signal de score, numéroté, chevron |
| Barre de progression avec repère | `.metric-row` + `progressBarSVG()` | Consommation budget, récupération/sommeil, objectifs |
| Barre de répartition | `.disc-row` | Répartition par discipline/catégorie |
| Badge | `.badge-neutral` / `.badge-teal` / `.badge-coral` | Statut, comptage |
| Carte verrouillée | `.locked-card` | **Réservée exclusivement au Sankey** (seul composant à rendu figé) |
| Aperçu neutre | `.preview-box` | Aperçus non figés (Radar/géo/réseau Social) — rendu adaptable |
| Heatmap | `.heatmap` / `.heat-cell` | Historique d'interactions Social |

## Graphiques

Tous faits main en SVG, pas de bibliothèque de graphes pour les composants du design
system (le Sankey est la seule exception, en composant à part — voir
`02-sankey-reference.md`). Conventions :
- Courbe avec aire teintée (`teal-pale-2`) pour les trajectoires temporelles.
- Barres avec repère pointillé pour les valeurs cible/référence (budget vs rythme,
  sommeil vs besoin, régularité vs moyenne).
- Annotations directes sur les points remarquables (pic, creux), pas de légende à part
  quand la valeur peut être écrite sur le graphique.

## Ce qui reste à trancher pendant le développement

- Mode sombre : non spécifié par la direction F (elle est exclusivement claire à ce
  stade). À statuer si un besoin réel émerge — pas une priorité de la V1.
- `prefers-reduced-motion` : à appliquer aux transitions de vue (`.view.active`
  animation `fade`) une fois en React.
