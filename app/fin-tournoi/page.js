'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '../../lib/useSession';
import Confetti from '../../components/Confetti';

export default function FinTournoiPage() {
  const router = useRouter();
  const session = useSession();
  const [ranking, setRanking] = useState([]);
  const [ballonOr, setBallonOr] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session === false) router.replace('/rejoindre');
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      fetch('/api/leaderboard').then((r) => r.json()),
      fetch('/api/admin/ballondor-results').then((r) => r.json()),
    ])
      .then(([rankingData, ballonData]) => {
        setRanking(rankingData.ranking || []);
        setBallonOr(ballonData.resultats || []);
      })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-craie/60">
        Chargement...
      </div>
    );
  }

  const me = ranking.find((r) => r.idJoueur === session.idJoueur);
  const winner = ranking[0];
  const second = ranking[1];
  const third = ranking[2];
  const ballonOrWinner = ballonOr[0];

  return (
    <div className="relative min-h-screen px-4 py-10 overflow-hidden">
      <Confetti count={60} intense />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, #1F2C5C 0%, #0B1437 60%, #060B1F 100%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Bandeau personnel */}
        {me && (
          <div
            className="mb-6 inline-block bg-marine border border-or/30 rounded-full px-5 py-2 text-sm animate-slide-up"
            style={{ animationFillMode: 'backwards' }}
          >
            {me.rang <= 3 ? (
              <span className="text-or">
                🎉 Bravo, tu termines{' '}
                {me.rang === 1 ? '1er' : me.rang === 2 ? '2e' : '3e'} !
              </span>
            ) : (
              <span className="text-craie/90">
                Tu termines {me.rang}e avec {me.total} points. Merci d&apos;avoir
                participe !
              </span>
            )}
          </div>
        )}

        <h1
          className="font-display text-2xl md:text-4xl text-or mb-8 animate-stamp"
          style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
        >
          🏆 Fin de la Porra Aquionparle 2026 !
        </h1>

        {winner && (
          <div
            className="mb-8 animate-slide-up"
            style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}
          >
            <p className="text-3xl mb-2 animate-float">👑</p>
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center font-display text-2xl mb-2"
              style={{ backgroundColor: avatarColor(winner.idJoueur) }}
            >
              {winner.prenom?.[0]?.toUpperCase()}
            </div>
            <p className="font-display text-lg text-craie">{winner.prenom}</p>
            <p className="text-or font-mono-num text-xl">{winner.total} points</p>
            <p className="font-display text-sm text-or mt-1">🏆 VAINQUEUR</p>
          </div>
        )}

        {(second || third) && (
          <div
            className="flex items-center justify-center gap-8 mb-10 animate-slide-up"
            style={{ animationDelay: '900ms', animationFillMode: 'backwards' }}
          >
            {second && (
              <div className="text-center">
                <p className="text-xl">🥈</p>
                <p className="text-sm text-craie">{second.prenom}</p>
                <p className="text-xs text-or font-mono-num">
                  {second.total} pts
                </p>
              </div>
            )}
            {third && (
              <div className="text-center">
                <p className="text-xl">🥉</p>
                <p className="text-sm text-craie">{third.prenom}</p>
                <p className="text-xs text-or font-mono-num">
                  {third.total} pts
                </p>
              </div>
            )}
          </div>
        )}

        {ballonOrWinner && (
          <div
            className="bg-marine border border-or/30 rounded-2xl p-5 mb-8 animate-slide-up"
            style={{ animationDelay: '1300ms', animationFillMode: 'backwards' }}
          >
            <h2 className="font-display text-sm text-or mb-2">
              ⭐ Ballon d&apos;Or Aquionparle 2026
            </h2>
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center font-display text-base mb-2"
              style={{ backgroundColor: avatarColor(ballonOrWinner.idCandidat) }}
            >
              {ballonOrWinner.nomCandidat?.[0]?.toUpperCase()}
            </div>
            <p className="text-craie font-medium">
              {ballonOrWinner.nomCandidat}
            </p>
            <p className="text-xs text-tribune">
              {ballonOrWinner.votes} vote(s)
            </p>
          </div>
        )}

        <p
          className="text-craie/90 mb-8 animate-slide-up"
          style={{ animationDelay: '1700ms', animationFillMode: 'backwards' }}
        >
          Merci a tous d&apos;avoir vecu cette aventure en francais et en
          espagnol avec nous. A bientot pour la prochaine edition !
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
          style={{ animationDelay: '2000ms', animationFillMode: 'backwards' }}
        >
          <Link
            href="/classement"
            className="w-full sm:w-auto bg-or text-nuit font-display text-sm px-6 py-3 rounded-xl"
          >
            Voir le classement complet
          </Link>
          <Link
            href="/historique"
            className="w-full sm:w-auto border border-white/30 text-craie font-display text-sm px-6 py-3 rounded-xl"
          >
            Voir mon historique
          </Link>
        </div>
      </div>
    </div>
  );
}

function avatarColor(id) {
  const colors = ['#E63946', '#2D6CDF', '#2DBE6C', '#F5B62E', '#8E97B8'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return colors[hash % colors.length];
}
