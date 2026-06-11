'use client';

import { useEffect, useState } from 'react';
import AdminMatches from './AdminMatches';
import AdminBonus from './AdminBonus';
import AdminFinalResults from './AdminFinalResults';
import AdminBallonOr from './AdminBallonOr';
import AdminParticipants from './AdminParticipants';

const TABS = [
  { key: 'matches', label: 'Resultats matchs' },
  { key: 'bonus', label: 'Points bonus' },
  { key: 'final', label: 'Resultats finaux' },
  { key: 'ballondor', label: "Ballon d'Or" },
  { key: 'participants', label: 'Vue classements' },
];

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('matches');

  useEffect(() => {
    const stored = sessionStorage.getItem('porra_admin_pwd');
    if (stored) {
      setPassword(stored);
      setAuthed(true);
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Mot de passe incorrect.');
        setLoading(false);
        return;
      }
      sessionStorage.setItem('porra_admin_pwd', password);
      setAuthed(true);
    } catch {
      setError('Une erreur est survenue.');
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="max-w-sm w-full bg-marine border border-white/10 rounded-2xl p-6"
        >
          <h1 className="font-display text-lg text-or text-center mb-6">
            🔧 Administration
          </h1>
          {error && (
            <div className="mb-4 bg-espagne/20 border border-espagne text-craie text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <label className="block text-sm text-craie/80 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-nuit border border-white/10 rounded-lg px-4 py-3 text-craie focus:outline-none focus:ring-2 focus:ring-or mb-4"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-or text-nuit font-display text-sm px-6 py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? 'Verification...' : 'Acceder'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="font-display text-xl md:text-2xl text-or mb-6">
        🔧 Administration — La Porra Aquionparle 2026
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs px-3 py-2 rounded-full border transition ${
              tab === t.key
                ? 'bg-or text-nuit border-or'
                : 'border-white/10 text-craie/70 hover:border-white/30'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'matches' && <AdminMatches password={password} />}
      {tab === 'bonus' && <AdminBonus password={password} />}
      {tab === 'final' && <AdminFinalResults password={password} />}
      {tab === 'ballondor' && <AdminBallonOr password={password} />}
      {tab === 'participants' && <AdminParticipants password={password} />}
    </div>
  );
}
