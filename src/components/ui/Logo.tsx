export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 22 C12 16 12 12 12 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 8 C12 4 15 2 20 2 C20 7 17 9.5 12 8 Z"
        fill="currentColor"
      />
      <path
        d="M12 14 C12 10 9 8 4 8 C4 13 7 15.5 12 14 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({
  size = 36,
  dark = false,
  className = "",
}: {
  size?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span
        className="rounded-lg bg-deep-forest flex items-center justify-center shadow-premium shrink-0"
        style={{ width: size, height: size }}
      >
        <LogoMark className="w-3/5 h-3/5 text-electric-emerald" />
      </span>
      <span
        className={`font-bold tracking-tight ${
          dark ? "text-white" : "text-deep-forest"
        }`}
        style={{ fontSize: size * 0.6, lineHeight: 1 }}
      >
        SINTROPIA
      </span>
    </span>
  );
}
