'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '../../lib/useSession';
import Card from '../../components/Card';
import AnimatedNumber from '../../components/AnimatedNumber';
import InitialPrognosticsModal from '../../components/InitialPrognosticsModal';

export default function TableauDeBordPage() {
  const router = useRouter();
  const session = useSession();

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [ballonOr, setBallonOr] = useState({ isOpen: false });
  const [initialStatus, setInitialStatus] = useState(null);

  useEffect(() => {
    if (session === false) {
      router.replace('/rejoindre');
    }
  }, [session, router]);

  useEffect(() => {
    if (!session) return;

    async function load() {
      try {
        const [matchesRes, rankingRes, challengesRes, ballonRes, initRes] =
          await Promise.all([
            fetch(`/api/matches?idJoueur=${session.idJoueur}`).then((r) =>
              r.json()
            ),
            fetch('/api/leaderboard').then((r) => r.json()),
            fetch(`/api/challenges?idJoueur=${session.idJoueur}`).then((r) =>
              r.json()
            ),
            fetch(`/api/ballondor?idJoueur=${session.idJoueur}`).then((r) =>
              r.json()
            ),
            fetch(`/api/initial-prognostic?idJoueur=${session.idJoueur}`).then(
              (r) => r.json()
            ),
          ]);

        setMatches(matchesRes.matches || []);
        setRanking(rankingRes.ranking || []);
        setChallenges(challengesRes.challenges || []);
        setBallonOr(ballonRes);
        setInitialStatus(initRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-craie/60">
        Chargement...
      </div>
    );
  }

  const me = ranking.find((r) => r.idJoueur === session.idJoueur);
  const upcomingMatches = matches
    .filter((m) => m.statut === 'A venir')
    .slice(0, 3);
  const activeChallenge = challenges.find((c) => c.statut === 'En cours');

  const showInitialModal =
    initialStatus &&
    !initialStatus.hasSubmitted &&
    !initialStatus.tournamentStarted;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {showInitialModal && (
        <InitialPrognosticsModal
          session={session}
          onComplete={() =>
            setInitialStatus({ hasSubmitted: true, tournamentStarted: false })
          }
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h1 className="font-display text-xl md:text-2xl text-craie">
          Bonjour {session.prenom} 👋
        </h1>
        {me && (
          <div className="bg-marine border border-white/10 rounded-xl px-4 py-2 text-sm">
            Classement actuel :{' '}
            <span className="text-or font-semibold">{me.rang}e</span> ·
            Points : <span className="text-or font-semibold">{me.total}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center text-craie/60 py-20">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mes points */}
          <Card title="Mes points" icon="📊" className="md:order-1 order-1">
            {me ? (
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-sm text-craie/80">
                  <p>
                    Pronostics matchs :{' '}
                    <span className="text-craie font-medium">
                      {me.pointsMatchs}
                    </span>
                  </p>
                  <p>
                    Pronostics initiaux :{' '}
                    <span className="text-craie font-medium">
                      {me.pointsInitiaux}
                    </span>
                  </p>
                  <p>
                    Defis linguistiques :{' '}
                    <span className="text-craie font-medium">
                      {me.pointsDefis}
                    </span>
                  </p>
                </div>
                <div className="text-center">
                  <AnimatedNumber
                    value={me.total}
                    className="text-4xl text-or font-bold"
                  />
                  <p className="text-xs text-tribune mt-1">points totaux</p>
                </div>
              </div>
            ) : (
              <p className="text-craie/60 text-sm">
                Tes points apparaitront ici des que tu commenceras a
                pronostiquer.
              </p>
            )}
          </Card>

          {/* Defi linguistique actuel */}
          <Card
            title="Defi linguistique actuel"
            icon="🎙"
            className="md:order-2 order-3"
          >
            {activeChallenge ? (
              <div
                className={`border-l-4 pl-4 ${
                  activeChallenge.langue?.toLowerCase().includes('espagn')
                    ? 'border-espagne'
                    : 'border-france'
                }`}
              >
                <p className="text-craie/90 text-sm mb-2">
                  {activeChallenge.description}
                </p>
                <p className="text-xs text-tribune mb-3">
                  🏆 Jusqu&apos;a +{activeChallenge.pointsMax} points · 📅
                  Date limite : {formatDate(activeChallenge.dateFin)}
                </p>
                <Link
                  href="/defis"
                  className="inline-block bg-or text-nuit text-sm font-display px-4 py-2 rounded-lg"
                >
                  Participer →
                </Link>
              </div>
            ) : (
              <p className="text-craie/60 text-sm">
                Aucun defi en cours. Le prochain arrive bientot — reste
                connecte(e) !
              </p>
            )}
          </Card>

          {/* Prochains matchs */}
          <Card
            title="Matchs a venir"
            icon="📅"
            className="md:order-3 order-2 md:col-span-2"
          >
            {upcomingMatches.length === 0 ? (
              <p className="text-craie/60 text-sm">
                Aucun match a venir pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((m) => (
                  <div
                    key={m.idMatch}
                    className="flex items-center justify-between bg-nuit rounded-xl px-4 py-3"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-craie">
                        {m.equipeA} vs {m.equipeB}
                      </span>
                      <p className="text-xs text-tribune">
                        {formatDate(m.dateHeureUTC)}
                      </p>
                    </div>
                    {m.monPronostic ? (
                      <span className="text-xs bg-vert/20 text-vert px-3 py-1 rounded-full">
                        ✅ Pronostic enregistre
                      </span>
                    ) : (
                      <Link
                        href="/calendrier"
                        className="text-xs bg-or text-nuit font-display px-3 py-2 rounded-lg"
                      >
                        Pronostiquer
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/calendrier"
              className="inline-block text-or text-sm mt-3 hover:underline"
            >
              Voir le calendrier complet →
            </Link>
          </Card>

          {/* Classement general */}
          <Card title="Classement general" icon="🏆" className="md:order-4 order-4">
            {ranking.length === 0 ? (
              <p className="text-craie/60 text-sm">
                Le classement s&apos;animera des le premier resultat de
                match. Reviens bientot !
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center">
                {ranking.slice(0, 3).map((r, idx) => (
                  <div key={r.idJoueur} className="flex flex-col items-center">
                    <div className="text-2xl">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                    <p className="text-sm text-craie mt-1 truncate w-full">
                      {r.prenom}
                    </p>
                    <p className="text-xs text-or font-mono-num">
                      {r.total} pts
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/classement"
              className="inline-block text-or text-sm mt-3 hover:underline"
            >
              Voir le classement complet →
            </Link>
          </Card>

          {/* Ballon d'or */}
          <Card
            title="Ballon d'Or Aquionparle"
            icon="⭐"
            className="md:order-5 order-5 md:col-span-2"
          >
            {ballonOr.isOpen ? (
              <div className="flex items-center justify-between">
                <p className="text-craie/90 text-sm">
                  Le vote est ouvert ! Qui a le plus contribue a faire vivre
                  cette aventure ?
                </p>
                <Link
                  href="/ballon-dor"
                  className="bg-or text-nuit font-display text-sm px-4 py-2 rounded-lg whitespace-nowrap ml-3"
                >
                  🗳 Voter →
                </Link>
              </div>
            ) : (
              <p className="text-craie/60 text-sm">
                🔒 Le vote ouvrira 3 jours avant la finale.
              </p>
            )}
          </Card>
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