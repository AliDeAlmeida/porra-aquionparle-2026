'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/useSession';
import PrognosticModal from '../../components/PrognosticModal';

const PHASES = [
  'Tous',
  'Phase de groupes',
  'Huitiemes',
  'Quarts',
  'Demi-finales',
  'Finale',
];

export default function CalendrierPage() {
  const router = useRouter();
  const session = useSession();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPhase, setFilterPhase] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (session === false) router.replace('/rejoindre');
  }, [session, router]);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/matches?idJoueur=${session.idJoueur}`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  // Recalcul du compte a rebours toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-craie/60">
        Chargement...
      </div>
    );
  }

  const filtered = matches.filter((m) => {
    if (filterPhase !== 'Tous' && m.phase !== filterPhase) return false;
    if (filterStatus !== 'Tous' && m.statut !== filterStatus) return false;
    return true;
  });

  // Group by date for separators
  let lastDateLabel = null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-display text-xl md:text-2xl text-craie mb-6">
        📅 Calendrier de la Coupe du Monde 2026
      </h1>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PHASES.map((p) => (
          <button
            key={p}
            onClick={() => setFilterPhase(p)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filterPhase === p
                ? 'bg-or text-nuit border-or'
                : 'border-white/10 text-craie/70 hover:border-white/30'
            }`}
          >
            {p}
          </button>
        ))}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs bg-marine border border-white/10 rounded-full px-3 py-1.5 text-craie/80"
        >
          <option value="Tous">Tous les statuts</option>
          <option value="A venir">A venir</option>
          <option value="Verrouille">Verrouille</option>
          <option value="Termine">Termine</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-craie/60 py-20">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-craie/70 mb-4">
            Aucun match ne correspond a ce filtre. Essaie une autre phase !
          </p>
          <button
            onClick={() => {
              setFilterPhase('Tous');
              setFilterStatus('Tous');
            }}
            className="text-or text-sm hover:underline"
          >
            Reinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((m) => {
            const dateLabel = formatDateLabel(m.dateHeureUTC);
            const showSeparator = dateLabel !== lastDateLabel;
            lastDateLabel = dateLabel;

            return (
              <div key={m.idMatch}>
                {showSeparator && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px flex-1 bg-or/20" />
                    <span className="text-xs text-or uppercase tracking-wide">
                      {dateLabel}
                    </span>
                    <div className="h-px flex-1 bg-or/20" />
                  </div>
                )}
                <MatchCard
                  match={m}
                  now={now}
                  onPronostiquer={() => setSelectedMatch(m)}
                />
              </div>
            );
          })}
        </div>
      )}

      {selectedMatch && (
        <PrognosticModal
          match={selectedMatch}
          session={session}
          onClose={() => setSelectedMatch(null)}
          onSaved={() => {
            setSelectedMatch(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function MatchCard({ match, now, onPronostiquer }) {
  const countdown = formatCountdown(match.dateHeureUTC, now);

  let borderColor = 'border-white/10';
  let badge = null;

  if (match.statut === 'Termine') {
    borderColor = 'border-or/30';
    badge = (
      <span className="text-xs bg-or/20 text-or px-2 py-1 rounded-full">
        ✔ Termine
      </span>
    );
  } else if (match.statut === 'Verrouille') {
    borderColor = 'border-tribune/30';
    badge = (
      <span className="text-xs bg-white/10 text-tribune px-2 py-1 rounded-full">
        🔒 Verrouille
      </span>
    );
  } else if (match.monPronostic) {
    borderColor = 'border-vert/40';
    badge = (
      <span className="text-xs bg-vert/20 text-vert px-2 py-1 rounded-full">
        ✅ Enregistre
      </span>
    );
  } else {
    borderColor = 'border-or/40';
    badge = (
      <span className="text-xs bg-or/10 text-or px-2 py-1 rounded-full">
        ⏳ Ouvert
      </span>
    );
  }

  return (
    <div className={`bg-marine border ${borderColor} rounded-2xl p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-craie">
            {match.equipeA} vs {match.equipeB}
          </p>
          <p className="text-xs text-tribune mt-1">
            {match.phase} · {formatTime(match.dateHeureUTC)}
          </p>
          {match.statut === 'A venir' && countdown && (
            <p className="text-xs text-or mt-1">
              ⏳ Fermeture dans {countdown}
            </p>
          )}
        </div>
        {badge}
      </div>

      {/* Contenu selon statut */}
      {match.statut === 'A venir' && (
        <div className="mt-3">
          <button
            onClick={onPronostiquer}
            className="bg-or text-nuit font-display text-xs px-4 py-2 rounded-lg"
          >
            {match.monPronostic ? 'Modifier' : 'Faire mon pronostic'}
          </button>
          {match.monPronostic && (
            <span className="ml-3 text-sm text-craie/80">
              Ton pronostic : {match.monPronostic.scoreA}-
              {match.monPronostic.scoreB}
            </span>
          )}
        </div>
      )}

      {match.statut === 'Verrouille' && (
        <div className="mt-3 locked-texture rounded-lg px-4 py-3">
          {match.monPronostic ? (
            <p className="text-craie/70 text-sm">
              Ton pronostic : {match.monPronostic.scoreA}-
              {match.monPronostic.scoreB}
            </p>
          ) : (
            <p className="text-craie/60 text-sm">
              Tu n&apos;as pas soumis de pronostic pour ce match. 0 point pour
              ce match.
            </p>
          )}
        </div>
      )}

      {match.statut === 'Termine' && (
        <div className="mt-3 space-y-2">
          <div className="bg-or/10 rounded-lg px-4 py-2 text-sm text-craie">
            Resultat reel : {match.equipeA} {match.scoreAReel} -{' '}
            {match.scoreBReel} {match.equipeB}
          </div>
          {match.monPronostic ? (
            <>
              <div
                className={`rounded-lg px-4 py-2 text-sm ${
                  match.monPronostic.points === 5
                    ? 'bg-or/20 text-or'
                    : match.monPronostic.points === 3
                    ? 'bg-vert/20 text-vert'
                    : 'bg-white/5 text-craie/70'
                }`}
              >
                Ton pronostic : {match.equipeA} {match.monPronostic.scoreA} -{' '}
                {match.monPronostic.scoreB} {match.equipeB}
              </div>
              <PointsBadge points={match.monPronostic.points} />
            </>
          ) : (
            <p className="text-craie/60 text-sm">
              Tu n&apos;avais pas fait de pronostic pour ce match.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PointsBadge({ points }) {
  if (points === 5) {
    return (
      <p className="text-or font-display text-sm">
        🎉 +5 points — Score exact !
      </p>
    );
  }
  if (points === 3) {
    return (
      <p className="text-vert font-display text-sm">
        👍 +3 points — Bon pronostic !
      </p>
    );
  }
  return (
    <p className="text-craie/60 text-sm">
      Pas de points cette fois. La prochaine est la bonne !
    </p>
  );
}

function formatDateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatCountdown(iso, now) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  const diffMs = target - now;
  if (diffMs <= 0) return null;

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (diffMs < 15 * 60000) return '🔴 Imminent';
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}
