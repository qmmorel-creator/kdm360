# KDM360 — Avis produit et d'architecture (Phase 0)

*Ref #1 — document de conception, aucun code applicatif engagé.*

Ce document donne mon avis argumenté avant de figer quoi que ce soit, comme demandé
dans l'issue #1. Il s'appuie sur l'audit déjà présent dans `OS360`
(`AUDIT_OS360.md`, `RAPPORT_AUDIT_2026-09-15.md`, `CLAUDE.md`, `DESIGN.md`), que je
considère comme la source de vérité sur l'état actuel — je ne le reproduis pas, je
m'appuie dessus et j'ajoute la lecture produit qui manquait.

## 1. Sur le paradigme « Personal Analytical Cockpit »

Je suis d'accord avec ce changement de paradigme, et je pense qu'il est même sous-vendu
dans le prompt : le vrai problème d'OS360 n'est pas esthétique, il est **architectural
au sens produit**. GridStack + catalogue de widgets + placement libre est un paradigme
de *constructeur de tableau de bord*, pas de *produit analytique*. Il demande à
l'utilisateur de faire le travail que le produit devrait faire pour lui : décider ce qui
compte aujourd'hui. Après un an d'usage, la question n'est plus « quel widget je place
où » mais « qu'est-ce qui a changé depuis hier ». GridStack ne répond structurellement
pas à cette question — il n'a pas de notion de saillance, seulement de position.

Donc oui à Aujourd'hui / Budget / Santé / Sport / Social / Explorer, avec une réserve :
**Aujourd'hui doit être calculé, pas configuré.** Le risque numéro un de la refonte est
de recréer un GridStack pour la page d'accueil sous prétexte que « l'utilisateur doit
pouvoir personnaliser ». Je recommande explicitement l'inverse pour la V1 : zéro
placement libre sur Aujourd'hui, une logique de règles (seuils, écarts, dérives) qui
décide ce qui apparaît, et une personnalisation limitée à des réglages de seuils, pas de
mise en page. Si après usage réel un vrai besoin de réordonnancement émerge, on l'ajoute
— mais en partant de « rien à configurer » on évite de reproduire le problème qu'on
cherche à résoudre.

## 2. Ce que je garderais d'OS360 tel quel

- **Les Sankey.** Le prompt insiste déjà dessus, je confirme : rien dans l'audit ne
  suggère qu'ils posent un problème de fond, c'est un composant mûr. Aucune raison de le
  retoucher pour cette refonte — voir `02-sankey-reference.md`.
- **Le moteur de règles Budget** (`effective_date`/`bank_date`, transferts internes,
  transactions futures, budgets exclus, épargne, ajustements). C'est la partie la plus
  précieuse du système : des règles métier réelles, éprouvées sur des vraies données,
  pas de la donnée de démo. Un des plus gros risques de la refonte serait de les
  ré-implémenter de mémoire plutôt que de les extraire fidèlement — j'y reviens en
  section 6.
- **Le socle d'accessibilité existant** (lien d'évitement, `role="status"`, 210
  `aria-label`, `:focus-visible`, `prefers-reduced-motion`) : `RAPPORT_AUDIT` note à
  raison qu'il est meilleur que la moyenne. Repartir de zéro dessus serait un recul.
- **Le principe des sources maîtres inchangées** (Supabase Budget, Sheets Santé/Social).
  C'est la bonne décision : la valeur d'OS360 est dans un an de données et de routines
  de collecte fiables, pas dans son rendu.

## 3. Ce que je supprimerais

- **GridStack comme paradigme central**, pour les raisons ci-dessus — mais pas comme
  outil : il garde un rôle légitime et réduit dans Explorer (section 6.13 du prompt),
  où l'utilisateur compose réellement une analyse.
