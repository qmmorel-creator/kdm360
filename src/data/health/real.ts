// Adaptateur Santé réel — CSV "Publié sur le web" de la feuille santé_qm.
// Mêmes URL qu'OS360 (index.html d'OS360, offset ~294988 du bundle) : un export
// CSV public par construction (fonctionnalité "Publier sur le web" de Sheets),
// donc sans risque à committer, contrairement aux ponts Apps Script à jeton.
import { parseCsv, parseFrenchNumber } from '@/data/shared/csv';

const MAIN_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlpxcNI4NX_I23GY3PdPuzU88eymHz05uzalM1fksPQF2002bK8F5_lQBfkY7gTBFhr08wjRkuWsy3/pub?output=csv&gid=0';

// Ordre exact des colonnes de l'onglet — repris tel quel du code source d'OS360
// (index.html minifié, variable `we` : `date.weight.bodyFat.muscleMass.muscleRate.
// recovery.sleepHours.strain.calories.hrv.restingHr.respRate.spo2.skinTemp.sleepPerf.
// sleepEff.deepSleep.remSleep.steps.stress.hrZone45.vo2max.sportDuration.caloriesIn.
// proteins.carbs`). OS360 ignore le texte des en-têtes et lit par position — on fait
// pareil plutôt que de matcher un intitulé de colonne, plus fragile (accents, unités,
// branding "Whoop" qui peut changer sans que l'ordre des colonnes ne bouge).
const COLUMN_ORDER = [
  'date',
  'weight',
  'bodyFat',
  'muscleMass',
  'muscleRate',
  'recovery',
  'sleepHours',
  'strain',
  'calories',
  'hrv',
  'restingHr',
  'respRate',
  'spo2',
  'skinTemp',
  'sleepPerf',
  'sleepEff',
  'deepSleep',
  'remSleep',
  'steps',
  'stress',
  'hrZone45',
  'vo2max',
  'sportDuration',
  'caloriesIn',
  'proteins',
  'carbs',
] as const;

export interface DailyHealthRow {
  date: string; // ISO yyyy-mm-dd
  weightKg?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  recoveryPct?: number;
  sleepHours?: number;
  strain?: number;
  kcalExpended?: number;
  hrvMs?: number;
  restingHr?: number;
  respRate?: number;
  spo2Pct?: number;
  skinTempC?: number;
  sleepPerfPct?: number;
  sleepEffPct?: number;
  deepSleepHours?: number;
  remSleepHours?: number;
  steps?: number;
  stress?: number;
  vo2max?: number;
  sportDurationHours?: number;
  kcalConsumed?: number;
  proteinG?: number;
  carbsG?: number;
}

function toIsoDate(fr: string): string {
  // "19/09/2026" -> "2026-09-19"
  const m = fr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return fr;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export async function fetchHealthDaily(days = 90): Promise<DailyHealthRow[]> {
  const res = await fetch(MAIN_CSV_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Santé (CSV) : ${res.status} ${res.statusText}`);
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  // Ligne 0 = en-têtes, ignorée : lecture positionnelle par COLUMN_ORDER (cf. OS360).
  const dataRows = rows.slice(1);

  const out: DailyHealthRow[] = dataRows
    .map((row) => {
      const cell = (name: (typeof COLUMN_ORDER)[number]) => row[COLUMN_ORDER.indexOf(name)];
      return {
        date: toIsoDate(cell('date') ?? ''),
        weightKg: parseFrenchNumber(cell('weight')),
        bodyFatPct: parseFrenchNumber(cell('bodyFat')),
        muscleMassKg: parseFrenchNumber(cell('muscleMass')),
        recoveryPct: parseFrenchNumber(cell('recovery')),
        sleepHours: parseFrenchNumber(cell('sleepHours')),
        strain: parseFrenchNumber(cell('strain')),
        kcalExpended: parseFrenchNumber(cell('calories')),
        hrvMs: parseFrenchNumber(cell('hrv')),
        restingHr: parseFrenchNumber(cell('restingHr')),
        respRate: parseFrenchNumber(cell('respRate')),
        spo2Pct: parseFrenchNumber(cell('spo2')),
        skinTempC: parseFrenchNumber(cell('skinTemp')),
        sleepPerfPct: parseFrenchNumber(cell('sleepPerf')),
        sleepEffPct: parseFrenchNumber(cell('sleepEff')),
        deepSleepHours: parseFrenchNumber(cell('deepSleep')),
        remSleepHours: parseFrenchNumber(cell('remSleep')),
        steps: parseFrenchNumber(cell('steps')),
        stress: parseFrenchNumber(cell('stress')),
        vo2max: parseFrenchNumber(cell('vo2max')),
        sportDurationHours: parseFrenchNumber(cell('sportDuration')),
        kcalConsumed: parseFrenchNumber(cell('caloriesIn')),
        proteinG: parseFrenchNumber(cell('proteins')),
        carbsG: parseFrenchNumber(cell('carbs')),
      };
    })
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date))
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // plus récent d'abord

  return out.slice(0, days);
}
