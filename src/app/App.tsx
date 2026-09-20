import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { ROUTES, type RouteId } from './routes';
import { TodayPage } from '@/pages/TodayPage';
import { BudgetPage } from '@/pages/BudgetPage';
import { HealthPage } from '@/pages/HealthPage';
import { SportPage } from '@/pages/SportPage';
import { SocialPage } from '@/pages/SocialPage';
import { ExplorerPage } from '@/pages/ExplorerPage';

function currentRoute(): RouteId {
  const hash = window.location.hash.replace('#', '');
  return (ROUTES.find((r) => r.id === hash)?.id ?? 'today') as RouteId;
}

export function App() {
  const [route, setRoute] = useState<RouteId>(currentRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (id: RouteId) => {
    window.location.hash = id;
    setRoute(id);
  };

  return (
    <div className="app">
      <Sidebar active={route} onNavigate={navigate} />
      <main className="content">
        {route === 'today' && <TodayPage />}
        {route === 'budget' && <BudgetPage />}
        {route === 'health' && <HealthPage />}
        {route === 'sport' && <SportPage />}
        {route === 'social' && <SocialPage />}
        {route === 'explorer' && <ExplorerPage />}
      </main>
    </div>
  );
}
