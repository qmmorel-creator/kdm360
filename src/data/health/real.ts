// Adaptateur Santé réel — CSV "Publié sur le web" de la feuille santé_qm.
// Mêmes URL qu'OS360 (index.html d'OS360, offset ~294988 du bundle) : un export
// CSV public par construction (fonctionnalité "Publier sur le web" de Sheets),
// donc sans risque à committer, contrairement aux ponts Apps Script à jeton.
import { parseCsv, parseFrenchNumber, csvRowsToObjects, findKey } from '@/data/shared/csv';

const MAIN_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlpxcNI4NX_I23GY3PdPuzU88eymHz05uzalM1fksPQF2002bK8F5_lQBfkY7gTBFhr08wjRkuWsy3/pub?output=csv&gid=0';

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
  const headers = rows[0].map((h) => h.trim());
  const objects = csvRowsToObjects(rows);

  const key = {
    date: findKey(headers, 'date') ?? headers[0],
    weight: findKey(headers, 'poids'),
    bodyFat: findKey(headers, 'masse grasse'),
    muscleMass: findKey(headers, 'masse musculaire', 'kg') ?? findKey(headers, 'masse musculaire'),
    recovery: findKey(headers, 'récupération') ?? findKey(headers, 'recuperation'),
    sleepHours: findKey(headers, 'sommeil réel') ?? findKey(headers, 'sommeil reel'),
    strain: findKey(headers, 'strain'),
    kcalExpended: findKey(headers, 'calories', 'dépensées') ?? findKey(headers, 'calories', 'depensees'),
    hrv: findKey(headers, 'hrv'),
    restingHr: findKey(headers, 'fc repos'),
    respRate: findKey(headers, 'respiratoire'),
    spo2: findKey(headers, 'spo'),
    skinTemp: findKey(headers, 'température') ?? findKey(headers, 'temperature'),
    sleepPerf: findKey(headers, 'performance sommeil'),
    sleepEff: findKey(headers, 'efficacité sommeil') ?? findKey(headers, 'efficacite sommeil'),
    deepSleep: findKey(headers, 'sommeil profond'),
    remSleep: findKey(headers, 'sommeil rem') ?? findKey(headers, 'rem'),
    steps: findKey(headers, 'pas'),
    stress: findKey(headers, 'stress'),
    vo2max: findKey(headers, 'vo'),
    sportDuration: findKey(headers, 'durée sport') ?? findKey(headers, 'duree sport'),
    kcalConsumed: findKey(headers, 'calories consommées') ?? findKey(headers, 'calories consommees'),
    protein: findKey(headers, 'protéines') ?? findKey(headers, 'proteines'),
    carbs: findKey(headers, 'glucides'),
  };

  const out: DailyHealthRow[] = objects
    .map((o) => ({
      date: toIsoDate(o[key.date] ?? ''),
      weightKg: parseFrenchNumber(key.weight ? o[key.weight] : undefined),
      bodyFatPct: parseFrenchNumber(key.bodyFat ? o[key.bodyFat] : undefined),
      muscleMassKg: parseFrenchNumber(key.muscleMass ? o[key.muscleMass] : undefined),
      recoveryPct: parseFrenchNumber(key.recovery ? o[key.recovery] : undefined),
      sleepHours: parseFrenchNumber(key.sleepHours ? o[key.sleepHours] : undefined),
      strain: parseFrenchNumber(key.strain ? o[key.strain] : undefined),
      kcalExpended: parseFrenchNumber(key.kcalExpended ? o[key.kcalExpended] : undefined),
      hrvMs: parseFrenchNumber(key.hrv ? o[key.hrv] : undefined),
      restingHr: parseFrenchNumber(key.restingHr ? o[key.restingHr] : undefined),
      respRate: parseFrenchNumber(key.respRate ? o[key.respRate] : undefined),
      spo2Pct: parseFrenchNumber(key.spo2 ? o[key.spo2] : undefined),
      skinTempC: parseFrenchNumber(key.skinTemp ? o[key.skinTemp] : undefined),
      sleepPerfPct: parseFrenchNumber(key.sleepPerf ? o[key.sleepPerf] : undefined),
      sleepEffPct: parseFrenchNumber(key.sleepEff ? o[key.sleepEff] : undefined),
      deepSleepHours: parseFrenchNumber(key.deepSleep ? o[key.deepSleep] : undefined),
      remSleepHours: parseFrenchNumber(key.remSleep ? o[key.remSleep] : undefined),
      steps: parseFrenchNumber(key.steps ? o[key.steps] : undefined),
      stress: parseFrenchNumber(key.stress ? o[key.stress] : undefined),
      vo2max: parseFrenchNumber(key.vo2max ? o[key.vo2max] : undefined),
      sportDurationHours: parseFrenchNumber(key.sportDuration ? o[key.sportDuration] : undefined),
      kcalConsumed: parseFrenchNumber(key.kcalConsumed ? o[key.kcalConsumed] : undefined),
      proteinG: parseFrenchNumber(key.protein ? o[key.protein] : undefined),
      carbsG: parseFrenchNumber(key.carbs ? o[key.carbs] : undefined),
    }))
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date))
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // plus récent d'abord

  return out.slice(0, days);
}
