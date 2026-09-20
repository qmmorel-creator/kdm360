// Adaptateur Sport réel — CSV "Publié sur le web" de l'onglet "Activités Strava"
// de la feuille santé_qm (même document que Santé, gid différent — voir
// index.html d'OS360, offset ~294988 : columns/mainUrl/sportUrl). Séances
// synchronisées depuis Strava, avec discipline, durée, distance, dénivelé, FC.
import { parseCsv, parseFrenchNumber, csvRowsToObjects, findKey } from '@/data/shared/csv';

const SPORT_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlpxcNI4NX_I23GY3PdPuzU88eymHz05uzalM1fksPQF2002bK8F5_lQBfkY7gTBFhr08wjRkuWsy3/pub?output=csv&gid=1900000002';

export interface SportSessionRow {
  date: string; // ISO
  discipline: string;
  title: string;
  durationMin?: number;
  movingDurationMin?: number;
  distanceKm?: number;
  elevationM?: number;
  avgHr?: number;
  maxHr?: number;
  startIso?: string;
}

function toIsoDate(fr: string): string {
  const m = fr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return fr;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/** Discipline "vélo électrique" à exclure des calculs de charge — cohérent avec
 * la métrique figée Sport (docs/phase-0/04-metriques-figees.md). Strava taggue
 * ces sorties "E-Bike Ride" dans le titre, la discipline générique restant "Vélo". */
export function isElectricBike(row: SportSessionRow): boolean {
  return /e-bike|électrique|electrique/i.test(row.title) || /e-bike|électrique|electrique/i.test(row.discipline);
}

export async function fetchSportSessions(days = 365): Promise<SportSessionRow[]> {
  const res = await fetch(SPORT_CSV_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Sport (CSV) : ${res.status} ${res.statusText}`);
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  const objects = csvRowsToObjects(rows);

  const key = {
    date: findKey(headers, 'date') ?? headers[0],
    discipline: findKey(headers, 'sport'),
    title: findKey(headers, 'titre'),
    duration: findKey(headers, 'durée totale') ?? findKey(headers, 'duree totale'),
    movingDuration: findKey(headers, 'durée', 'mouvement') ?? findKey(headers, 'duree', 'mouvement'),
    distance: findKey(headers, 'distance'),
    elevation: findKey(headers, 'dénivelé') ?? findKey(headers, 'denivele'),
    avgHr: findKey(headers, 'fc moyenne'),
    maxHr: findKey(headers, 'fc max'),
    startIso: findKey(headers, 'début iso') ?? findKey(headers, 'debut iso'),
  };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const out: SportSessionRow[] = objects
    .map((o) => ({
      date: toIsoDate(o[key.date] ?? ''),
      discipline: key.discipline ? o[key.discipline] : '',
      title: key.title ? o[key.title] : '',
      durationMin: parseFrenchNumber(key.duration ? o[key.duration] : undefined),
      movingDurationMin: parseFrenchNumber(key.movingDuration ? o[key.movingDuration] : undefined),
      distanceKm: parseFrenchNumber(key.distance ? o[key.distance] : undefined),
      elevationM: parseFrenchNumber(key.elevation ? o[key.elevation] : undefined),
      avgHr: parseFrenchNumber(key.avgHr ? o[key.avgHr] : undefined),
      maxHr: parseFrenchNumber(key.maxHr ? o[key.maxHr] : undefined),
      startIso: key.startIso ? o[key.startIso] : undefined,
    }))
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.date >= cutoffIso)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return out;
}
