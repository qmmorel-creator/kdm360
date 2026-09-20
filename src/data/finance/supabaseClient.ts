import { createClient } from '@supabase/supabase-js';

// Projet Supabase réel "kdm360" — clé publiable protégée par RLS (current_app_owner()),
// même modèle de confiance que OS360 (voir db/schema.sql d'OS360, finding D4 de l'audit :
// une clé sb_publishable_ est conçue pour être publique, la protection réelle est la RLS).
// Jamais de clé service_role ici.
const SUPABASE_URL = 'https://ftgmjaozveprnshkdosj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QDDHQld2wzUsU8Cm4RyqFA_ejsA80E-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
