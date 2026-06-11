'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from '../lib/useSession';

const LINKS = [
  { href: '/tableau-de-bord', label: 'Tableau de bord' },
  { href: '/calendrier', label: 'Calendrier' },
  { href: '/classement', label: 'Classement' },
  { href: '/defis', label: 'Defis' },
  { href: '/historique', label: 'Historique' },
];

export default function Header() {
  const pathname = usePathname();
  const session = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ballonOrOuvert, setBallonOrOuvert] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/ballondor?idJoueur=${session.idJoueur}`)
      .then((r) => r.json())
      .then((d) => setBallonOrOuvert(!!d.isOpen))
      .catch(() => {});
  }, [session]);

  // Ne pas afficher le header sur les pages d'accueil / identification
  if (pathname === '/' || pathname === '/rejoindre') return null;

  const links = [...LINKS];
  if (ballonOrOuvert) {
    links.push({ href: '/ballon-dor', label: "Ballon d'Or" });
  }

  return (
    <header className="sticky top-0 z-30 bg-nuit/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/tableau-de-bord" className="flex items-center gap-2">
          <span className="text-xl">⚽</span>
          <span className="font-display text-sm md:text-base text-or">
            La Porra Aquionparle
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                pathname === link.href
                  ? 'border-or text-or'
                  : 'border-transparent text-craie/80 hover:text-or'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session && (
            <span className="text-sm text-craie/70 ml-2">
              Bonjour {session.prenom} 👋
            </span>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-2xl text-craie"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-nuit border-l border-white/10 p-6 animate-slide-up flex flex-col gap-4">
            <div className="flex items-center justify-between mb-4">
              {session && (
                <span className="text-sm text-or font-medium">
                  {session.prenom} 👋
                </span>
              )}
              <button
                className="text-2xl text-craie"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-base font-medium py-2 ${
                  pathname === link.href ? 'text-or' : 'text-craie/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
