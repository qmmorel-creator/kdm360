import { Card, CardHead, CardFoot, Badge } from '@/design/components/Card';
import { DataState } from '@/design/components/DataState';
import { useAsync } from '@/app/useAsync';
import { getSocialOverview } from '@/domains/social';

const CIRCLE_COLOR: Record<string, string> = {
  proche: 'var(--teal-dark)',
  regulier: 'var(--teal)',
  occasionnel: 'var(--coral)',
  dormant: 'var(--gray-light)',
};

function RadarPreview({ contacts }: { contacts: { circle: string }[] }) {
  const rings = [30, 55, 80, 105];
  const points = contacts.slice(0, 40).map((c, i) => {
    const ring = rings[i % rings.length];
    const angle = (i / Math.max(1, contacts.length)) * Math.PI * 2;
    const jitter = (i * 37) % 12;
    const r = ring - jitter;
    return { x: 120 + r * Math.cos(angle), y: 120 + r * Math.sin(angle), circle: c.circle };
  });
  return (
    <svg width="100%" height={190} viewBox="0 0 240 240" role="img" aria-label="Aperçu radar relationnel">
      {rings.map((r) => (
        <circle key={r} cx={120} cy={120} r={r} fill="none" stroke="var(--border)" />
      ))}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={CIRCLE_COLOR[p.circle] ?? 'var(--gray)'} />
      ))}
    </svg>
  );
}

export function SocialPage() {
  const state = useAsync(getSocialOverview, []);

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
        <span className="page-badge">Source réelle · pont Apps Script</span>
      </div>

      <DataState state={state}>
        {(s) => {
          const toRelance = s.contacts
            .filter((c) => c.daysSinceLastContact > c.contactThresholdDays || c.awaitingReply)
            .sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact);

          return (
            <>
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
                  <CardHead title="Liens à entretenir" sub="Contacts au-delà de leur délai cible" badge={{ label: `${toRelance.length} contact(s)`, tone: 'coral' }} />
                  {toRelance.length === 0 ? (
                    <p className="card-title-sub">Aucun contact en retard.</p>
                  ) : (
                    <table>
                      <thead><tr><th>Contact / cercle</th><th>Dernier lien</th><th>Situation</th></tr></thead>
                      <tbody>
                        {toRelance.slice(0, 10).map((c) => (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong> · {c.circleName}</td>
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
                  )}
                </Card>
              </div>

              <Card>
                <CardHead title="Visualisations du réseau" sub="Trois façons d'explorer vos relations" badge={{ label: '3 vues' }} />
                <div className="grid grid-3">
                  <div>
                    <div className="card-title-sub" style={{ fontWeight: 700, marginBottom: 6 }}>Radar relationnel <Badge label="Aperçu" tone="teal" /></div>
                    <div className="preview-box"><RadarPreview contacts={s.contacts} /></div>
                    <p className="card-title-sub" style={{ marginTop: 6 }}>Chaque point est un contact, coloré par cercle.</p>
                  </div>
                  <div>
                    <div className="card-title-sub" style={{ fontWeight: 700, marginBottom: 6 }}>Vue géographique <Badge label="À intégrer" /></div>
                    <div className="preview-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 190 }}>
                      <p className="card-title-sub">À construire à partir des champs adresse/lat/lng réels.</p>
                    </div>
                  </div>
                  <div>
                    <div className="card-title-sub" style={{ fontWeight: 700, marginBottom: 6 }}>Réseau <Badge label="À intégrer" /></div>
                    <div className="preview-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 190 }}>
                      <p className="card-title-sub">À construire à partir des relations contact à contact réelles.</p>
                    </div>
                  </div>
                </div>
                <CardFoot><span>Fonction et type d'information préservés vs OS360, rendu adaptable (docs/phase-0/05-regles-score-social.md).</span></CardFoot>
              </Card>
            </>
          );
        }}
      </DataState>
    </>
  );
}
