/**
 * Sankey — RENDU FIGÉ. Voir docs/phase-0/02-sankey-reference.md : ce composant
 * doit reproduire à l'identique le moteur SVG maison d'OS360 (pas ECharts).
 *
 * Fidélité de cette implémentation :
 *  - reproduites : zéro espacement entre nœuds/liens empilés, échelle verticale
 *    commune à toutes les colonnes, dégradé horizontal par ruban (couleur
 *    source → couleur cible), courbe bézier à point de contrôle médian fixe,
 *    mix-blend-mode:multiply, les 4 états d'opacité (0,52/0,9/0,1/0,14), halo
 *    blanc du texte, en-têtes de colonne + totaux, ligne "Solde du mois" sur
 *    la dernière colonne.
 *  - SIMPLIFIÉ : l'ordonnancement anti-croisement par barycentre (`Jf`/`Yf`
 *    dans le document de référence) n'est PAS réimplémenté ici — les nœuds
 *    gardent l'ordre fourni en entrée. L'anti-collision des labels n'est pas
 *    non plus réimplémentée — avec des nœuds petits et rapprochés, les
 *    libellés peuvent se chevaucher (visible sur le Sankey mensuel mock,
 *    colonne DESTINATION). À comparer visuellement à la production OS360
 *    avant de considérer ce composant comme conforme (voir
 *    docs/architecture/03-roadmap.md, V1, point 6).
 */
import { useState } from 'react';

export interface SankeyNode {
  id: string;
  name: string;
  value: number;
  color: string;
  column: 0 | 1 | 2;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyProps {
  columns: [string, string, string];
  nodes: SankeyNode[];
  links: SankeyLink[];
  title: string;
  flowOpacity?: number;
}

const NODE_WIDTH = 14;

export function Sankey({ columns, nodes, links, title, flowOpacity = 0.52 }: SankeyProps) {
  const [active, setActive] = useState<string | null>(null);

  const width = 640;
  const height = 360;
  const marginL = 130;
  const marginR = 150;
  const marginTop = 44;
  const marginBottom = 20;
  const usableH = height - marginTop - marginBottom;

  const byColumn: SankeyNode[][] = [[], [], []];
  for (const n of nodes) byColumn[n.column].push(n);

  const columnTotal = (col: number) => byColumn[col].reduce((s, n) => s + n.value, 0);
  const grandTotal = Math.max(columnTotal(0), columnTotal(1), columnTotal(2)) || 1;
  const scale = usableH / grandTotal; // échelle commune aux 3 colonnes

  const colX = (col: number) => marginL + (col * (width - marginL - marginR)) / 2;

  type Placed = SankeyNode & { x0: number; x1: number; y0: number; y1: number };
  const placed = new Map<string, Placed>();
  byColumn.forEach((list, col) => {
    let y = marginTop;
    for (const n of list) {
      const h = n.value * scale;
      placed.set(n.id, { ...n, x0: colX(col), x1: colX(col) + NODE_WIDTH, y0: y, y1: y + h });
      y += h; // zéro espacement — empilement jointif
    }
  });

  // Sous-ordre des liens à l'intérieur de chaque nœud (empilement jointif).
  const outOffset = new Map<string, number>();
  const inOffset = new Map<string, number>();
  const sortedLinks = [...links].sort((a, b) => a.target.localeCompare(b.target));

  const relatedTo = (id: string) => new Set(links.filter((l) => l.source === id || l.target === id).flatMap((l) => [l.source, l.target]));

  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`${title} · ${columns.join(' → ')}`}>
        <desc>Échelle monétaire commune aux colonnes. Les hauteurs des piliers et des rubans sont proportionnelles aux montants réels.</desc>
        <defs>
          {sortedLinks.map((l, i) => {
            const s = placed.get(l.source);
            const t = placed.get(l.target);
            if (!s || !t) return null;
            return (
              <linearGradient key={i} id={`sk-grad-${i}`} gradientUnits="userSpaceOnUse" x1={s.x1} x2={t.x0}>
                <stop offset="0%" stopColor={s.color} />
                <stop offset="100%" stopColor={t.color} />
              </linearGradient>
            );
          })}
        </defs>

