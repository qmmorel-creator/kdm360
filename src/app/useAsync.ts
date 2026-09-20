import { useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: T };

/** Extrait un message lisible d'une erreur rejetée, y compris les objets qui ne
 * sont pas `instanceof Error` (ex. PostgrestError de supabase-js, qui n'est
 * qu'un objet `{ message, code, details, hint }`) — sans quoi `String(err)`
 * produit "[object Object]" au lieu du message réel. */
function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return String(err);
}

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
        if (!cancelled) setState({ status: 'error', error: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
