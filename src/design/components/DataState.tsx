import type { ReactNode } from 'react';
import type { AsyncState } from '@/app/useAsync';
import { Card } from './Card';

export function DataState<T>({
  state,
  children,
}: {
  state: AsyncState<T>;
  children: (data: T) => ReactNode;
}) {
  if (state.status === 'loading') {
    return (
      <Card>
        <p className="card-title-sub">Chargement des données…</p>
      </Card>
    );
  }
  if (state.status === 'error') {
    return (
      <Card>
        <div className="card-title" style={{ color: 'var(--coral)' }}>
          Impossible de charger les données
        </div>
        <p className="card-title-sub" style={{ marginTop: 6 }}>{state.error}</p>
      </Card>
    );
  }
  return <>{children(state.data)}</>;
}
