import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'La Porra Aquionparle 2026',
  description:
    'Le grand defi de pronostics d\'Aquionparle pour la Coupe du Monde 2026.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <div className="gold-halo" />
        <Header />
        <main className="page-content min-h-screen">{children}</main>
      </body>
    </html>
  );
}
