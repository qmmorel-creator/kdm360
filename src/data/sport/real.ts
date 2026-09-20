// Adaptateur Sport réel — CSV "Publié sur le web" de l'onglet "Activités Strava"
// de la feuille santé_qm (même document que Santé, gid différent — voir
// index.html d'OS360, offset ~294988 : columns/mainUrl/sportUrl). Séances
// synchronisées depuis Strava, avec discipline, durée, distance, dénivelé, FC.
import { parseCsv, parseFrenchNumber } from '@/data/shared/csv';

const SPORT_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlpxcNI4NX_I23GY3PdPuzU88eymHz05uzalM1fksPQF2002bK8F5_lQBfkY7gTBFhr08wjRkuWsy3/pub?output=csv&gid=1900000002';

// Ordre exact des colonnes de l'onglet "Activités Strava" — repris tel quel du code
// source d'OS360 (index.html minifié, en-tête `xe[0]` : "Date","Sport","Titre",
// "Durée totale (min)","Durée en mouvement (min)","Distance (km)","Dénivelé positif (m)",
// "FC moyenne (bpm)","FC maximale (bpm)","Début ISO","Fin ISO","ID événement",
// "Calendrier ID","Lien événement"). Lecture positionnelle comme OS360, plus robuste
// qu'un matching d'intitulé de colonne.
const COLUMN_ORDER = [
  'date',
  'discipline',
  'title',
  'duration',
  'movingDuration',
  'distance',
  'elevation',
  'avgHr',
  'maxHr',
  'startIso',
  'endIso',
] as const;

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
  // Ligne 0 = en-têtes, ignorée : lecture positionnelle par COLUMN_ORDER (cf. OS360).
  const dataRows = rows.slice(1);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const out: SportSessionRow[] = dataRows
    .map((row) => {
      const cell = (name: (typeof COLUMN_ORDER)[number]) => row[COLUMN_ORDER.indexOf(name)];
      return {
        date: toIsoDate(cell('date') ?? ''),
        discipline: cell('discipline') ?? '',
        title: cell('title') ?? '',
        durationMin: parseFrenchNumber(cell('duration')),
        movingDurationMin: parseFrenchNumber(cell('movingDuration')),
        distanceKm: parseFrenchNumber(cell('distance')),
        elevationM: parseFrenchNumber(cell('elevation')),
        avgHr: parseFrenchNumber(cell('avgHr')),
        maxHr: parseFrenchNumber(cell('maxHr')),
        startIso: cell('startIso'),
      };
    })
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.date >= cutoffIso)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return out;
}
