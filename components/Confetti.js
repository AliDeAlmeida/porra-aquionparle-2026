'use client';

const COLORS = ['#F5B62E', '#E63946', '#2D6CDF', '#2DBE6C', '#F7F4ED'];

export default function Confetti({ count = 30, intense = false }) {
  const pieces = Array.from({ length: count }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = (intense ? 3 : 6) + Math.random() * 4;
    const color = COLORS[i % COLORS.length];
    const size = 6 + Math.random() * 6;
    return (
      <span
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          backgroundColor: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          width: `${size}px`,
          height: `${size * 1.6}px`,
          opacity: intense ? 0.95 : 0.35,
        }}
      />
    );
  });

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {pieces}
    </div>
  );
}
