'use client';

import { useState } from 'react';
import Confetti from './Confetti';
import { EQUIPES_32 } from '../lib/schema';

const STEPS = [
  { key: 'champion', title: 'Qui sera CHAMPION DU MONDE ?', icon: '🏆', multi: false },
  { key: 'finaliste', title: 'Qui sera le FINALISTE ?', icon: '🥈', multi: false },
  { key: 'demis', title: 'Quels seront les 4 DEMI-FINALISTES ?', icon: '🏁', multi: true },
  { key: 'buteur', title: 'Qui sera le MEILLEUR BUTEUR ?', icon: '⚽', multi: false, freeText: true },
  { key: 'surprise', title: 'Quelle sera l\'EQUIPE SURPRISE ?', icon: '⭐', multi: false },
];

export default function InitialPrognosticsModal({ session, onComplete }) {
  const [step, setStep] = useState(0); // 0..4 = questions, 5 = recap, 6 = success
  const [answers, setAnswers] = useState({
    champion: '',
    finaliste: '',
    demis: [],
    buteur: '',
    surprise: '',
  });
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const current = STEPS[step];

  function selectTeam(code) {
    if (!current.multi) {
      setAnswers((a) => ({ ...a, [current.key]: code }));
      return;
    }
    setAnswers((a) => {
      const list = a.demis.includes(code)
        ? a.demis.filter((c) => c !== code)
        : a.demis.length < 4
        ? [...a.demis, code]
        : a.demis;
      return { ...a, demis: list };
    });
  }

  function canGoNext() {
    if (current.key === 'demis') return answers.demis.length === 4;
    if (current.freeText) return answers.buteur.trim().length > 0;
    return !!answers[current.key];
  }

  function handleNext() {
    if (!canGoNext()) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(STEPS.length); // recap
    }
  }

  function handlePrev() {
    if (step > 0) setStep(step - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/initial-prognostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idJoueur: session.idJoueur,
          prenom: session.prenom,
          champion: answers.champion,
          finaliste: answers.finaliste,
          demis: answers.demis,
          buteur: answers.buteur,
          surprise: answers.surprise,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ||
            'Une erreur est survenue. Tes reponses sont conservees, reessaie.'
        );
        setSubmitting(false);
        return;
      }
      setStep(STEPS.length + 1); // success
      setTimeout(() => {
        onComplete();
      }, 2500);
    } catch {
      setError(
        'Une erreur est survenue. Tes reponses sont conservees, reessaie.'
      );
      setSubmitting(false);
    }
  }

  function teamName(code) {
    const t = EQUIPES_32.find((e) => e.code === code);
    return t ? `${t.drapeau} ${t.nom}` : code;
  }

  const isRecap = step === STEPS.length;
  const isSuccess = step === STEPS.length + 1;

  return (
    <div className="fixed inset-0 z-50 bg-nuit/95 backdrop-blur flex items-center justify-center p-4">
      {isSuccess && <Confetti count={40} intense />}

      <div
        className={`relative max-w-2xl w-full bg-marine border border-white/10 rounded-2xl p-6 md:p-8 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {!isRecap && !isSuccess && (
          <>
            {/* Stepper */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i <= step ? 'bg-or' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-tribune mb-2 text-center">
              Etape {step + 1}/{STEPS.length}
            </p>

            <h2 className="font-display text-lg md:text-xl text-or text-center mb-6">
              {current.icon} {current.title}
            </h2>

            {current.freeText ? (
              <div>
                <input
                  type="text"
                  value={answers.buteur}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, buteur: e.target.value }))
                  }
                  placeholder="Ex : Kylian Mbappe"
                  className="w-full bg-nuit border border-white/10 rounded-lg px-4 py-3 text-craie focus:outline-none focus:ring-2 focus:ring-or"
                />
                <p className="text-tribune text-xs mt-2">
                  Le nom sera verifie par les organisatrices.
                </p>
              </div>
            ) : (
              <>
                {current.key === 'demis' && (
                  <p className="text-center text-sm text-craie/70 mb-3">
                    {answers.demis.length}/4 selectionnees
                  </p>
                )}
                {current.key === 'surprise' && (
                  <p className="text-center text-xs text-tribune mb-3">
                    Une equipe que tu ne crois pas favorite mais qui pourrait
                    surprendre tout le monde !
                  </p>
                )}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-72 overflow-y-auto p-1">
                  {EQUIPES_32.map((eq) => {
                    const selected = current.multi
                      ? answers.demis.includes(eq.code)
                      : answers[current.key] === eq.code;
                    return (
                      <button
                        key={eq.code}
                        onClick={() => selectTeam(eq.code)}
                        className={`flex flex-col items-center justify-center gap-1 rounded-lg border py-2 text-xs transition ${
                          selected
                            ? 'border-or bg-or/10 text-or'
                            : 'border-white/10 text-craie/80 hover:border-white/30'
                        }`}
                      >
                        <span className="text-xl">{eq.drapeau}</span>
                        {selected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className="text-sm text-craie/70 disabled:opacity-30 px-4 py-2"
              >
                ← Precedent
              </button>
              <button
                onClick={handleNext}
                disabled={current.key === 'demis' && !canGoNext()}
                className="bg-or text-nuit font-display text-sm px-6 py-3 rounded-xl disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          </>
        )}

        {isRecap && (
          <div>
            <h2 className="font-display text-lg md:text-xl text-or text-center mb-6">
              📋 Recapitulatif de tes pronostics
            </h2>
            <div className="space-y-2 text-sm text-craie/90 bg-nuit rounded-xl p-4">
              <p>🏆 Champion : {teamName(answers.champion)}</p>
              <p>🥈 Finaliste : {teamName(answers.finaliste)}</p>
              <p>
                🏁 Demi-finalistes :{' '}
                {answers.demis.map((d) => teamName(d)).join(', ')}
              </p>
              <p>⚽ Meilleur buteur : {answers.buteur}</p>
              <p>⭐ Equipe surprise : {teamName(answers.surprise)}</p>
            </div>

            <div className="mt-4 bg-or/10 border border-or/30 rounded-lg px-4 py-3 text-sm text-or">
              ⚠️ Attention : ces pronostics ne pourront plus etre modifies
              apres le debut de la competition.
            </div>

            {error && (
              <div className="mt-4 bg-espagne/20 border border-espagne text-craie text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep(STEPS.length - 1)}
                className="text-sm text-craie/70 px-4 py-2"
              >
                ← Modifier
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-or text-nuit font-display text-sm px-6 py-3 rounded-xl disabled:opacity-60"
              >
                {submitting
                  ? 'Enregistrement...'
                  : '✅ Valider mes pronostics initiaux'}
              </button>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="text-center py-8 animate-stamp">
            <p className="text-4xl mb-4">🎉</p>
            <h2 className="font-display text-xl text-or mb-3">
              Tes pronostics ont ete enregistres.
            </h2>
            <p className="text-craie/90 text-sm">
              Ils ne pourront plus etre modifies apres le debut de la
              competition.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
