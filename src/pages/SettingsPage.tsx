import { useState } from 'react';
import { Card, CardHead, CardFoot } from '@/design/components/Card';
import { getSocialBridgeUrl, setSocialBridgeUrl } from '@/app/settings';

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
