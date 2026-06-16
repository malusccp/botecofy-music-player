/* Ícones coloridos da identidade Botecofy flutuando nos espaços vazios dos banners,
   para dar o clima festivo de boteco. Decorativos (pointer-events: none). */

function Glass({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 80" className={className} style={style} aria-hidden>
      <path d="M16 26 H48 L43 70 Q43 74 39 74 H25 Q21 74 21 70 Z" fill="#FFCB2E" stroke="#7A4A00" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M26 28 L24 72 M38 28 L39 72" stroke="#D99400" strokeWidth="1.6" opacity="0.7" />
      <path d="M12 26 Q10 10 22 12 Q24 2 33 5 Q44 1 46 13 Q56 13 52 26 Z" fill="#FFFDF5" stroke="#D9C9A0" strokeWidth="2" strokeLinejoin="round" />
      <g fill="#0B8A3D">
        <ellipse cx="24" cy="16" rx="3" ry="2.4" transform="rotate(-18 24 16)" />
        <rect x="26.5" y="7" width="1.8" height="9" rx="0.9" />
        <path d="M28 7 q5 1 4 5 q-2-3-4-2.4 z" />
      </g>
    </svg>
  );
}

function Tambourine({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      <circle cx="32" cy="32" r="28" fill="#0B8A3D" stroke="#0A5E2C" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="18" fill="#FFFDF5" stroke="#0A5E2C" strokeWidth="2" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <circle key={deg} cx={32 + 28 * Math.cos(r)} cy={32 + 28 * Math.sin(r)} r="4" fill="#FFC400" stroke="#7A4A00" strokeWidth="1.4" />
        );
      })}
    </svg>
  );
}

function BottleCap({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  const pts: string[] = [];
  const teeth = 11;
  for (let i = 0; i < teeth * 2; i++) {
    const ang = (Math.PI * i) / teeth;
    const rad = i % 2 === 0 ? 30 : 25;
    pts.push(`${32 + rad * Math.cos(ang)},${32 + rad * Math.sin(ang)}`);
  }
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      <polygon points={pts.join(" ")} fill="#DA2D1F" stroke="#5C1810" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="17" fill="#FFFDF5" />
      <circle cx="32" cy="32" r="9" fill="#0B8A3D" />
    </svg>
  );
}

/** Camada decorativa de ícones flutuantes para o canto direito dos banners. */
export function HeroMotifs() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 hidden items-center gap-6 md:flex lg:right-10 lg:gap-10">
      <Tambourine className="h-16 w-16 animate-bob drop-shadow-[0_8px_10px_rgba(11,23,70,0.35)] lg:h-24 lg:w-24" />
      <Glass className="h-20 w-20 animate-bob drop-shadow-[0_8px_10px_rgba(11,23,70,0.35)] lg:h-28 lg:w-28" style={{ animationDelay: "0.7s" } as React.CSSProperties} />
      <BottleCap className="h-12 w-12 animate-bob drop-shadow-[0_8px_10px_rgba(11,23,70,0.35)] lg:h-16 lg:w-16" />
    </div>
  );
}
