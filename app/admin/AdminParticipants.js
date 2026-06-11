'use client';

import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';

export default function AdminParticipants({ password }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/participants', {
        headers: { 'x-admin-password': password },
      });
      const d = await res.json();
      if (!res.ok) {
        setToast({ type: 'error', message: d.error || 'Erreur.' });
        return;
      }
      setParticipants(d.participants || []);
    } catch {
      setToast({ type: 'error', message: 'Impossible de charger les participants.' });
    } finally {
      setLoading(false);
    }
  }

  const filtered = participants.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.prenom || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.idJoueur || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h2 className="font-display text-sm text-or mb-3">Participants</h2>

      {loading ? (
        <p className="text-craie/60 text-sm">Chargement...</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par prenom, email ou ID..."
              className="flex-1 bg-nuit border border-white/10 rounded-lg px-3 py-2 text-sm text-craie"
            />
            <span className="text-xs text-craie/60 whitespace-nowrap">
              {filtered.length} / {participants.length} joueur{participants.length > 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-craie/50 text-sm">Aucun participant trouve.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-craie/60 border-b border-white/10">
                    <th className="py-2 pr-4 font-display text-xs">ID</th>
                    <th className="py-2 pr-4 font-display text-xs">Prenom</th>
                    <th className="py-2 pr-4 font-display text-xs">Email</th>
                    <th className="py-2 pr-4 font-display text-xs">Inscription</th>
                    <th className="py-2 pr-4 font-display text-xs">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.idJoueur}
                      className="border-b border-white/5 text-craie"
                    >
                      <td className="py-2 pr-4 font-mono-num text-xs text-craie/70">
                        {p.idJoueur}
                      </td>
                      <td className="py-2 pr-4">{p.prenom}</td>
                      <td className="py-2 pr-4 text-craie/80">{p.email}</td>
                      <td className="py-2 pr-4 font-mono-num text-xs text-craie/70">
                        {p.dateInscription}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-display ${
                            p.statut === 'Actif'
                              ? 'bg-vert/20 text-vert'
                              : 'bg-tribune/20 text-tribune'
                          }`}
                        >
                          {p.statut || 'Actif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
