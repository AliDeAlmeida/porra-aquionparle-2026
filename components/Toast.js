'use client';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const styles = {
    success: 'bg-vert/20 border-vert text-craie',
    error: 'bg-espagne/20 border-espagne text-craie',
    info: 'bg-france/20 border-france text-craie',
  };

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border ${styles[type]} text-sm shadow-lg animate-slide-up max-w-[90vw] text-center`}
      role="status"
      onClick={onClose}
    >
      {message}
    </div>
  );
}
