'use client';

import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';

export default function AdminFinalResults({ password }) {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [champion, setChampion] = useState('');
  const [finaliste, setFinaliste] = useState('');
  const [demis, setDemis] = useState(['', '', '', '']);
  const [buteur, setButeur] = useState('');
  const [surprise, setSurprise] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/final-results', {
        headers: { 'x-admin-password': password },
      });
      const d = await res.json();
      setEquipes(d.equipes || []);
      if (d.current) {
        setChampion(d.current.champion || '');
        setFinaliste(d.current.finaliste || '');
        setDemis(d.current.demis || ['', '', '', '']);
        setButeur(d.current.buteur || '');
        setSurprise(d.current.surprise || '');
      }
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger les donnees.' });
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    if (!champion || !finaliste || demis.some((d) => !d) || !buteur || !surprise) {
      setToast({
        type: 'error',
        message: 'Merci de completer tous les resultats officiels.',
      });
      return false;
    }
    return true;
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/final-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ champion, finaliste, demis, buteur, surprise }),
      });
      const d = await res.json();
      if (!res.ok) {
        setToast({ type: 'error', message: d.error || 'Erreur.' });
        return;
      }
      setToast({
        type: 'success',
        message: `Resultats officiels enregistres. Le classement final est desormais fige. (${d.joueursRecalcules} joueur(s) recalcule(s))`,
      });
      setConfirmOpen(false);
    } catch {
      setToast({ type: 'error', message: "Erreur lors de l'enregistrement." });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 5000);
    }
  }

  function teamName(code) {
    const t = equipes.find((e) => e.code === code);
    return t ? `${t.drapeau} ${t.nom}` : code;
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
      <h2 className="font-display text-sm text-or mb-3">
        Resultats finaux du tournoi
      </h2>

      {loading ? (
        <p className="text-craie/60 text-sm">Chargement...</p>
      ) : (
        <div className="bg-marine border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Champion" value={champion} onChange={setChampion} equipes={equipes} />
            <Select label="Finaliste" value={finaliste} onChange={setFinaliste} equipes={equipes} />
          </div>

          <div>
            <label className="block text-xs text-craie/70 mb-1">
              Demi-finalistes (4)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <select
                  key={i}
                  value={demis[i]}
                  onChange={(e) => {
                    const next = [...demis];
                    next[i] = e.target.value;
                    setDemis(next);
                  }}
                  className="bg-nuit border border-white/10 rounded-lg px-2 py-2 text-sm text-craie"
                >
                  <option value="">...</option>
                  {equipes.map((eq) => (
                    <option key={eq.code} value={eq.code}>
                      {eq.drapeau} {eq.nom}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-craie/70 mb-1">
                Meilleur buteur
              </label>
              <input
                type="text"
                value={buteur}
                onChange={(e) => setButeur(e.target.value)}
                className="w-full bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie"
              />
            </div>
            <Select label="Equipe surprise" value={surprise} onChange={setSurprise} equipes={equipes} />
          </div>

          <button
            onClick={() => validate() && setConfirmOpen(true)}
            disabled={saving}
            className="bg-or text-nuit font-display text-xs px-4 py-2 rounded-lg disabled:opacity-60"
          >
            Enregistrer les resultats officiels
          </button>
          <p className="text-xs text-espagne">
            ⚠️ Action irreversible une fois la finale jouee.
          </p>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-nuit/90 backdrop-blur flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-marine border border-or/30 rounded-2xl p-6">
            <h3 className="font-display text-base text-or mb-4">
              Confirmer les resultats finaux
            </h3>
            <div className="space-y-1 text-sm text-craie/90 bg-nuit rounded-xl p-4 mb-4">
              <p>🏆 Champion : {teamName(champion)}</p>
              <p>🥈 Finaliste : {teamName(finaliste)}</p>
              <p>🏁 Demi-finalistes : {demis.map((d) => teamName(d)).join(', ')}</p>
              <p>⚽ Meilleur buteur : {buteur}</p>
              <p>⭐ Equipe surprise : {teamName(surprise)}</p>
            </div>
            <p className="text-xs text-espagne mb-4">
              Cette action recalculera definitivement les points de tous les
              pronostics initiaux. Es-tu sure de vouloir continuer ?
            </p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-sm text-craie/70 px-4 py-2"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="bg-or text-nuit font-display text-sm px-6 py-3 rounded-xl disabled:opacity-60"
              >
                {saving ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, equipes }) {
  return (
    <div>
      <label className="block text-xs text-craie/70 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie"
      >
        <option value="">...</option>
        {equipes.map((eq) => (
          <option key={eq.code} value={eq.code}>
            {eq.drapeau} {eq.nom}
          </option>
        ))}
      </select>
    </div>
  );
}
