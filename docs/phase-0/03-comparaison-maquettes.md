# Comparaison des 5 maquettes — Phase 0 KDM360

*Ref #1. Ce document ne classe pas et ne choisit pas à la place de Quentin — c'est
une aide à la décision, conformément à l'issue #1.*

Les 5 prototypes sont dans `prototypes/phase-0/<lettre>-<slug>/index.html`, chacun
autonome (s'ouvre directement dans un navigateur, sans serveur). Ils partagent
strictement les mêmes données de démonstration (`shared/demo-data.md`) et le même
traitement du Sankey (bloc espace réservé identique, texte identique, aucun rendu
stylisé — voir `02-sankey-reference.md`). Seul le langage visuel varie.

## A — Editorial Analytical

`prototypes/phase-0/a-editorial/index.html`

- **Philosophie** : la page se lit comme un article de presse économique. Masthead,
  chapô, lettrine, colonne de lecture large + rail de chiffres clés étroit. La
  narration texte porte l'essentiel ; les chiffres illustrent plutôt qu'ils ne
  dominent.
- **Forces** : c'est la direction qui rend le mieux la promesse « comprendre en
  quelques secondes » — le paragraphe de tête d'Aujourd'hui résume littéralement la
  situation en langage naturel avant même les chiffres. Palette quasi monochrome +
  un seul accent (brique) très efficace pour distinguer signal et bruit. Rendu
  incontestablement premium et adulte.
- **Limites** : la lecture narrative est moins adaptée à un usage répété et rapide
  (« coup d'œil de 10h du matin ») qu'à une lecture posée une fois par jour — à
  vérifier à l'usage si elle convient aussi pour des consultations fréquentes dans la
  journée. La densité d'information par écran est la plus faible des 5.
- **Densité** : faible à moyenne, volontairement.
- **Desktop** : excellent — la grille asymétrique (colonne large + rail) exploite bien
  l'espace.
- **Mobile** : bon, la grille éditoriale repasse en une colonne, le rail de chiffres
  clés passe en grille 2 colonnes sous le texte.
- **Dataviz complexe** : correcte mais pas son point fort — les graphiques sont traités
  comme des illustrations du texte plutôt que comme des instruments de lecture dense ;
  une page Explorer très chargée en visualisations pourrait s'y sentir à l'étroit.

## B — Cockpit analytique premium

`prototypes/phase-0/b-cockpit/index.html`

- **Philosophie** : instrument de précision. Séparations par hairlines sur fond
  charbon, aucune ombre ni carte flottante, chiffres tabulaires alignés. Beaucoup
  d'information visible simultanément mais organisée en cellules stables et
  régulières.
- **Forces** : la plus proche de « peu de choses mais denses et exactes ». Aucune
  dérive gamer/terminal malgré la référence "cockpit" — le rendu reste un instrument
  professionnel, pas un jeu. Très bonne assise pour une page Explorer riche en
  graphiques, puisque le langage visuel est déjà pensé pour la densité.
- **Limites** : le fond sombre par défaut est un choix fort qui empiète sur le
  territoire naturel de la direction D (dark luxury) — si les deux sont retenues comme
  favorites, il faudra trancher clairement ce qui les distingue en pratique
  (rigueur/densité pour B vs raffinement/retenue pour D). Le risque signalé dans l'avis
  produit (densité = accumulation) est ici le plus proche d'être atteint si la
  discipline de hiérarchisation n'est pas maintenue au-delà de cette maquette.
- **Densité** : élevée, mais hiérarchisée (zones nettes : indicateurs de tête / à
  regarder / détail).
- **Desktop** : excellent, c'est son terrain naturel.
- **Mobile** : bon — nav en scroll horizontal, grilles repassent en 1-2 colonnes.
- **Dataviz complexe** : très bonne aptitude — c'est la direction la mieux équipée par
  construction pour accueillir beaucoup de visualisations sans rupture de langage.

## C — Swiss / Scientific

`prototypes/phase-0/c-swiss/index.html`

- **Philosophie** : rigueur cartographique. Grille 12 colonnes visible (réglette de
  coordonnées en tête), palette réduite à 2 couleurs sémantiques constantes (bleu =
  focus, rouge = écart) sur tout le reste en noir/blanc/gris, typographie unique
  (Inter) portant toute la hiérarchie.
- **Forces** : la direction la plus stricte et la plus prévisible à étendre à de
  nombreuses pages et de nombreux graphiques — une grille et une palette aussi
  disciplinées donnent une cohérence quasi automatique dès qu'on ajoute du contenu.
  Excellente lisibilité, aucune ambiguïté sur ce qui est signal (rouge) vs normal.
- **Limites** : c'est la direction qui a le moins de « caractère » émotionnel des 5 —
  elle peut être perçue comme froide ou austère si l'esthétique recherchée est aussi
  « premium » au sens chaleureux (cf. section esthétique du prompt : « sophistiquée »
  peut ou non inclure un supplément d'âme selon l'interprétation). C'est un vrai choix,
  pas un défaut en soi.
- **Densité** : moyenne à élevée, très régulière.
- **Desktop** : excellent — la grille 12 colonnes est faite pour ça.
- **Mobile** : bon — empilement 1 colonne, réglette masquée, la discipline de grille se
  maintient.
- **Dataviz complexe** : très bonne aptitude, comparable à B — la précision scientifique
  (axes gradués, annotations) est directement transposable à Explorer.

## D — Dark Luxury Analytical

`prototypes/phase-0/d-dark-luxury/index.html`

- **Philosophie** : retenue plutôt qu'effet. Fond anthracite chaud (jamais noir pur),
  palette signature désaturée (or champagne, bleu ardoise, sauge, terracotta) utilisée
  uniquement pour porter une valeur, jamais en décoration. Serif fine (Fraunces) pour
  les montants clés.
- **Forces** : c'est la direction qui répond le plus directement à la contrainte
  explicite « surtout pas gamer/cyberpunk/néon » en l'évitant par construction plutôt
  qu'en s'en défendant après coup — le cadran façon horlogerie pour Recovery en est un
  bon exemple (précision, pas gadget). Rendu très abouti, sensation réellement haut de
  gamme.
- **Limites** : la palette désaturée, si elle est reprise telle quelle, demande une
  vigilance particulière sur l'accessibilité — l'agent qui l'a construite signale
  lui-même qu'elle échoue les seuils génériques de contraste catégoriel d'un validateur
  de palette (mitigé ici par une redondance systématique couleur+texte, mais un point à
  retester formellement si cette direction est retenue). Le mode sombre par défaut peut
  ne pas convenir à tous les contextes d'usage (extérieur, plein soleil).
- **Densité** : moyenne, avec de la respiration.
- **Desktop** : excellent.
- **Mobile** : bon — nav scrollable, grilles réajustées.
- **Dataviz complexe** : bonne aptitude, avec un vrai soin porté aux graphiques
  spécifiques (cadran, sparkline) plutôt qu'à une grille générique — pertinent pour des
  vues signature (Aujourd'hui, fiches) mais à valider sur un Explorer très chargé.

## E — Spatial / Compositional

`prototypes/phase-0/e-spatial/index.html`

- **Philosophie** : composition de plan plutôt qu'empilement de cartes. Une ligne de
  temps horizontale traverse la vue Aujourd'hui et relie visuellement Santé et Sport
  par une ligne pointillée — matérialisant littéralement une relation entre domaines
  plutôt que de la laisser implicite.
- **Forces** : c'est la direction qui va le plus loin sur l'exigence « moins dépendante
  des cartes rectangulaires » et sur l'idée de relations visibles entre domaines (cf.
  le point de l'avis produit sur le risque de double calcul Santé/Sport — cette
  direction rend cette relation visible plutôt que de la cacher derrière deux cartes
  indépendantes). Identité la plus distinctive des 5, aucun risque de ressembler à un
  template SaaS.
- **Limites** : c'est aussi la direction la plus exigeante à étendre correctement — une
  composition « architecturale » bien pensée sur 5 vues de démonstration peut devenir
  difficile à maintenir cohérente sur un produit complet avec beaucoup plus de
  contenu et d'états (chargement, erreur, vide) qu'une grille régulière absorbe plus
  naturellement.
- **Densité** : moyenne, répartie plutôt qu'empilée.
- **Desktop** : très bon, la composition a besoin d'espace pour respirer.
- **Mobile** : correct — la ligne de temps est masquée en dessous de 700px (compromis
  nécessaire, mais qui retire une partie du dispositif signature sur mobile, à noter).
- **Dataviz complexe** : aptitude incertaine à grande échelle — le principe de relations
  spatiales entre données fonctionne bien à l'échelle de 4-5 domaines, sa
  généralisation à une page Explorer avec de nombreuses métriques demanderait une
  réflexion de composition spécifique, pas seulement plus de contenu dans le même
  gabarit.

## Vérification transverse effectuée

Les 5 fichiers ont été contrôlés : présence unique et conforme du bloc Sankey figé,
rendu desktop (1440px) et un contrôle mobile (390px, direction E) via capture d'écran
réelle dans Chromium. Aucune rupture de mise en page constatée sur les vues
inspectées.

## Ce que ce document ne fait pas

Aucun classement, aucune recommandation d'une direction plutôt qu'une autre — c'est
délibéré (consigne explicite de l'issue #1 : « ne fais pas de classement et ne choisis
pas à la place de Quentin »). Les points forts/limites ci-dessus visent à faciliter
l'arbitrage, pas à le préempter.
