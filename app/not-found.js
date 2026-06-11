import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-content min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-4">🔴</div>
      <h1 className="font-display text-3xl md:text-4xl text-craie mb-3">CARTON ROUGE !</h1>
      <p className="text-tribune mb-8 max-w-md">
        Cette page n&apos;existe pas, ou a été expulsée du terrain (erreur 404).
      </p>
      <Link
        href="/tableau-de-bord"
        className="bg-or text-nuit font-display px-6 py-3 rounded-xl hover:scale-105 transition-transform"
      >
        ⚽ Retour au tableau de bord
      </Link>
    </div>
  );
}
