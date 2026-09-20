import { ROUTES, type RouteId } from './routes';

export function Sidebar({ active, onNavigate }: { active: RouteId; onNavigate: (id: RouteId) => void }) {
  return (
    <nav className="sidebar" aria-label="Navigation principale">
      <div className="logo">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
          <circle cx="15" cy="15" r="13" stroke="#3f7a6a" strokeWidth="1.6" />
          <circle cx="15" cy="15" r="7" stroke="#3f7a6a" strokeWidth="1.6" />
          <circle cx="15" cy="15" r="2.2" fill="#3f7a6a" />
        </svg>
        <div>
          <span className="logo-name">KDM360</span>
          <span className="logo-sub">Personal Intelligence</span>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Votre quotidien</div>
        <ul className="nav-list">
          {ROUTES.slice(0, 5).map((r) => (
            <li key={r.id}>
              <a
                href={`#${r.id}`}
                className={`nav-item${active === r.id ? ' active' : ''}`}
                aria-current={active === r.id ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(r.id);
                }}
              >
                <span>{r.label}</span>
                <span className="nav-num">{r.num}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="nav-section">
        <div className="nav-label">Exploration</div>
        <ul className="nav-list">
          <li>
            <a
              href="#explorer"
              className={`nav-item${active === 'explorer' ? ' active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('explorer');
              }}
            >
              <span>Explorer</span>
              <span className="nav-num">06</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="sidebar-bottom">
        <div className="edition-badge">
          <div className="edition-title">V0 — sources réelles</div>
          <div className="edition-desc">Budget/Santé/Sport en direct. Social nécessite une URL dans Réglages.</div>
        </div>
        <div className="sidebar-links">
          <a
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('settings');
            }}
          >
            Réglages
          </a>
        </div>
        <div className="profile">
          <span className="profile-avatar">QM</span>
          <div>
            <div className="profile-name">Quentin</div>
            <div className="profile-sub">Espace personnel</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
