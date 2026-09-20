import { useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: T };

/** Charge une source de données réelle et distingue explicitement chargement /
 * erreur / données — jamais un état vide silencieux qui ressemblerait à "aucune
 * donnée" (cf. docs/phase-0/00-avis-produit.md section 22 du prompt de refonte). */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    loader()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setState({ status: 'error', error: err instanceof Error ? err.message : String(err) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
