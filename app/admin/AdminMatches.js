'use client';

import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';

export default function AdminMatches({ password }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/matches', {
        headers: { 'x-admin-password': password },
      });
      const data = await res.json();
      setMatches(data.matches || []);
      const initialScores = {};
      (data.matches || []).forEach((m) => {
        initialScores[m.idMatch] = {
          a: m.scoreAReel ?? '',
          b: m.scoreBReel ?? '',
        };
      });
      setScores(initialScores);
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger les matchs.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(match) {
    const s = scores[match.idMatch];
    if (s.a === '' || s.b === '' || s.a < 0 || s.b < 0) {
      setToast({ type: 'error', message: 'Merci de saisir un score valide.' });
      return;
    }

    setSaving((p) => ({ ...p, [match.idMatch]: true }));
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({
          idMatch: match.idMatch,
          scoreA: Number(s.a),
          scoreB: Number(s.b),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: 'error', message: data.error || 'Erreur.' });
        return;
      }
      setToast({
        type: 'success',
        message: `Score enregistre. ${data.pronosticsRecalcules} pronostic(s) recalcule(s).`,
      });
      load();
    } catch {
      setToast({ type: 'error', message: "Erreur lors de l'enregistrement." });
    } finally {
      setSaving((p) => ({ ...p, [match.idMatch]: false }));
      setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h2 className="font-display text-sm text-or mb-3">Resultats matchs</h2>

      {loading ? (
        <p className="text-craie/60 text-sm">Chargement...</p>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => {
            const disabled = m.statut === 'A venir';
            return (
              <div
                key={m.idMatch}
                className="bg-marine border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-sm text-craie">
                    {m.equipeA} vs {m.equipeB}
                  </p>
                  <p className="text-xs text-tribune">
                    {formatDate(m.dateHeureUTC)} ·{' '}
                    {m.statut === 'Termine'
                      ? '✔ Termine'
                      : m.statut === 'Verrouille'
                      ? '🔒 Verrouille'
                      : 'A venir'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    disabled={disabled}
                    value={scores[m.idMatch]?.a ?? ''}
                    onChange={(e) =>
                      setScores((p) => ({
                        ...p,
                        [m.idMatch]: { ...p[m.idMatch], a: e.target.value },
                      }))
                    }
                    title={
                      disabled
                        ? 'Disponible une fois le match commence.'
                        : ''
                    }
                    className="w-16 text-center bg-nuit border border-white/10 rounded-lg py-2 font-mono-num text-craie disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-or"
                  />
                  <span className="text-craie/40">-</span>
                  <input
                    type="number"
                    min={0}
                    disabled={disabled}
                    value={scores[m.idMatch]?.b ?? ''}
                    onChange={(e) =>
                      setScores((p) => ({
                        ...p,
                        [m.idMatch]: { ...p[m.idMatch], b: e.target.value },
                      }))
                    }
                    title={
                      disabled
                        ? 'Disponible une fois le match commence.'
                        : ''
                    }
                    className="w-16 text-center bg-nuit border border-white/10 rounded-lg py-2 font-mono-num text-craie disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-or"
                  />
                  <button
                    onClick={() => handleSave(m)}
                    disabled={disabled || saving[m.idMatch]}
                    className="bg-or text-nuit font-display text-xs px-4 py-2 rounded-lg disabled:opacity-40"
                  >
                    {saving[m.idMatch] ? '...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
