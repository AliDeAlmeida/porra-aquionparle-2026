'use client';

import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';

export default function AdminBonus({ password }) {
  const [data, setData] = useState({ participants: [], defis: [], bonusExistants: [] });
  const [loading, setLoading] = useState(true);
  const [idJoueur, setIdJoueur] = useState('');
  const [nomDefi, setNomDefi] = useState('');
  const [points, setPoints] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bonus', {
        headers: { 'x-admin-password': password },
      });
      const d = await res.json();
      setData(d);
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger les donnees.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!idJoueur || !nomDefi || points === '') {
      setToast({ type: 'error', message: 'Merci de completer tous les champs.' });
      return;
    }

    let pts = Number(points);
    if (pts > 20) {
      setToast({
        type: 'error',
        message: 'Le maximum autorise est de 20 points par defi.',
      });
      pts = 20;
    }

    setSaving(true);
    try {
      const joueur = data.participants.find((p) => p.idJoueur === idJoueur);
      const defi = data.defis.find((d) => d.nom === nomDefi);

      const res = await fetch('/api/admin/bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({
          idJoueur,
          prenom: joueur?.prenom,
          nomDefi,
          langue: defi?.langue,
          points: pts,
          commentaire,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setToast({ type: 'error', message: d.error || 'Erreur.' });
        return;
      }
      setToast({
        type: 'success',
        message: `Points bonus attribues a ${joueur?.prenom} pour "${nomDefi}".`,
      });
      setPoints('');
      setCommentaire('');
      load();
    } catch {
      setToast({ type: 'error', message: "Erreur lors de l'enregistrement." });
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
      <h2 className="font-display text-sm text-or mb-3">
        Points bonus (Defis linguistiques)
      </h2>

      {loading ? (
        <p className="text-craie/60 text-sm">Chargement...</p>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="bg-marine border border-white/10 rounded-2xl p-4 space-y-3 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-craie/70 mb-1">Joueur</label>
                <select
                  value={idJoueur}
                  onChange={(e) => setIdJoueur(e.target.value)}
                  className="w-full bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie"
                >
                  <option value="">Selectionner...</option>
                  {data.participants.map((p) => (
                    <option key={p.idJoueur} value={p.idJoueur}>
                      {p.prenom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-craie/70 mb-1">Defi</label>
                <select
                  value={nomDefi}
                  onChange={(e) => setNomDefi(e.target.value)}
                  className="w-full bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie"
                >
                  <option value="">Selectionner...</option>
                  {data.defis.map((d) => (
                    <option key={d.idDefi} value={d.nom}>
                      {d.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-craie/70 mb-1">
                  Points (0-20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs text-craie/70 mb-1">
                  Commentaire (optionnel)
                </label>
                <input
                  type="text"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  className="w-full bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-or text-nuit font-display text-xs px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {saving ? '...' : 'Attribuer les points'}
            </button>
          </form>

          <h3 className="font-display text-xs text-craie/70 mb-2">
            Bonus deja attribues
          </h3>
          <div className="space-y-2">
            {data.bonusExistants.length === 0 ? (
              <p className="text-craie/50 text-sm">Aucun bonus attribue pour le moment.</p>
            ) : (
              data.bonusExistants.map((b, i) => (
                <div
                  key={i}
                  className="bg-marine border border-white/10 rounded-lg px-4 py-2 flex items-center justify-between text-sm"
                >
                  <span className="text-craie">
                    {data.participants.find((p) => p.idJoueur === b.idJoueur)?.prenom ||
                      b.idJoueur}{' '}
                    — {b.nomDefi}
                  </span>
                  <span className="text-or font-mono-num">+{b.points}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
