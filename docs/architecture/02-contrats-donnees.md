# KDM360 — Contrats de données

*Ref #1.*

## Mise à jour — sources réelles branchées

Les avertissements ci-dessous décrivaient un état où le schéma réel n'était pas
accessible. Ce n'est plus le cas : les connecteurs disponibles dans une session
ultérieure ont permis d'identifier et de brancher les sources réelles. Voir
`src/data/*/real.ts` pour l'implémentation, et le tableau ci-dessous pour la
correspondance avec les types `XxxSource` (conservés comme documentation du besoin,
pas comme schéma exact — les adaptateurs réels requêtent directement les colonnes
réelles, qui diffèrent par endroits de ce qui était inféré) :

| Domaine | Source réelle | Mécanisme |
|---|---|---|
| Budget | Supabase, projet `kdm360` (`ftgmjaozveprnshkdosj`), tables `finance_*` | Client `@supabase/supabase-js`, clé publiable + RLS (même modèle qu'OS360). Chaque politique RLS exige `auth.uid() = current_app_owner()` : la clé seule ne donne accès à rien, il faut une session authentifiée (email/mot de passe du compte propriétaire, saisis dans Réglages → jamais commités, session persistée par le SDK) |
| Santé | Google Sheets `santé_qm`, export CSV « Publié sur le web » (gid=0) | `fetch()` direct, CSV public par construction — mêmes URL qu'OS360 |
| Sport | Même document, onglet « Activités Strava » (gid=1900000002) | `fetch()` direct, CSV public — séances synchronisées depuis Strava |
| Social | Pont Apps Script (`fichier.gs`, même contrat JSON) | URL **non codée en dur** — vient des réglages utilisateur (`src/app/settings.ts`, page Réglages), jamais commitée : accès en écriture non authentifié côté OS360 (finding D1 de l'audit), et données réelles (contacts, adresses) |

Le besoin de sommeil (`sleepNeedMin`) n'existe dans aucune source réelle trouvée —
valeur fixe de repère (8h) utilisée en attendant, signalée comme estimation dans l'UI
plutôt que présentée comme une mesure.

La « charge de séance » Sport (utilisée par le moteur de score, détecteurs A/D/E/F)
n'a pas d'équivalent direct dans les données Strava réelles (pas de TRIMP/TSS calculé)
— approximée par la durée en minutes, documenté dans `src/domains/sport/index.ts`.

## Principe général

Chaque domaine expose une interface `XxxSource` (lecture) implémentée par un adaptateur
mock (`data/xxx/mock.ts`, actif par défaut) et, plus tard, un adaptateur réel
(`data/xxx/supabase.ts`, `data/xxx/sheets.ts`). Les pages et le moteur de score ne
connaissent que l'interface, jamais l'implémentation.

## Budget (`data/finance`)

```ts
interface Account {
  id: string;
  name: string;
  type: 'courant' | 'epargne' | 'investissement' | 'especes';
  bankId: string;
  color?: string;       // hex, repli si absent — cf. 02-sankey-reference.md
  balance: number;
}

interface Bank { id: string; name: string; color?: string; }

interface Category {
  id: string;
  name: string;
  parentId?: string;    // sous-catégorie si renseigné
  color?: string;
  excludedFromSpending: boolean; // "budgets exclus des dépenses" — avis produit §2
}

interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;             // signé : + revenu, - dépense
  type: 'depense' | 'revenu' | 'remboursement' | 'transfert_interne' | 'ajustement';
  effectiveDate: string;      // ISO date — date de valeur, distincte de bankDate
  bankDate: string;           // ISO date — date bancaire réelle
  label: string;
  isFuture: boolean;          // transactions futures autorisées (avis produit §2)
}

interface BudgetAllocation {
  categoryId: string;
  monthlyAmount: number;
  month: string;               // 'YYYY-MM'
}

interface WealthSnapshot {
  date: string;
  total: number;
  byType: Record<Account['type'], number>;
}

interface FinanceSource {
  getAccounts(): Promise<Account[]>;
  getBanks(): Promise<Bank[]>;
  getCategories(): Promise<Category[]>;
  getTransactions(range: { from: string; to: string }): Promise<Transaction[]>;
  getBudgetAllocations(month: string): Promise<BudgetAllocation[]>;
  getWealthHistory(range: { from: string; to: string }): Promise<WealthSnapshot[]>;
}
```

Règles métier qui consomment ces types (implémentées dans `domains/budget/`, PAS dans
les composants) :
- Solde du mois = somme des `Transaction.amount` du mois, `type` ≠ `transfert_interne`,
  `effectiveDate` dans le mois (pas `bankDate`).
- Catégorie exclue (`excludedFromSpending`) jamais comptée dans le rythme de
  consommation (détecteurs A/B, `06-regles-score-budget.md`).
- Épargne automatique : catégorie ou règle dédiée, hors calcul des dépenses (à
  confirmer contre le schéma réel — hypothèse de la Phase 0).

## Santé (`data/health`)

```ts
interface DailyHealthMetrics {
  date: string;
  recovery?: number;       // % Whoop
  hrvMs?: number;
  restingHr?: number;      // bpm
  strain?: number;         // /21
  spo2?: number;           // %
  temperatureDeltaC?: number;
  sleep?: {
    durationMin: number;
    needMin: number;
    performancePct: number;
    efficiencyPct: number;
    remPct: number;
    swsPct: number;
  };
}

interface BodyMeasurement {
  date: string;
  weightKg?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
}

interface NutritionEntry {
  date: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  kcalGoal?: number;
  proteinGoal?: number;
  kcalExpended?: number;   // pour le facteur calorique — 07-regles-score-sante.md détecteur G
}

interface HealthSource {
  getDailyMetrics(range: { from: string; to: string }): Promise<DailyHealthMetrics[]>;
  getBodyMeasurements(range: { from: string; to: string }): Promise<BodyMeasurement[]>;
  getNutrition(range: { from: string; to: string }): Promise<NutritionEntry[]>;
}
```

Réglages utilisateur associés (pas dans les sources maîtres, cf.
`07-regles-score-sante.md`) : `poidsPlafondKg`, `masseGraissePlafondPct` — stockés côté
KDM360, à définir où exactement en implémentation (préférences locales ou table
dédiée KDM360, jamais dans les Sheets Santé).

## Sport (`data/sport`)

```ts
interface Session {
  id: string;
  date: string;
  discipline: 'crossfit' | 'course' | 'velo' | 'velo_electrique' | 'trail' | 'autre';
  durationMin: number;
  load: number;             // charge de séance
  avgHr?: number;
  maxHr?: number;
  isCompetition?: boolean;
  name?: string;            // ex. "Open 26.3"
}

interface SportSource {
  getSessions(range: { from: string; to: string }): Promise<Session[]>;
}
```

Règle transverse : toute agrégation (charge, volume, objectif mensuel) **exclut**
`discipline === 'velo_electrique'` — cf. métrique figée Sport (`04-metriques-figees.md`)
et tous les détecteurs (`08-regles-score-sport.md`).

## Social (`data/social`)

```ts
interface Contact {
  id: string;
  name: string;
  circle: 'proche' | 'regulier' | 'occasionnel' | 'dormant';
  importance: 'haute' | 'normale' | 'basse';
  contactThresholdDays: number;   // seuil du cercle, éventuellement surchargé par contact
  lastContactDate: string;
  lastContactType: 'appel' | 'message' | 'repas' | 'visite' | 'autre';
  awaitingReply: boolean;
  awaitingReplySinceDate?: string;
  location?: { lat: number; lng: number }; // pour la vue géographique
}

interface Interaction {
  id: string;
  contactId: string;
  date: string;
  type: Contact['lastContactType'];
  note?: string;
}

interface SocialSource {
  getContacts(): Promise<Contact[]>;
  getInteractions(contactId: string, range: { from: string; to: string }): Promise<Interaction[]>;
}
```

## Composite Aujourd'hui

Ne définit aucun type propre — Aujourd'hui consomme les 4 sources ci-dessus plus la
sortie du moteur de score (`core/scoring`). Voir `docs/architecture/03-roadmap.md` pour
l'ordre d'implémentation.
