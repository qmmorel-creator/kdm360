// Moteur de règles de score/seuil — voir docs/phase-0/05-08-regles-score-*.md
// et docs/phase-0/04-metriques-figees.md pour le principe général :
// "figé" = trajectoire suivie en continu, "scoré" = signal qui ne remonte que
// quand il mérite l'attention. Ce module ne couvre que le scoré.

export type Domain = 'budget' | 'sante' | 'sport' | 'social';
export type Severity = 'attention' | 'dérive' | 'critique';

export interface Signal {
  domain: Domain;
  detectorId: string;
  severity: Severity;
  /** Score comparable au sein d'un même domaine — pas comparable entre domaines. */
  score: number;
  title: string;
  description: string;
  /** Valeur affichée à droite du signal (ex. "+17 pts", "58 ms"). */
  value: string;
  /** Sous-label affiché sous la valeur (ex. "écart vs rythme"). */
  valueSub?: string;
}

/** Sélectionne le signal le plus élevé d'une liste, en priorisant toujours
 * "critique" avant "dérive"/"attention" quel que soit le score numérique —
 * cf. règle de priorité répétée dans chaque doc 05-08 ("une alerte critique
 * prime toujours sur un signal simple"). */
export function pickTopSignal(signals: Signal[]): Signal | undefined {
  const bySeverity = (s: Severity) => (s === 'critique' ? 2 : s === 'dérive' ? 1 : 0);
  return [...signals].sort((a, b) => {
    const sev = bySeverity(b.severity) - bySeverity(a.severity);
    if (sev !== 0) return sev;
    return b.score - a.score;
  })[0];
}
