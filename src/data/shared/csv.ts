// Parseur CSV minimal (champs entre guillemets, virgule comme séparateur —
// format d'export "Publier sur le web" de Google Sheets) + nombres au format
// français (virgule décimale, % en suffixe).
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((v) => v !== '')) rows.push(row);
  }
  return rows;
}

/** Nombre au format français ("83,488" -> 83.488, "13,631%" -> 13.631). */
export function parseFrenchNumber(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const cleaned = raw.trim().replace(/%$/, '').replace(/\s/g, '').replace(',', '.').replace(/\.$/, '');
  if (cleaned === '') return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

export function csvRowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h.trim()] = row[i] ?? ''));
    return obj;
  });
}

/** Trouve la clé d'un objet dont l'en-tête contient (insensible à la casse) l'un
 * des mots-clés donnés — pour ne pas dépendre d'un intitulé de colonne exact. */
export function findKey(headers: string[], ...keywords: string[]): string | undefined {
  const lower = keywords.map((k) => k.toLowerCase());
  return headers.find((h) => {
    const hl = h.toLowerCase();
    return lower.every((k) => hl.includes(k));
  });
}
