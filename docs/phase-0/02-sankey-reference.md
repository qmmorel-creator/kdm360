# Référence Sankey figée — OS360 → KDM360

*Ref #1 — document de conception, aucun code applicatif engagé. Ce document est le
contrat de non-régression visuelle pour le Sankey : toute différence non documentée
ici, une fois KDM360 développé, est une régression.*

## Constat central

Le Sankey d'OS360 **n'utilise pas ECharts**, alors qu'ECharts est la bibliothèque de
graphes du reste de l'application. C'est un composant SVG + React **entièrement fait
main** : moteur de mise en page par bézier, heuristique de tri des nœuds par
barycentre, système de tooltip et de survol propres. Il n'y a donc pas de config
`series:{type:'sankey'}` à extraire — c'est toute la mécanique (courbure, placement des
nœuds, anti-collision des labels, dégradés de couleur) qu'il faut réimplémenter à
l'identique.

Aucune documentation préalable n'existait sur ce composant dans le dépôt OS360 (une
seule mention en une ligne dans un texte d'aide in-app). Ce document est donc la
première documentation structurée de ce composant, établie par lecture directe du code
source (`index.html`, un seul bundle minifié de 3 052 638 octets — méthode
d'exploration : fenêtres de contexte autour des correspondances, pas de `grep`/`sed`
linéaire, cf. `AUDIT_OS360.md` d'OS360).

## Aucun test de non-régression existant côté OS360

Recherche « sankey » dans `tests/*.mjs`, `scripts/*.mjs`, `tools/*.mjs` : **zéro
résultat**. Aucune capture d'écran du dépôt n'est identifiée avec certitude comme un
Sankey (le nom `screen2/croisement traits prénom.png` est ambigu — à vérifier
visuellement avant de s'y fier). **KDM360 part donc sans filet** au-delà de ce document
et d'une comparaison visuelle manuelle avec la production OS360 actuelle. Recommandation
pour la phase de développement (pas cette phase) : construire les tests de
non-régression visuelle (section 18 et 25 du prompt de refonte) en photographiant
d'abord le Sankey OS360 en production, avant toute réimplémentation.

## Les trois instances

Une seule famille dans le catalogue de widgets OS360 :
`['budget.sankey','Flux · Sankey',['budget.chart_sankey_monthly',
'budget.chart_annual_sankey','budget.chart_wealth_sankey']]`. Les trois partagent le
**même moteur de rendu**, seule la fonction de mise en forme des données change.

| Instance | Colonnes | Fonction de données | Période par défaut | Taille par défaut |
|---|---|---|---|---|
| `chart_sankey_monthly` (« Sankey mensuel ») | ORIGINE → COMPTES → DESTINATION | `Ef(accountsGraph, transactions)` | mois | 8×7 |
| `chart_annual_sankey` (« Annuel — Sankey des flux ») | ORIGINE → COMPTES → DESTINATION | `Ef(...)` (même fonction, période annuelle) | année | 9×8 |
| `chart_wealth_sankey` (« Structure du patrimoine ») | TYPE → BANQUE → COMPTE | `Df(accountsGraph, toDate, config)` | mois | 7×7 |

### Flux budget (`Ef`, offset ~750 419 dans `index.html`)

- Filtre les transactions sur `type ∈ {Dépense, Revenu, Remboursement}`, exclut
  `Transferts internes` et `Ajustement`, exclut les montants arrondis à 0.
- Colonne 0 : sous-catégories/types de revenu, palette fixe `Of = ['#3f806f','#4e8577',
  '#6fa99b','#7fb8a5','#5b9483','#8fc4b0','#9ccdb9']` (7 teintes vert/teal, cycle par
  index).
- Colonne 1 : comptes bancaires réellement utilisés, couleur = `account.color` (repli
  `#24569a` si hex invalide, via le validateur `C(e,t='#24569a')`, offset 193 988).
- Colonne 2 : catégories de dépenses, couleur = `category.color` (repli `#587894`).
- Un lien par paire compte × sous-catégorie / compte × catégorie avec valeur > 0,005.
- En-têtes littéraux (majuscules) : **« ORIGINE », « COMPTES », « DESTINATION »**.
- Nœuds pré-ordonnés par un tri stable qui regroupe par compte associé, puis par valeur
  totale de flux, puis alphabétique (locale fr).

### Flux patrimoine (`Df`, offset ~752 048)

- Flux de **stock**, pas de transaction : comptes à solde positif uniquement.
- Colonne 0 : types de compte, couleur `accountType.color` (repli cyclique
  `['#607d9b','#3f806f']`).
- Colonne 1 : banques, couleur `bank.color` (repli cyclique
  `['#256d85','#cf7856','#73927e']`).
- Colonne 2 : comptes individuels, couleur `account.color`.
- En-têtes littéraux : **« TYPE », « BANQUE », « COMPTE »**.

## Moteur de mise en page partagé — `Yf` (offset 782 188)

*(Attention : un autre `Yf` sans rapport, interne à React, existe à l'offset 178 048 —
ne pas confondre lors d'une relecture du bundle.)*

1. Élimine les liens invalides (nœuds manquants, valeurs non finies ou ≤ 0).
2. **Ordonnancement des colonnes** via `Jf` (juste avant `Yf`, offset ~781 900) :
   14 itérations de tri par barycentre pondéré (avant/arrière en alternance) puis
   8 itérations d'échange local minimisant un coût de croisement
   `Σ sqrt(valeur_i × valeur_j)` pour les paires qui se croisent. Analogue en esprit à
   la relaxation itérative de d3-sankey, mais implémentation propre à OS360.
3. **Dimensionnement**, entièrement dérivé de la largeur/hauteur du conteneur (donc
   responsive) :
   - seuil « étroit » : largeur conteneur < 620px.
   - hauteur `f = clamp(max(280, hauteurConteneur, 44 + colonnes×29), …, 920)`.
   - marge gauche `p = clamp(étroit?104:128 … 196, largeur×0,23)`.
   - marge droite `m = clamp(étroit?116:138 … 226, largeur×0,26)`.
   - largeur des rectangles de nœud (fixe, toutes colonnes) `g = clamp(11..17,
     largeur/52)`.
   - colonnes espacées uniformément entre les deux marges.
   - police du nom : `clamp(9,5..12, étroit?10,5:11,5)` ; police de la valeur :
     `max(8,5, policeNom-1)`.
4. **Échelle verticale commune aux colonnes** (documentée dans le `<desc>` a11y du SVG
   lui-même : *« Échelle monétaire commune aux colonnes. Les hauteurs des piliers et des
   rubans sont proportionnelles aux montants réels. »*) :
   `osSankeyTotal = max` sur les colonnes de la somme des valeurs de nœuds de cette
   colonne ; `osSankeyScale = hauteurUtile / osSankeyTotal`. Cette échelle unique
   px-par-euro s'applique à **tous** les nœuds et liens de **toutes** les colonnes —
   un nœud de 1000 € a la même hauteur dans chaque colonne.
5. **Empilement des nœuds** : zéro espace entre rectangles consécutifs d'une même
   colonne (`y0=a; y1=a+valeur×échelle; a=y1`). Positions des labels calculées à part,
   puis « dé-collées » : si deux labels sont plus proches que l'espacement minimal
   (police nom + police valeur + 7px), ils sont écartés et bornés dans les marges
   (58px haut, 24px bas). Un connecteur « coude » relie le rectangle au label
   uniquement si le label a bougé de plus de 1px.
6. **Sous-ordre des liens à l'intérieur d'un nœud** : ordonnés par la position de l'autre
   extrémité, empilés sans espace — schéma standard pour limiter les croisements aux
   bords de nœud.
7. **Courbe des rubans** : bézier cubique, point de contrôle exactement au milieu
   horizontal entre les deux colonnes (courbure fixe ≈ 0,5, non paramétrable par
   l'utilisateur — ce n'est pas la propriété `curveness` d'ECharts puisqu'ECharts n'est
   pas utilisé) :
   ```
   M{x_src1},{srcY0} C{mid},{srcY0} {mid},{tgtY0} {x_tgt0},{tgtY0}
   L{x_tgt0},{tgtY1} C{mid},{tgtY1} {mid},{srcY1} {x_src1},{srcY1} Z
   ```

## Composant de rendu — `nCe` (offset 1 939 788)

- Structure : `div.sankey-container` → `div.sankey-figure` → `svg.sankey-svg
  .sankey-svg-v3` (`viewBox`, `role="group"`, `aria-label="{titre} · {col0} → {col1} →
  {col2}"`).
- `<desc>` a11y reproduite ci-dessus (section échelle commune).
- **Dégradé par ruban** : `<linearGradient gradientUnits="userSpaceOnUse">` horizontal,
  couleur du nœud source → couleur du nœud cible, stops 0 %/100 %. **Chaque ruban est un
  dégradé gauche→droite de la couleur d'origine vers la couleur de destination** —
  détail visuel à reproduire exactement.
- **En-têtes de colonne** : label majuscule espacé (`fontSize 9, weight 700,
  letterSpacing .08em, fill #60717c`, ex. « ORIGINE »/« COMPTES »/« DESTINATION ») +
  total en grand (`fontSize 15, weight 700, fill #14232d`), formaté en pleine précision
  puis compacté (« 1,2 k € ») ou masqué si la largeur mesurée (canvas) ne suffit pas.
- **Dernière colonne uniquement** : ligne supplémentaire « Solde du mois : {total
  dernière colonne − total première colonne} », couleur `var(--health)` si positif,
  `var(--danger)` si négatif, `fontSize 10, weight 700`. *Note* : ce libellé français
  fixe (« Solde du mois ») est utilisé tel quel même pour l'instance annuelle — à
  signaler comme incohérence existante à trancher (la préserver telle quelle, ou la
  corriger, mais consciemment et pas par accident).
- **Rubans** (`g.sankey-ribbons`, classe `b360-flow-ribbon`) : `<path fill="url(#…)"
  style="mix-blend-mode:multiply">`.
  - Opacité par défaut = `flowOpacity` (0,52, réglable par l'utilisateur 0,1–1, libellé
    « Opacité des rubans (0,1 à 1) »).
  - Si un élément est survolé/sélectionné : 0,9 pour le lien concerné et tout lien
    partageant une extrémité, 0,1 pour le reste (mise en évidence forte).
  - `mix-blend-mode:multiply` toujours actif → les rubans qui se superposent
    s'assombrissent visuellement à l'intersection.
  - Interaction : `tabIndex=0`, `role="button"`, `aria-label="{source} → {cible} ·
    {valeur}€"`, `<title>` natif en repli, survol/focus affiche un tooltip personnalisé
    et surligne, clic **fait la même chose que le survol** (épingle le tooltip) —
    **aucun drill-down/navigation au clic aujourd'hui**.
- **Nœuds** (`g.sankey-nodes`, classe `b360-flow-node`) : `<rect rx="2" stroke="#fff"
  stroke-width=".7">`, opacité 0,14 quand un autre élément est sélectionné et que ce
  nœud n'est pas dans l'ensemble lié. Mêmes interactions que les rubans.
- **Labels** : nom toujours affiché ; valeur affichée seulement si
  `config.sankeyShowValues !== false && config.labelMode !== 'none'`. Ancrage à gauche
  du texte pour la dernière colonne, à droite pour les autres. Connecteur « coude »
  (couleur du nœud, épaisseur 0,9, opacité 0,75) uniquement si le label a été déplacé de
  plus de 1px par l'anti-collision.
- **Halo blanc sur le texte** : `paint-order:stroke fill; stroke: rgba(255,255,255,.96)`
  — lisibilité garantie quelle que soit la couleur du ruban en dessous.
- **États de focus clavier visibles** : `.b360-flow-node:focus>rect{stroke:#14232d;
  stroke-width:2}` et `.b360-flow-ribbon:focus{outline:none;stroke:#14232d;
  stroke-width:1.5}`.
- **Tooltip personnalisé** (pas seulement le `<title>` natif) : positionnement avec
  logique anti-débordement (« flip » selon la position dans le conteneur), structure
  `div.sankey-tooltip.os-tooltip` avec titre du graphe, contexte (source → cible ou nom
  du nœud + valeur formatée), pourcentage du nœud d'origine pour les liens, pied avec la
  période (ex. « sept. 2026 »).
- **Repli tableau de données** : un bouton en pied de graphe bascule vers
  `div.sankey-data > table` listant chaque lien (Origine/Destination/Valeur) —
  affordance d'accessibilité/inspection, pas une visualisation alternative.
- **Redimensionnement** : `ResizeObserver` sur le conteneur, relance complète de `Yf` —
  vraie remise en page responsive, pas une simple transformation CSS `scale`.

## CSS globale à reproduire

```css
.sankey-container{flex-direction:column;height:100%;min-height:0;display:flex}
.sankey-figure{flex:1;min-height:0;position:relative;overflow:hidden}
.sankey-svg{width:100%;height:100%;display:block;overflow:hidden}
.sankey-footer{color:#60717c;justify-content:space-between;align-items:center;gap:8px;padding:3px 7px;font-size:10px;display:flex}
.sankey-footer button{min-height:22px;padding:2px 7px;font-size:10px}
.sankey-footer span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}
.sankey-tooltip{z-index:5;pointer-events:none;max-width:min(285px,100% - 8px);position:absolute}
.sankey-data{position:absolute;inset:0;overflow:auto}
.sankey-data th{background:#fff;position:sticky;top:0}
.b360-flow-node,.b360-flow-ribbon{cursor:pointer}
```

`.os-tooltip*` est thémée (variantes par thème, y compris le thème sombre « nuit », et
masquée en contexte impression/PDF).

## Réglages exposés à l'utilisateur

- `sankeyShowValues` (bool, « Afficher les montants ») et `flowOpacity` (0,1–1,
  « Opacité des rubans (0,1 à 1) ») — valeurs forcées par défaut à `true`/`0,52` à la
  création de tout widget dont le type contient « sankey ».
- Regroupés dans le panneau de réglages sous « Étiquettes et nombres »
  (`sankeyShowValues`, `labelMode`, `decimals`, `rounding`, `unit`) et « Apparence »
  (`flowOpacity`, `palette`, `color`, `opacity`).

## Identifiants à conserver comme repères lors de la réimplémentation

`Yf` (782 188, moteur de mise en page — attention au faux-ami à 178 048), `Jf`
(~781 900, ordonnancement anti-croisement), `nCe` (1 939 788, composant de rendu),
`Ef` (750 419, données flux budget), `Df` (752 048, données flux patrimoine), `Kf`
(contexte titre/période/tooltip), `C` (193 988, validateur couleur hex), `osSankeyTotal`
/`osSankeyScale` (locaux à `Yf`), `rCe` (1 941 890, CSS scoped `.b360-flow-*`).

## Ce qui doit rester **strictement identique** dans KDM360

- Zéro espacement entre nœuds/liens empilés (rectangles jointifs).
- Dégradé horizontal par ruban (couleur source → couleur cible).
- `mix-blend-mode:multiply` sur les rubans.
- Courbure bézier fixe au point médian (~0,5), non paramétrable.
- Les quatre états d'opacité (0,52 par défaut / 0,9 en surbrillance / 0,1 atténué-lien /
  0,14 atténué-nœud).
- Halo blanc du texte (`paint-order:stroke fill`).
- Palettes et replis de couleur exacts (`Of` teal, `#24569a`/`#587894`/`#607d9b`, etc.).
- Absence de drill-down au clic (survol/clic ne font qu'épingler le tooltip et
  surligner) — ne pas ajouter de navigation qui n'existe pas aujourd'hui, ce serait déjà
  un écart par rapport à la référence figée.
- Libellés littéraux des colonnes (« ORIGINE »/« COMPTES »/« DESTINATION » et
  « TYPE »/« BANQUE »/« COMPTE »).

## Dans les 5 maquettes de cette phase

Aucune des 5 maquettes ne dessine un Sankey stylisé. Chacune place, au même endroit
(Budget → zone d'exploration), un bloc identique indiquant qu'il s'agit d'un espace
réservé pour le Sankey figé — voir `prototypes/phase-0/shared/brief-commun.md`.
