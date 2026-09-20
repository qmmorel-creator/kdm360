import { useEffect, useState } from 'react';
import { Card, CardHead, CardFoot } from '@/design/components/Card';
import { getSocialBridgeUrl, setSocialBridgeUrl } from '@/app/settings';
import { getSession, signIn, signOut } from '@/data/finance/supabaseAuth';

function BudgetAuthCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'signing-in' | 'error'>('checking');
  const [error, setError] = useState('');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    getSession()
      .then((s) => {
        setSessionEmail(s?.user.email ?? null);
        setStatus('idle');
      })
      .catch(() => setStatus('idle'));
  }, []);

  return (
    <Card>
      <CardHead title="Connexion Budget" sub="Compte Supabase (même modèle qu'OS360 : RLS + auth.uid())" />
      <p className="card-title-sub" style={{ marginBottom: 10 }}>
        La clé Supabase publiable seule ne donne accès à rien : les politiques RLS exigent une
        session authentifiée du compte propriétaire. Identifiants jamais committés ni envoyés
        ailleurs qu'à Supabase — la session est gérée par le SDK dans ce navigateur.
      </p>
      {sessionEmail ? (
        <div>
          <p className="card-title-sub" style={{ marginBottom: 10 }}>Connecté en tant que <strong>{sessionEmail}</strong>.</p>
          <button
            className="filter-pill"
            onClick={async () => {
              await signOut();
              setSessionEmail(null);
            }}
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            style={{
              width: '100%',
              padding: '9px 12px',
              marginBottom: 8,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <div style={{ marginTop: 12 }}>
            <button
              className="filter-pill active"
              disabled={status === 'signing-in'}
              onClick={async () => {
                setStatus('signing-in');
                setError('');
                try {
                  await signIn(email, password);
                  const s = await getSession();
                  setSessionEmail(s?.user.email ?? null);
                  setPassword('');
                  setStatus('idle');
                } catch (e) {
                  setStatus('error');
                  setError(e instanceof Error ? e.message : String(e));
                }
              }}
            >
              Se connecter
            </button>
            {status === 'error' && <span className="card-title-sub" style={{ marginLeft: 10, color: 'var(--coral)' }}>{error}</span>}
          </div>
        </div>
      )}
      <CardFoot>
        <span>Sans session, les pages Budget et Aujourd'hui affichent un message de connexion manquante plutôt que des données à zéro.</span>
      </CardFoot>
    </Card>
  );
}

export function SettingsPage() {
  const [url, setUrl] = useState(getSocialBridgeUrl());
  const [saved, setSaved] = useState(false);

  return (
    <>
      <div className="breadcrumb">
        Espace personnel <span aria-hidden="true">›</span> <span className="current">Réglages</span>
      </div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Réglages</h1>
          <p className="page-sub">Configuration des sources de données, stockée uniquement dans ce navigateur.</p>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <BudgetAuthCard />
      </div>

      <Card>
        <CardHead title="Pont Social" sub="URL du Web App Apps Script (fichier.gs)" />
        <p className="card-title-sub" style={{ marginBottom: 10 }}>
          Cette URL n'est jamais committée dans le dépôt ni envoyée ailleurs qu'à elle-même —
          stockage local à ce navigateur uniquement (localStorage). Elle donne accès en
          lecture (et écriture côté pont) à tes contacts réels : ne la colle jamais dans un
          message, une issue GitHub ou tout autre endroit public.
        </p>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setSaved(false);
          }}
          placeholder="https://script.google.com/macros/s/.../exec"
          style={{
            width: '100%',
            padding: '9px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
          }}
        />
        <div style={{ marginTop: 12 }}>
          <button
            className="filter-pill active"
            onClick={() => {
              setSocialBridgeUrl(url);
              setSaved(true);
            }}
          >
            Enregistrer
          </button>
          {saved && <span className="card-title-sub" style={{ marginLeft: 10 }}>Enregistré dans ce navigateur.</span>}
        </div>
        <CardFoot>
          <span>Sans cette URL, la page Social et le signal Social d'Aujourd'hui affichent un message de configuration manquante plutôt que des données à zéro.</span>
        </CardFoot>
      </Card>
    </>
  );
}
