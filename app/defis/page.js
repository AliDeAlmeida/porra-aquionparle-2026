'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/useSession';
import Toast from '../../components/Toast';

export default function DefisPage() {
  const router = useRouter();
  const session = useSession();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [participated, setParticipated] = useState({});

  useEffect(() => {
    if (session === false) router.replace('/rejoindre');
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/challenges?idJoueur=${session.idJoueur}`)
      .then((r) => r.json())
      .then((d) => setChallenges(d.challenges || []))
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

  const actifs = challenges.filter((c) => c.statut === 'En cours');
  const aVenir = challenges.filter((c) => c.statut === 'A venir');
  const termines = challenges.filter((c) => c.statut === 'Termine');

  function handleParticipate(idDefi) {
    setParticipated((p) => ({ ...p, [idDefi]: true }));
    setToast(
      'Merci pour ta participation ! Les points seront attribues par les organisatrices.'
    );
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-display text-xl md:text-2xl text-craie text-center mb-2">
        🎙 Defis linguistiques
      </h1>
      <p className="text-center text-craie/70 text-sm mb-8">
        Pratique l&apos;espagnol ou le francais et gagne des points bonus !
      </p>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}

      {loading ? (
        <div className="text-center text-craie/60 py-20">Chargement...</div>
      ) : challenges.length === 0 ? (
        <p className="text-center text-craie/60">
          Aucun defi pour le moment. Reviens bientot !
        </p>
      ) : (
        <div className="space-y-8">
          {actifs.length > 0 && (
            <Section title="🔥 Defi actif">
              {actifs.map((c) => (
                <ChallengeCard
                  key={c.idDefi}
                  challenge={c}
                  participated={participated[c.idDefi]}
                  onParticipate={() => handleParticipate(c.idDefi)}
                />
              ))}
            </Section>
          )}

          {aVenir.length > 0 && (
            <Section title="⏳ A venir">
              {aVenir.map((c) => (
                <ChallengeCard key={c.idDefi} challenge={c} upcoming />
              ))}
            </Section>
          )}

          {termines.length > 0 && (
            <Section title="✅ Termines">
              {termines.map((c) => (
                <ChallengeCard key={c.idDefi} challenge={c} done />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-display text-sm text-or mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ChallengeCard({ challenge, participated, onParticipate, upcoming, done }) {
  const langColor = challenge.langue?.toLowerCase().includes('espagn')
    ? 'border-espagne'
    : 'border-france';

  return (
    <div className={`bg-marine border-l-4 ${langColor} border-y border-r border-white/10 rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-sm text-craie">{challenge.nom}</h3>
        <span className="text-xs text-tribune">{challenge.langue}</span>
      </div>
      <p className="text-sm text-craie/80 mb-2">{challenge.description}</p>
      <p className="text-xs text-tribune mb-3">
        🏆 Jusqu&apos;a +{challenge.pointsMax} points
        {challenge.dateFin && ` · 📅 Date limite : ${formatDate(challenge.dateFin)}`}
      </p>

      {done && challenge.monBonus ? (
        <div className="bg-vert/10 text-vert text-sm rounded-lg px-3 py-2">
          🎉 Tu as obtenu +{challenge.monBonus.points} points
          {challenge.monBonus.commentaire && ` — ${challenge.monBonus.commentaire}`}
        </div>
      ) : done ? (
        <p className="text-craie/50 text-sm">
          Ce defi est termine. Aucun bonus enregistre pour toi.
        </p>
      ) : upcoming ? (
        <p className="text-craie/50 text-sm">Ce defi n&apos;a pas encore commence.</p>
      ) : participated ? (
        <div className="bg-vert/10 text-vert text-sm rounded-lg px-3 py-2">
          ✅ Participation enregistree. Merci !
        </div>
      ) : (
        <button
          onClick={onParticipate}
          className="bg-or text-nuit font-display text-xs px-4 py-2 rounded-lg"
        >
          J&apos;ai participe !
        </button>
      )}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
}