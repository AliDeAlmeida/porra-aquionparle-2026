'use client';

import { useState } from 'react';

export default function PrognosticModal({ match, session, onClose, onSaved }) {
  const [scoreA, setScoreA] = useState(
    match.monPronostic ? Number(match.monPronostic.scoreA) : 0
  );
  const [scoreB, setScoreB] = useState(
    match.monPronostic ? Number(match.monPronostic.scoreB) : 0
  );
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function adjust(setter, value, delta) {
    const next = value + delta;
    if (next < 0 || next > 20) return;
    setter(next);
  }

  async function handleSubmit() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/prognostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idJoueur: session.idJoueur,
          prenom: session.prenom,
          idMatch: match.idMatch,
          scoreA,
          scoreB,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.locked) {
          setLocked(true);
        } else {
          setError(data.error || 'Une erreur est survenue.');
        }
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSaved();
      }, 800);
    } catch {
      setError(
        "Impossible d'enregistrer ton pronostic. Verifie ta connexion et reessaie."
      );
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-nuit/80 backdrop-blur flex items-center justify-center p-4">
      <div className="relative max-w-md w-full bg-marine border border-white/10 rounded-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-craie/60 text-xl"
          aria-label="Fermer"
        >
          ✕
        </button>

        {locked ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-3">🔒</p>
            <h2 className="font-display text-lg text-or mb-2">
              Ce match a deja commence.
            </h2>
            <p className="text-craie/80 text-sm mb-4">
              Ton pronostic ne peut plus etre enregistre.
            </p>
            <button
              onClick={onClose}
              className="bg-or text-nuit font-display text-sm px-6 py-2 rounded-xl"
            >
              Fermer
            </button>
          </div>
        ) : success ? (
          <div className="text-center py-6 animate-stamp">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-craie">
              Pronostic enregistre avec succes.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-lg text-or text-center mb-1">
              ⚽ Ton pronostic
            </h2>
            <p className="text-center text-craie/90 mb-1">
              {match.equipeA} vs {match.equipeB}
            </p>
            <p className="text-center text-xs text-tribune mb-6">
              {formatDate(match.dateHeureUTC)}
            </p>

            {error && (
              <div className="mb-4 bg-espagne/20 border border-espagne text-craie text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex items-center justify-center gap-8">
              <ScoreInput
                label={match.equipeA}
                value={scoreA}
                onChange={(v) => setScoreA(v)}
                onAdjust={(d) => adjust(setScoreA, scoreA, d)}
              />
              <span className="font-display text-2xl text-craie/40">—</span>
              <ScoreInput
                label={match.equipeB}
                value={scoreB}
                onChange={(v) => setScoreB(v)}
                onAdjust={(d) => adjust(setScoreB, scoreB, d)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="mt-8 w-full bg-or text-nuit font-display text-sm px-6 py-4 rounded-xl disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : '⚽ Valider mon pronostic'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ScoreInput({ label, value, onChange, onAdjust }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => onAdjust(1)}
        className="text-craie/60 hover:text-or text-lg"
        aria-label={`Augmenter le score de ${label}`}
      >
        ▲
      </button>
      <input
        type="number"
        min={0}
        max={20}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= 0 && v <= 20) onChange(v);
        }}
        className="w-16 text-center bg-nuit border border-white/10 rounded-lg py-2 text-3xl font-mono-num text-craie focus:outline-none focus:ring-2 focus:ring-or"
      />
      <button
        onClick={() => onAdjust(-1)}
        className="text-craie/60 hover:text-or text-lg"
        aria-label={`Diminuer le score de ${label}`}
      >
        ▼
      </button>
      <span className="text-xs text-craie/70 max-w-[80px] text-center truncate">
        {label}
      </span>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}
