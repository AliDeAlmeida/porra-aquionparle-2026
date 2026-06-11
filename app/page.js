'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Confetti from '../components/Confetti';
import { useSession } from '../lib/useSession';

export default function HomePage() {
  const router = useRouter();
  const session = useSession();

  // Si l'utilisateur a deja un profil sur cet appareil, on l'emmene
  // directement vers son tableau de bord.
  useEffect(() => {
    if (session) {
      router.replace('/tableau-de-bord');
    }
  }, [session, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Confetti count={20} />

      {/* Fond degrade stade */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, #1F2C5C 0%, #0B1437 60%, #060B1F 100%)',
        }}
      />

      <div className="relative z-10 max-w-2xl w-full px-6 py-12 text-center">
        <h1 className="font-display text-3xl md:text-5xl text-or animate-stamp leading-tight">
          ⚽ La Porra Aquionparle 2026
        </h1>
        <p
          className="mt-4 text-base md:text-lg text-craie/90 animate-slide-up"
          style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}
        >
          Le grand defi franco-hispanophone de la Coupe du Monde.
        </p>

        <div
          className="mt-8 bg-marine/80 backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8 animate-slide-up"
          style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
        >
          <p className="text-craie/90 leading-relaxed">
            Bienvenue dans l&apos;aventure ! Pronostique les matchs, participe
            aux defis linguistiques et tente de remporter le maillot officiel
            AQUIONPARLE 2026.
          </p>
        </div>

        <button
          onClick={() => router.push('/rejoindre')}
          className="mt-8 inline-block bg-or text-nuit font-display text-sm md:text-base px-8 py-4 rounded-xl shadow-lg animate-pulse-gold hover:-translate-y-0.5 transition-transform"
        >
          🚀 Commencer
        </button>

        <div className="mt-10 flex items-center justify-center gap-6 text-3xl">
          <span className="animate-float">🇪🇸</span>
          <span className="text-craie/40">↔</span>
          <span className="animate-float" style={{ animationDelay: '1s' }}>
            🇫🇷
          </span>
        </div>
      </div>
    </div>
  );
}
