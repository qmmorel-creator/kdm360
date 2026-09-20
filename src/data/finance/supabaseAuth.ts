// Authentification Supabase pour Budget — même modèle qu'OS360 (CLAUDE.md d'OS360,
// db/schema.sql : chaque politique RLS exige `auth.uid() = current_app_owner()`).
// La clé publiable seule ne donne accès à rien : il faut une session authentifiée
// pour l'unique compte propriétaire. Identifiants jamais commités, jamais stockés
// par KDM360 lui-même — supabase-js persiste la session dans le localStorage du
// navigateur (comportement par défaut du SDK), comme OS360.
import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
