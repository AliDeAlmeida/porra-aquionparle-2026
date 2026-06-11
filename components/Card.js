export default function Card({ title, icon, action, children, className = '' }) {
  return (
    <div
      className={`bg-marine border border-white/10 rounded-2xl p-5 animate-slide-up ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h3 className="font-display text-sm md:text-base text-craie">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