        {/* rubans */}
        <g>
          {sortedLinks.map((l, i) => {
            const s = placed.get(l.source);
            const t = placed.get(l.target);
            if (!s || !t) return null;
            const h = l.value * scale;
            const sOff = outOffset.get(l.source) ?? 0;
            const tOff = inOffset.get(l.target) ?? 0;
            outOffset.set(l.source, sOff + h);
            inOffset.set(l.target, tOff + h);
            const sy0 = s.y0 + sOff;
            const sy1 = sy0 + h;
            const ty0 = t.y0 + tOff;
            const ty1 = ty0 + h;
            const mid = (s.x1 + t.x0) / 2;
            const path = `M${s.x1},${sy0} C${mid},${sy0} ${mid},${ty0} ${t.x0},${ty0} L${t.x0},${ty1} C${mid},${ty1} ${mid},${sy1} ${s.x1},${sy1} Z`;

            let opacity = flowOpacity;
            if (active) {
              const linked = active === l.source || active === l.target;
              opacity = linked ? 0.9 : 0.1;
            }
            return (
              <path
                key={i}
                d={path}
                fill={`url(#sk-grad-${i})`}
                style={{ mixBlendMode: 'multiply', cursor: 'pointer' }}
                opacity={opacity}
                tabIndex={0}
                role="button"
                aria-label={`${s.name} → ${t.name} · ${l.value}€`}
                onMouseEnter={() => setActive(l.source)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(l.source)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === l.source ? null : l.source)}
              >
                <title>{`${s.name} → ${t.name} · ${l.value}€`}</title>
              </path>
            );
          })}
        </g>

        {/* nœuds */}
        <g>
          {[...placed.values()].map((n) => {
            const dimmed = active ? !relatedTo(active).has(n.id) && active !== n.id : false;
            const isLast = n.column === 2;
            return (
              <g
                key={n.id}
                opacity={dimmed ? 0.14 : 1}
                tabIndex={0}
                role="button"
                aria-label={`${n.name} · ${n.value}€`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === n.id ? null : n.id)}
              >
                <rect x={n.x0} y={n.y0} width={n.x1 - n.x0} height={Math.max(0, n.y1 - n.y0)} rx={2} fill={n.color} stroke="#fff" strokeWidth={0.7} />
                <title>{`${n.name} · ${n.value}€`}</title>
                <text
                  x={isLast ? n.x1 + 10 : n.x0 - 10}
                  y={(n.y0 + n.y1) / 2}
                  textAnchor={isLast ? 'start' : 'end'}
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="#14232d"
                  fontFamily="Segoe UI, Arial, sans-serif"
                  paintOrder="stroke fill"
                  stroke="rgba(255,255,255,.96)"
                  strokeWidth={4}
                >
                  {n.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* en-têtes de colonne + totaux */}
        {columns.map((label, col) => {
          const total = columnTotal(col);
          const x = colX(col) + NODE_WIDTH / 2;
          return (
            <g key={col} textAnchor="middle" fontFamily="Inter, sans-serif">
              <text x={x} y={16} fontSize={9} fontWeight={700} letterSpacing="0.08em" fill="var(--gray)">
                {label}
              </text>
              <text x={x} y={32} fontSize={15} fontWeight={700} fill="var(--ink)">
                {total.toLocaleString('fr-FR')} €
              </text>
            </g>
          );
        })}
        <text x={colX(2) + NODE_WIDTH / 2} y={44} fontSize={10} fontWeight={700} textAnchor="middle" fontFamily="Inter, sans-serif"
          fill={columnTotal(2) - columnTotal(0) >= 0 ? 'var(--teal-dark)' : 'var(--coral)'}>
          Solde : {(columnTotal(2) - columnTotal(0)).toLocaleString('fr-FR')} €
        </text>
      </svg>
    </div>
  );
}
