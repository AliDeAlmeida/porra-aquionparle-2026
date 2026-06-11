'use client';

import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';

export default function AdminBallonOr({ password }) {
  const [statut, setStatut] = useState({ ouvert: false, dateOuverture: '', dateFermeture: '' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);
  const [dateOuverture, setDateOuverture] = useState('');
  const [dateFermeture, setDateFermeture] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ballondor-toggle', {
        headers: { 'x-admin-password': password },
      });
      const d = await res.json();
      setStatut(d);
      setDateOuverture(d.dateOuverture || '');
      setDateFermeture(d.dateFermeture || '');
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger le statut.' });
    } finally {
      setLoading(false);
    }
  }

  function handleToggleClick(newValue) {
    setPendingValue(newValue);
    setConfirmOpen(true);
  }

  async function handleConfirmToggle() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ballondor-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ ouvert: pendingValue }),
      });
      if (!res.ok) {
        const d = await res.json();
        setToast({ type: 'error', message: d.error || 'Erreur.' });
        return;
      }
      setStatut((s) => ({ ...s, ouvert: pendingValue }));
      setToast({
        type: 'success',
        message: pendingValue
          ? "Le vote du Ballon d'Or est maintenant ouvert."
          : "Le vote du Ballon d'Or est maintenant ferme.",
      });
    } catch {
      setToast({ type: 'error', message: 'Erreur.' });
    } finally {
      setSaving(false);
      setConfirmOpen(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  async function handleSaveDates() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ballondor-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({
          ouvert: statut.ouvert,
          dateOuverture,
          dateFermeture,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setToast({ type: 'error', message: d.error || 'Erreur.' });
        return;
      }
      setToast({ type: 'success', message: 'Dates enregistrees.' });
    } catch {
      setToast({ type: 'error', message: 'Erreur.' });
    } finally {
      setSaving(false);
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
      <h2 className="font-display text-sm text-or mb-3">Ballon d&apos;Or</h2>

      {loading ? (
        <p className="text-craie/60 text-sm">Chargement...</p>
      ) : (
        <div className="bg-marine border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-craie">Statut du vote</span>
            <button
              onClick={() => handleToggleClick(!statut.ouvert)}
              className={`relative w-14 h-8 rounded-full transition ${
                statut.ouvert ? 'bg-or' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-nuit transition-transform ${
                  statut.ouvert ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-craie/60">
            {statut.ouvert ? '🟢 Ouvert' : '⚪ Ferme'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-craie/70 mb-1">
                Date d&apos;ouverture (info)
              </label>
              <input
                type="date"
                value={dateOuverture}
                onChange={(e) => setDateOuverture(e.target.value)}
                className="w-full bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie"
              />
            </div>
            <div>
              <label className="block text-xs text-craie/70 mb-1">
                Date de fermeture (info)
              </label>
              <input
                type="date"
                value={dateFermeture}
                onChange={(e) => setDateFermeture(e.target.value)}
                className="w-full bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie"
              />
            </div>
          </div>
          <button
            onClick={handleSaveDates}
            disabled={saving}
            className="bg-or text-nuit font-display text-xs px-4 py-2 rounded-lg disabled:opacity-60"
          >
            Enregistrer les dates
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-nuit/90 backdrop-blur flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-marine border border-or/30 rounded-2xl p-6 text-center">
            <p className="text-craie mb-4">
              {pendingValue
                ? "Ouvrir le vote du Ballon d'Or a tous les participants ?"
                : "Fermer le vote du Ballon d'Or ?"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-sm text-craie/70 px-4 py-2"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={saving}
                className="bg-or text-nuit font-display text-sm px-6 py-3 rounded-xl disabled:opacity-60"
              >
                {saving ? '...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