- **Le mono-fichier minifié comme mode de développement.** L'audit A1 est sans appel :
  zéro diff relisible, zéro revue possible, risque de régression structurel. Ce n'est
  pas un point d'esthétique, c'est ce qui rend toute la suite du projet plus lente et
  plus risquée que nécessaire. KDM360 doit avoir des sources versionnées lisibles dès le
  premier commit de code (section 19 du prompt) — ce n'est pas négociable si on veut que
  Claude Code (ou n'importe qui) puisse relire un diff en phase de développement.
- **`confirm()`/`alert()` natifs** (F1) : à remplacer par un composant de confirmation
  cohérent avec l'identité visuelle retenue, dès le début plutôt qu'en rattrapage.
  Autant l'intégrer à l'architecture des composants dès la conception plutôt que d'en
  faire un chantier séparé après coup.
- **Les ponts Apps Script non authentifiés (D1-D3).** Ce n'est pas un sujet KDM360 au
  sens strict — les sources restent les sources — mais si KDM360 consomme les mêmes
  ponts, il ne doit pas reconduire les URL en dur dans un fichier public sans jeton.
  Le dépôt KDM360 est **public** (contrainte section 5) : la marge d'erreur sur ce point
  est encore plus faible que sur OS360, qui n'était que déployé publiquement avec un
  dépôt privé. Toute intégration de source doit passer par une configuration côté
  utilisateur (variables d'environnement / réglages), jamais par une constante commitée.

## 4. Problèmes UX que j'anticipe

- **La confusion Santé/Sport.** Le prompt les sépare bien conceptuellement (« comment va
  mon corps » vs « qu'est-ce que je fais »), mais Whoop mesure du strain qui est à la
  fois un signal de récupération et une conséquence de l'activité. Si les deux pages
  recalculent chacune leur propre lecture de la charge à partir de sources qui se
  recoupent, elles vont diverger dans le temps et miner la confiance dans les chiffres.
  Recommandation : un seul calcul de charge/récupération, exposé en lecture par les deux
  pages avec un cadrage différent (Santé : « qu'est-ce que ça dit de mon état » ; Sport :
  « qu'est-ce qui l'a produit »), jamais deux calculs parallèles.
- **La densité comme prétexte à l'accumulation.** « Cockpit dense » (direction B) est
  listé comme une qualité, mais un cockpit dense mal hiérarchisé redevient un mur de
  widgets avec un habillage différent. La densité doit être un résultat de la
  hiérarchisation (peu d'éléments, mais chacun porteur), pas un objectif en soi. Je le
  signale parce que c'est exactement le piège dans lequel OS360 est tombé : GridStack
  a *permis* la densité sans la forcer à être organisée.
- **Explorer qui redevient le produit par défaut.** Le prompt le dit explicitement
  (« Explorer ne doit pas redevenir le cœur du produit »), et c'est le bon réflexe, mais
  le risque concret est différent : c'est la page la plus facile à construire (elle
  réutilise le plus de code existant) et la plus tentante à enrichir en premier, parce
  qu'elle ne demande pas de trancher les questions de hiérarchisation qu'Aujourd'hui
  impose. Recommandation de séquencement en section 8.
- **Fiche contact vs esthétique « réseau social ».** Le prompt met en garde à raison.
  Le risque concret : une heatmap d'interactions et une visualisation de réseau
  relationnel ressemblent vite à des métriques de vanité (followers, engagement) si le
  vocabulaire visuel n'est pas explicitement analytique (axes, échelles, pas de
  compteurs ronds ni de badges).

## 5. Risques techniques

- **Sankey figé + réécriture complète du reste** est une contrainte inhabituelle :
  la plupart des refontes visuelles touchent tout uniformément. Ici il faut un
  composant dont le rendu reste identique pendant que tout son environnement change de
  langage visuel. *Mise à jour après l'identification précise du composant
  (`02-sankey-reference.md`) : le Sankey n'utilise pas ECharts — c'est un moteur SVG
  entièrement fait main (bézier, tri par barycentre, échelle commune aux colonnes).*
  Techniquement ça veut dire : réimplémenter ce moteur à l'identique (mêmes constantes
  de courbure, mêmes couleurs et replis en dur, mêmes opacités), et ne surtout pas le
  faire hériter des tokens de design du nouveau système — il doit rester un îlot visuel
  non themé.
- **Extraire les règles métier Budget sans les réinventer.** Le code source
  correspondant n'existe que dans le bundle minifié. La bonne méthode n'est pas de
  deviner les règles depuis leur résultat visible mais de localiser et lire le code
  applicatif réel dans `index.html` (identifiants `os*` non minifiés, cf. méthode
  documentée dans `AUDIT_OS360.md`) et de le transcrire fidèlement en TypeScript lisible,
  avec des tests qui rejouent des cas réels avant tout branchement de source. C'est un
  travail de traduction fidèle, pas de réécriture depuis les specs.
- **Double calcul de charge Santé/Sport** — déjà évoqué en section 4, mais c'est aussi un
  risque technique : sans un module de calcul partagé (`core`/`domains` séparés comme
  proposé section 19 du prompt), chaque page réimplémentera sa propre lecture des mêmes
  données Whoop/Withings et elles divergeront silencieusement.
- **RLS et clé publique Supabase sur un dépôt public.** D4 documente que la clé
  `publishable` actuelle est protégée par la RLS d'OS360. KDM360 étant public dès le
  code source (pas seulement dès le déploiement), il faut vérifier que la même RLS
  s'applique aussi au *code*, pas seulement au bundle final — un `.env.example` propre
  et une revue explicite de ce qui peut/doit être une valeur par défaut publique avant le
  premier commit qui touche Supabase.

## 6. Comment structurer les vues (proposition)

Je garde la structure Aujourd'hui / Budget / Santé / Sport / Social / Explorer du
prompt — elle est juste. Ce que j'ajoute :

1. **Aujourd'hui = calculé par des règles de seuil, jamais par un widget déplaçable.**
   (section 1)
2. **Chaque page domaine a une seule vue principale ("lecture"), pas un mur de cartes.**
   Le drill-down (section 21 du prompt) est le mécanisme qui absorbe la richesse
   d'OS360 sans la mettre toute au même niveau visuel : un clic ouvre le contexte, la
   page principale ne montre que ce qui aide à décider si on doit cliquer.
3. **Explorer est un outil, pas une destination de navigation quotidienne.** Je le
   garderais accessible depuis chaque page domaine (« voir plus en détail » avec le
   contexte déjà filtré) plutôt que comme un onglet indépendant qu'on ouvre à vide — ça
   réduit le risque de la section 4 (Explorer qui redevient le cœur).
4. **Un module de calcul partagé Santé/Sport** (section 5) exposé aux deux pages.

## 7. Interactions les plus pertinentes

- **Clic = drill-down, jamais réglage.** Cohérent avec la section 21 : la destination
  d'un clic sur une donnée est plus de contexte sur cette donnée, pas un panneau de
  configuration du widget qui l'affiche.
- **Survol = détail immédiat sans navigation.** Sur les visualisations denses
  (multiples Santé, treemap Budget), le survol doit donner la valeur exacte sans quitter
  la vue — c'est ce qui permet la densité sans le bruit.
- **Filtre de période persistant et transverse**, pas ré-choisi page par page. Un
  changement de période sur Aujourd'hui devrait rester cohérent en arrivant sur Budget.
- **États de données explicites** (section 22 du prompt) rendus comme une interaction à
  part entière : un badge "dernière synchro" cliquable qui explique l'état, plutôt qu'un
  simple indicateur passif.

## 8. Séquencement que je recommande pour la suite (après validation esthétique)

Pas pour cette phase, mais pour éviter de refaire l'erreur d'OS360 (Explorer devient le
produit par défaut) une fois le développement lancé :

1. Sankey figé + moteur de règles Budget extraits et testés en premier (le risque le
   plus élevé, à sécuriser avant toute UI).
2. Aujourd'hui avec données réelles branchées, même avec un rendu minimal — c'est la
   page qui valide que la hiérarchisation automatique fonctionne en pratique.
3. Budget puis Santé/Sport/Social, dans cet ordre parce que Budget a la donnée la plus
   structurée et la plus proche d'être exploitable telle quelle.
4. Explorer en dernier — délibérément, pour qu'il ne capte pas le temps de
   développement qui doit aller à la hiérarchisation.

## 9. Conclusion

Le paradigme proposé est le bon diagnostic sur ce qui a vieilli dans OS360 : pas son
esthétique, sa grammaire d'interaction (tout est un widget qu'on place). Mon désaccord
avec le prompt est mineur et porte sur l'exécution : ne pas laisser « Aujourd'hui »
redevenir configurable, ne pas laisser la densité justifier l'accumulation, et traiter
le moteur de règles Budget et le Sankey comme des extractions fidèles plutôt que des
réécritures. Le reste — cinq directions visuelles, Sankey figé, sources inchangées — est
directement applicable tel quel.
