import { Card, CardHead, CardFoot, Badge } from '@/design/components/Card';
import { getSocialOverview } from '@/domains/social';

const CIRCLE_COLOR: Record<string, string> = {
  proche: 'var(--teal-dark)',
  regulier: 'var(--teal)',
  occasionnel: 'var(--coral)',
  dormant: 'var(--gray-light)',
};

function RadarPreview() {
  // Aperçu illustratif — points positionnés par anneau (ancienneté de contact),
  // rendu adaptable (pas figé, contrairement au Sankey — 05-regles-score-social.md).
  const rings = [30, 55, 80, 105];
  const points = Array.from({ length: 28 }, (_, i) => {
    const ring = rings[i % rings.length];
    const angle = (i / 28) * Math.PI * 2;
    const jitter = (i * 37) % 12;
    const r = ring - jitter;
    return { x: 120 + r * Math.cos(angle), y: 120 + r * Math.sin(angle), circle: ['proche', 'regulier', 'occasionnel', 'dormant'][i % 4] };
  });
  return (
    <svg width="100%" height={190} viewBox="0 0 240 240" role="img" aria-label="Aperçu radar relationnel">
      {rings.map((r) => (
        <circle key={r} cx={120} cy={120} r={r} fill="none" stroke="var(--border)" />
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={CIRCLE_COLOR[p.circle]} />
      ))}
    </svg>
  );
}

function GeoPreview() {
  const dots = Array.from({ length: 10 }, (_, i) => ({ x: 20 + ((i * 53) % 200), y: 20 + ((i * 91) % 150), circle: ['proche', 'regulier', 'occasionnel', 'dormant'][i % 4] }));
  return (
    <svg width="100%" height={190} viewBox="0 0 240 190" role="img" aria-label="Aperçu vue géographique">
      {Array.from({ length: 6 }).map((_, r) => (
        <line key={'h' + r} x1={0} y1={(r * 190) / 5} x2={240} y2={(r * 190) / 5} stroke="var(--border)" />
      ))}
      {Array.from({ length: 8 }).map((_, c) => (
        <line key={'v' + c} x1={(c * 240) / 7} y1={0} x2={(c * 240) / 7} y2={190} stroke="var(--border)" />
      ))}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={4} fill={CIRCLE_COLOR[d.circle]} />
      ))}
    </svg>
  );
}

function NetworkPreview() {
  const center = { x: 120, y: 95 };
  const outer = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    return { x: center.x + 75 * Math.cos(angle), y: center.y + 75 * Math.sin(angle), circle: ['proche', 'regulier', 'occasionnel', 'dormant'][i % 4] };
  });
  return (
    <svg width="100%" height={190} viewBox="0 0 240 190" role="img" aria-label="Aperçu réseau relationnel">
      {outer.map((p, i) => (
        <line key={i} x1={center.x} y1={center.y} x2={p.x} y2={p.y} stroke="var(--border)" />
      ))}
      <circle cx={center.x} cy={center.y} r={8} fill="var(--teal-dark)" />
      {outer.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill={CIRCLE_COLOR[p.circle]} />
      ))}
    </svg>
  );
}

export function SocialPage() {
  const s = getSocialOverview();

  return (
    <>
      <div className="breadcrumb">
        Espace personnel <span aria-hidden="true">›</span> <span className="current">Social</span>
      </div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Social</h1>
          <p className="page-sub">Le réseau relationnel et les liens à entretenir avant qu'ils ne se distendent.</p>
        </div>
        <span className="page-badge">Maquette · données fictives</span>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 14 }}>
        <Card>
          <CardHead title="Réseau" sub="Répartition par cercle" badge={{ label: `${s.totalContacts} contacts` }} />
          <div className="circle-stats">
            <div className="circle-stat"><div className="n">{s.circleCounts.proche}</div><div className="l">Proche</div></div>
            <div className="circle-stat"><div className="n">{s.circleCounts.regulier}</div><div className="l">Régulier</div></div>
            <div className="circle-stat"><div className="n">{s.circleCounts.occasionnel}</div><div className="l">Occasionnel</div></div>
            <div className="circle-stat"><div className="n">{s.circleCounts.dormant}</div><div className="l">Dormant</div></div>
          </div>
        </Card>

        <Card>
          <CardHead title="Liens à entretenir" sub="Contacts au-delà de leur délai cible" badge={{ label: `${s.signals.length} contact(s)`, tone: 'coral' }} />
          <table>
            <thead><tr><th>Contact / cercle</th><th>Dernier lien</th><th>Situation</th></tr></thead>
            <tbody>
              {s.contacts.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong> · {c.circle}</td>
                  <td>Il y a {c.daysSinceLastContact} j</td>
                  <td>
                    <Badge
                      tone="coral"
                      label={c.awaitingReply ? `En attente réponse · ${c.awaitingReplySinceDays} j` : `Seuil ${c.contactThresholdDays} j dépassé`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <CardHead title="Visualisations du réseau" sub="Trois façons d'explorer vos relations" badge={{ label: '3 vues' }} />
        <div className="grid grid-3">
          <div>
            <div className="card-title-sub" style={{ fontWeight: 700, marginBottom: 6 }}>Radar relationnel <Badge label="Aperçu" tone="teal" /></div>
            <div className="preview-box"><RadarPreview /></div>
            <p className="card-title-sub" style={{ marginTop: 6 }}>Chaque point est un contact, positionné selon l'ancienneté du dernier lien et coloré par cercle.</p>
          </div>
          <div>
            <div className="card-title-sub" style={{ fontWeight: 700, marginBottom: 6 }}>Vue géographique <Badge label="À intégrer" /></div>
            <div className="preview-box"><GeoPreview /></div>
            <p className="card-title-sub" style={{ marginTop: 6 }}>Répartition des contacts par zone géographique.</p>
          </div>
          <div>
            <div className="card-title-sub" style={{ fontWeight: 700, marginBottom: 6 }}>Réseau <Badge label="À intégrer" /></div>
            <div className="preview-box"><NetworkPreview /></div>
            <p className="card-title-sub" style={{ marginTop: 6 }}>Graphe des connexions entre contacts.</p>
          </div>
        </div>
        <CardFoot><span>Fonction et type d'information préservés vs OS360, rendu adaptable (docs/phase-0/05-regles-score-social.md).</span></CardFoot>
      </Card>

      <Card>
        <CardHead title="Fiche contact" sub="Camille" badge={{ label: 'Cercle Proche' }} />
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Détail</th></tr></thead>
          <tbody>
            {s.camilleInteractionHistory.map((h, i) => (
              <tr key={i}><td>{h.date}</td><td><span className="tag">{h.type}</span></td><td>{h.detail}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="card-title-sub" style={{ marginTop: 10, fontWeight: 600 }}>Interactions par mois</div>
        <div className="heatmap">
          {s.camilleInteractionsPerMonth.map((v, i) => (
            <div key={i} className="heat-cell" style={{ opacity: v === 0 ? 0.12 : 0.3 + v * 0.18 }} />
          ))}
        </div>
        <CardFoot><span>Creux net observé en juillet-août.</span></CardFoot>
      </Card>
    </>
  );
}
