'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/useSession';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function HistoriquePage() {
  const router = useRouter();
  const session = useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session === false) router.replace('/rejoindre');
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/history?idJoueur=${session.idJoueur}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
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

  // Construire la courbe cumulative (chronologique croissant)
  const chronological = [...events]
    .filter((e) => e.points !== null && e.points !== undefined)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  let cumul = 0;
  const chartData = chronological.map((e, i) => {
    cumul += e.points;
    return {
      index: i + 1,
      points: cumul,
      label: formatShortDate(e.date),
    };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-display text-xl md:text-2xl text-craie text-center mb-6">
        📈 Mon historique
      </h1>

      {loading ? (
        <div className="text-center text-craie/60 py-20">Chargement...</div>
      ) : (
        <>
          {chartData.length > 1 && (
            <div className="bg-marine border border-white/10 rounded-2xl p-4 mb-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2C5C" />
                  <XAxis dataKey="label" stroke="#8E97B8" fontSize={10} />
                  <YAxis stroke="#8E97B8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      background: '#16204D',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#F5B62E"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {events.length === 0 ? (
            <p className="text-center text-craie/60">
              Ton historique apparaitra ici des que tu commenceras a
              pronostiquer.
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((e, i) => (
                <EventRow key={i} event={e} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventRow({ event }) {
  if (event.type === 'match') {
    return (
      <div className="bg-marine border border-white/10 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-craie">
            {event.equipeA} vs {event.equipeB}
          </p>
          <p className="text-xs text-tribune">
            Ton pronostic : {event.pronostic}
            {event.resultat && ` · Resultat : ${event.resultat}`}
          </p>
          <p className="text-xs text-tribune">{formatDate(event.date)}</p>
        </div>
        {event.points !== null ? (
          <span
            className={`text-sm font-mono-num px-3 py-1 rounded-full ${
              event.points === 5
                ? 'bg-or/20 text-or'
                : event.points === 3
                ? 'bg-vert/20 text-vert'
                : 'bg-white/5 text-craie/60'
            }`}
          >
            +{event.points}
          </span>
        ) : (
          <span className="text-xs text-tribune">en attente</span>
        )}
      </div>
    );
  }

  if (event.type === 'initial') {
    return (
      <div className="bg-marine border border-or/30 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-craie">🏆 Pronostics initiaux</p>
          <p className="text-xs text-tribune">{event.resume}</p>
          <p className="text-xs text-tribune">{formatDate(event.date)}</p>
        </div>
        {event.isFinal ? (
          <span className="text-sm font-mono-num bg-or/20 text-or px-3 py-1 rounded-full">
            +{event.points}
          </span>
        ) : (
          <span className="text-xs text-tribune">resultats a venir</span>
        )}
      </div>
    );
  }

  if (event.type === 'challenge') {
    return (
      <div className="bg-marine border border-vert/30 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-craie">🎙 {event.nom}</p>
          {event.commentaire && (
            <p className="text-xs text-tribune">{event.commentaire}</p>
          )}
          <p className="text-xs text-tribune">{formatDate(event.date)}</p>
        </div>
        <span className="text-sm font-mono-num bg-vert/20 text-vert px-3 py-1 rounded-full">
          +{event.points}
        </span>
      </div>
    );
  }

  return null;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
