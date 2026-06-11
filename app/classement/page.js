'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/useSession';

export default function ClassementPage() {
  const router = useRouter();
  const session = useSession();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    if (session === false) router.replace('/rejoindre');
  }, [session, router]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d) => setRanking(d.ranking || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-craie/60">
        Chargement...
      </div>
    );
  }

  const sorted = [...ranking].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * dir;
  });

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const podium = ranking.slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-display text-xl md:text-2xl text-craie text-center mb-8">
        🏆 Classement general
      </h1>

      {loading ? (
        <div className="text-center text-craie/60 py-20">Chargement...</div>
      ) : ranking.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center gap-4 mb-4 opacity-30">
            <div className="text-5xl">🥈</div>
            <div className="text-6xl">🥇</div>
            <div className="text-5xl">🥉</div>
          </div>
          <p className="text-craie/60">
            Le classement s&apos;animera des le premier resultat de match.
            Reviens bientot !
          </p>
        </div>
      ) : (
        <>
          {ranking.every((r) => r.total === 0) && (
            <p className="text-center text-craie/60 text-sm mb-6">
              Le classement s&apos;animera des le premier resultat de match.
            </p>
          )}

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 mb-10">
            {podium[1] && <PodiumStep player={podium[1]} place={2} height="h-24" medal="🥈" />}
            {podium[0] && <PodiumStep player={podium[0]} place={1} height="h-32" medal="🥇" crown />}
            {podium[2] && <PodiumStep player={podium[2]} place={3} height="h-20" medal="🥉" />}
          </div>

          {/* Tableau complet */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-tribune border-b border-white/10">
                  <Th label="Rang" k="rang" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                  <th className="py-2 px-2">Joueur</th>
                  <Th label="Pts pronostics" k="pointsMatchs" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                  <Th label="Pts defis" k="pointsDefis" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                  <Th label="Total" k="total" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.idJoueur}
                    className={`border-b border-white/5 ${
                      r.idJoueur === session.idJoueur
                        ? 'bg-or/10'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-2 font-mono-num">{r.rang}</td>
                    <td className="py-2 px-2">
                      {r.prenom}
                      {r.idJoueur === session.idJoueur && (
                        <span className="text-xs text-or ml-1">(toi)</span>
                      )}
                    </td>
                    <td className="py-2 px-2 font-mono-num">{r.pointsMatchs}</td>
                    <td className="py-2 px-2 font-mono-num">{r.pointsDefis}</td>
                    <td className="py-2 px-2 font-mono-num text-or font-semibold">
                      {r.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Th({ label, k, sortKey, sortDir, onClick }) {
  const active = sortKey === k;
  return (
    <th
      className="py-2 px-2 cursor-pointer select-none"
      onClick={() => onClick(k)}
    >
      {label} {active && (sortDir === 'asc' ? '↑' : '↓')}
    </th>
  );
}

function PodiumStep({ player, place, height, medal, crown }) {
  return (
    <div className="flex flex-col items-center">
      {crown && <span className="text-2xl mb-1 animate-float">👑</span>}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display mb-2"
        style={{ backgroundColor: avatarColor(player.idJoueur) }}
      >
        {player.prenom?.[0]?.toUpperCase()}
      </div>
      <p className="text-sm text-craie">{player.prenom}</p>
      <p className="text-xs text-or font-mono-num mb-2">{player.total} pts</p>
      <div
        className={`w-20 ${height} rounded-t-lg flex items-start justify-center pt-2 ${
          place === 1 ? 'bg-or/30' : 'bg-marine border border-white/10'
        }`}
      >
        <span className="text-2xl">{medal}</span>
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