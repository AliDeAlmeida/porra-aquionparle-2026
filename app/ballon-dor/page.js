'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/useSession';
import Confetti from '../../components/Confetti';

export default function BallonDorPage() {
  const router = useRouter();
  const session = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (session === false) router.replace('/rejoindre');
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/ballondor?idJoueur=${session.idJoueur}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-craie/60">
        Chargement...
      </div>
    );
  }

  async function handleVote() {
    if (!selected) {
      setError('Selectionne un joueur pour voter.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/ballondor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idJoueur: session.idJoueur,
          prenom: session.prenom,
          idCandidat: selected.idJoueur,
          nomCandidat: selected.prenom,
          motivation,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || 'Une erreur est survenue.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Une erreur est survenue. Reessaie.');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-display text-xl md:text-2xl text-or text-center mb-2">
        ⭐ Ballon d&apos;Or Aquionparle
      </h1>
      <p className="text-center text-craie/70 text-sm mb-8">
        Qui a le plus contribue a faire vivre cette aventure linguistique ?
      </p>

      {loading ? (
        <div className="text-center text-craie/60 py-20">Chargement...</div>
      ) : !data?.isOpen ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔒</p>
          <p className="text-craie/70">
            {data?.message || "Le vote n'est pas encore ouvert."}
          </p>
        </div>
      ) : success || data.hasVoted ? (
        <>
          {success && <Confetti count={40} intense />}
          <div className="bg-marine border border-or/30 rounded-2xl p-6 text-center animate-stamp">
            <p className="text-3xl mb-3">🎉</p>
            <h2 className="font-display text-lg text-or mb-2">
              Merci pour ton vote !
            </h2>
            {data.myVote && (
              <p className="text-craie/80 text-sm">
                Tu as vote pour{' '}
                <span className="text-or font-medium">
                  {data.myVote.candidat}
                </span>
                {data.myVote.motivation && ` — "${data.myVote.motivation}"`}
              </p>
            )}
          </div>
        </>
      ) : (
        <div>
          {error && (
            <div className="mb-4 bg-espagne/20 border border-espagne text-craie text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {data.candidates.map((c) => (
              <button
                key={c.idJoueur}
                onClick={() => setSelected(c)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                  selected?.idJoueur === c.idJoueur
                    ? 'border-or bg-or/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-display text-lg"
                  style={{ backgroundColor: avatarColor(c.idJoueur) }}
                >
                  {c.prenom?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-craie">{c.prenom}</span>
              </button>
            ))}
          </div>

          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value.slice(0, 200))}
            placeholder="Pourquoi ce choix ? (optionnel, 200 caracteres max)"
            className="w-full bg-nuit border border-white/10 rounded-lg px-4 py-3 text-craie text-sm focus:outline-none focus:ring-2 focus:ring-or"
            rows={3}
          />
          <p className="text-xs text-tribune text-right mb-4">
            {motivation.length}/200
          </p>

          <button
            onClick={handleVote}
            disabled={submitting}
            className="w-full bg-or text-nuit font-display text-sm px-6 py-4 rounded-xl disabled:opacity-60"
          >
            {submitting ? 'Envoi...' : '🗳 Valider mon vote'}
          </button>
        </div>
      )}
    </div>
  );
}

function avatarColor(id) {
  const colors = ['#E63946', '#2D6CDF', '#2DBE6C', '#F5B62E', '#8E97B8'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return colors[hash % colors.length];
}
