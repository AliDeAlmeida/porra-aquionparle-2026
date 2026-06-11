'use client';

export default function Error({ error, reset }) {
  return (
    <div className="page-content min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-4">🟨</div>
      <h1 className="font-display text-3xl md:text-4xl text-craie mb-3">PROLONGATIONS TECHNIQUES</h1>
      <p className="text-tribune mb-8 max-w-md">
        Une erreur inattendue s&apos;est produite. Réessayez, ou revenez plus tard.
      </p>
      <button
        onClick={() => reset()}
        className="bg-or text-nuit font-display px-6 py-3 rounded-xl hover:scale-105 transition-transform"
      >
        🔄 Réessayer
      </button>
    </div>
  );
}
