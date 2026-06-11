'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from '../../components/Confetti';

export default function RejoindrePage() {
  const router = useRouter();
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [accepte, setAccepte] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { prenom }

  function validate() {
    const errs = {};
    if (!prenom.trim()) {
      errs.prenom = 'Indique un prenom ou un pseudo pour continuer.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Cette adresse email ne semble pas valide.';
    }
    if (!accepte) {
      errs.accepte =
        'Merci de cocher cette case pour continuer.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom: prenom.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ global: data.error || 'Une erreur est survenue.' });
        setLoading(false);
        return;
      }

      setSuccess({ prenom: data.prenom, isNew: data.isNew });

      setTimeout(() => {
        router.push('/tableau-de-bord');
      }, 2500);
    } catch {
      setErrors({
        global: 'Impossible de se connecter. Verifie ta connexion et reessaie.',
      });
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, #1F2C5C 0%, #0B1437 60%, #060B1F 100%)',
        }}
      />

      {success ? (
        <>
          <Confetti count={40} intense />
          <div className="relative z-10 max-w-md w-full bg-marine border border-white/10 rounded-2xl p-8 text-center animate-stamp">
            <h2 className="font-display text-2xl text-or mb-4">
              {success.isNew
                ? `Bienvenue ${success.prenom} 👋`
                : `Content de te revoir, ${success.prenom} 👋`}
            </h2>
            <p className="text-craie/90">
              {success.isNew
                ? 'Tu fais desormais partie de La Porra Aquionparle 2026.'
                : 'On te redirige vers ton tableau de bord.'}
            </p>
          </div>
        </>
      ) : (
        <div className="relative z-10 max-w-md w-full bg-marine/90 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl text-or text-center mb-6">
            ⚽ Rejoins le defi
          </h2>

          {errors.global && (
            <div className="mb-4 bg-espagne/20 border border-espagne text-craie text-sm rounded-lg px-4 py-3">
              {errors.global}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-craie/80 mb-1">
                Prenom ou pseudo
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className={`w-full bg-nuit border rounded-lg px-4 py-3 text-craie focus:outline-none focus:ring-2 focus:ring-or transition ${
                  errors.prenom ? 'border-espagne' : 'border-white/10'
                }`}
                placeholder="Sophie"
              />
              {errors.prenom && (
                <p className="text-espagne text-xs mt-1">{errors.prenom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-craie/80 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-nuit border rounded-lg px-4 py-3 text-craie focus:outline-none focus:ring-2 focus:ring-or transition ${
                  errors.email ? 'border-espagne' : 'border-white/10'
                }`}
                placeholder="sophie@email.com"
              />
              {errors.email && (
                <p className="text-espagne text-xs mt-1">{errors.email}</p>
              )}
              <p className="text-tribune text-xs mt-1">
                Si tu reviens depuis un autre appareil, utilise la meme
                adresse email pour retrouver ton profil.
              </p>
            </div>

            <label className="flex items-start gap-2 text-sm text-craie/80">
              <input
                type="checkbox"
                checked={accepte}
                onChange={(e) => setAccepte(e.target.checked)}
                className="mt-1 accent-or"
              />
              <span>
                J&apos;accepte que mon prenom apparaisse dans le classement
                public.
              </span>
            </label>
            {errors.accepte && (
              <p className="text-espagne text-xs -mt-2">{errors.accepte}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-or text-nuit font-display text-sm px-6 py-4 rounded-xl hover:-translate-y-0.5 transition-transform disabled:opacity-60"
            >
              {loading ? 'Connexion...' : '✅ Rejoindre la competition'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
