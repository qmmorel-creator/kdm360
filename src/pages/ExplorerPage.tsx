import { Card, CardHead } from '@/design/components/Card';

// Squelette volontairement minimal — voir docs/phase-0/00-avis-produit.md
// section 8 et docs/architecture/03-roadmap.md : Explorer se développe en
// dernier, pour ne pas capter le temps de développement qui doit aller à la
// hiérarchisation des pages domaine.
export function ExplorerPage() {
  return (
    <>
      <div className="breadcrumb">
        Espace personnel <span aria-hidden="true">›</span> <span className="current">Explorer</span>
      </div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Explorer</h1>
          <p className="page-sub">Composez une analyse : domaine, métrique, période, filtres, visualisation.</p>
        </div>
        <span className="page-badge">Squelette V0</span>
      </div>

      <Card>
        <CardHead title="À construire après les pages domaine" sub="Développement volontairement différé" />
        <p className="card-title-sub">
          Explorer accueillera la richesse analytique d'OS360 (sunburst, waterfall, historique,
          corrélations…) une fois les pages domaine stabilisées. Le construire en premier est le
          piège qui a fait dériver OS360 vers un constructeur de tableau de bord — voir l'avis
          produit de la Phase 0.
        </p>
      </Card>
    </>
  );
}
