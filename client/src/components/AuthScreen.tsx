import { useEffect, useRef, useState } from "react";
import { SignIn } from "@clerk/clerk-react";

/* ------------------------------------------------------------------ *
 * Ícones coloridos da identidade Botecofy (versão festiva, foreground).
 * Flutuam de leve e reagem ao mouse para dar vida à mesa de boteco.
 * ------------------------------------------------------------------ */

function GlassIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden>
      <path
        d="M16 26 H48 L43 70 Q43 74 39 74 H25 Q21 74 21 70 Z"
        fill="#FFCB2E"
        stroke="#7A4A00"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M26 28 L24 72 M38 28 L39 72" stroke="#D99400" strokeWidth="1.6" opacity="0.7" />
      <path
        d="M12 26 Q10 10 22 12 Q24 2 33 5 Q44 1 46 13 Q56 13 52 26 Z"
        fill="#FFFDF5"
        stroke="#D9C9A0"
        strokeWidth="2"
        strokeLinejoin="round"
        className="animate-foam"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      <g fill="#0B8A3D">
        <ellipse cx="24" cy="16" rx="3" ry="2.4" transform="rotate(-18 24 16)" />
        <rect x="26.5" y="7" width="1.8" height="9" rx="0.9" />
        <path d="M28 7 q5 1 4 5 q-2-3-4-2.4 z" />
      </g>
    </svg>
  );
}

function TambourineIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="28" fill="#0B8A3D" stroke="#0A5E2C" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="18" fill="#FFFDF5" stroke="#0A5E2C" strokeWidth="2" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={32 + 28 * Math.cos(r)}
            cy={32 + 28 * Math.sin(r)}
            r="4"
            fill="#FFC400"
            stroke="#7A4A00"
            strokeWidth="1.4"
          />
        );
      })}
    </svg>
  );
}

function SkewerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <g transform="rotate(-38 40 40)">
        <line x1="8" y1="40" x2="72" y2="40" stroke="#B98A4B" strokeWidth="3" strokeLinecap="round" />
        {[20, 38, 56].map((x, i) => (
          <rect
            key={x}
            x={x}
            y="28"
            width="16"
            height="24"
            rx="4"
            fill={i === 1 ? "#9B2B1B" : "#DA2D1F"}
            stroke="#5C1810"
            strokeWidth="1.8"
          />
        ))}
      </g>
    </svg>
  );
}

function FlipFlopIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 72" className={className} aria-hidden>
      <path
        d="M24 4 Q44 4 44 30 Q44 64 24 68 Q4 64 4 34 Q4 4 24 4 Z"
        fill="#1E40AF"
        stroke="#16276E"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M24 12 L13 34 M24 12 L35 34" stroke="#FFC400" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BottleCapIcon({ className = "" }: { className?: string }) {
  const pts: string[] = [];
  const teeth = 11;
  for (let i = 0; i < teeth * 2; i++) {
    const ang = (Math.PI * i) / teeth;
    const rad = i % 2 === 0 ? 30 : 25;
    pts.push(`${32 + rad * Math.cos(ang)},${32 + rad * Math.sin(ang)}`);
  }
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <polygon points={pts.join(" ")} fill="#DA2D1F" stroke="#5C1810" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="17" fill="#FFFDF5" />
      <circle cx="32" cy="32" r="9" fill="#0B8A3D" />
    </svg>
  );
}

/* Posições, escalas e atraso das peças flutuantes ao redor dos cards. */
const FLOATERS = [
  { Comp: TambourineIcon, top: "8%", left: "6%", size: 78, rot: -12, depth: 26, delay: "0s" },
  { Comp: GlassIcon, top: "20%", right: "7%", size: 70, rot: 10, depth: 34, delay: "0.6s" },
  { Comp: SkewerIcon, bottom: "16%", left: "9%", size: 86, rot: 6, depth: 30, delay: "1.1s" },
  { Comp: FlipFlopIcon, bottom: "10%", right: "10%", size: 64, rot: -8, depth: 22, delay: "0.3s" },
  { Comp: BottleCapIcon, top: "52%", left: "3%", size: 54, rot: 0, depth: 40, delay: "1.5s" },
  { Comp: BottleCapIcon, top: "40%", right: "4%", size: 46, rot: 0, depth: 44, delay: "0.9s" },
] as const;

export function AuthScreen() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduceMotion.current) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden boteco-festive-bg">
      {/* textura de ícones repetidos */}
      <div className="boteco-pattern pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      {/* marca d'água da logo circular no centro */}
      <img
        src="/boteco-stamp.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 w-[min(78vw,640px)] -translate-x-1/2 -translate-y-1/2 opacity-25"
      />

      {/* ícones festivos flutuantes (com leve parallax pelo mouse) */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
        {FLOATERS.map(({ Comp, depth, rot, delay, size, ...pos }, i) => (
          <div
            key={i}
            className="absolute animate-bob drop-shadow-[0_8px_10px_rgba(11,23,70,0.35)]"
            style={
              {
                ...(pos as Record<string, string>),
                width: size,
                animationDelay: delay,
                ["--rot" as string]: `${rot}deg`,
                transform: `translate(${parallax.x * depth}px, ${parallax.y * depth}px) rotate(${rot}deg)`,
                transition: "transform 0.25s ease-out",
              } as React.CSSProperties
            }
          >
            <Comp className="w-full h-auto" />
          </div>
        ))}
      </div>

      {/* conteúdo */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-8 px-4 py-6 lg:max-w-2xl">
        {/* logo completa no topo (sem recorte circular) */}
        <div className="relative">
          <img
            src="/logo.png"
            alt="Botecofy"
            className="h-48 w-48 rounded-full bg-white object-cover drop-shadow-[0_10px_20px_rgba(11,23,70,0.45)] sm:h-56 sm:w-56"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = "flex";
            }}
          />
          {/* fallback caso /logo.png ainda nao exista */}
          <div
            style={{ display: "none" }}
            className="h-48 w-48 items-center justify-center rounded-full border-4 border-boteco-yellow bg-boteco-parchment text-center font-brand text-4xl text-boteco-green-dark drop-shadow-[0_10px_20px_rgba(11,23,70,0.45)] sm:h-56 sm:w-56"
          >
            Boteco<span className="text-boteco-red">fy</span>
          </div>
        </div>

        {/* card hero "Puxa uma cadeira" */}
        <div className="boteco-paper-card w-full px-9 py-8 text-center">
          <h1 className="font-brand text-5xl font-bold text-boteco-green-dark sm:text-6xl">
            Puxa uma cadeira 🍻
          </h1>
          <p className="mt-4 text-lg text-boteco-brown sm:text-xl">
            Entre para ouvir a curadoria de brega, pagode, sertanejo e arrocha do Botecofy.
          </p>
        </div>

        {/* formulário do Clerk com a cara do boteco */}
        <SignIn
          routing="hash"
          appearance={{
            layout: { socialButtonsPlacement: "top", logoPlacement: "none" },
            variables: {
              colorPrimary: "#0B8A3D",
              colorText: "#5B3A21",
              colorTextSecondary: "#7A5230",
              colorTextOnPrimaryBackground: "#FFFDF5",
              colorBackground: "#F4E8CC",
              colorInputBackground: "#FBF3DE",
              colorInputText: "#5B3A21",
              colorNeutral: "#5B3A21",
              fontFamily: '"Nunito", system-ui, sans-serif',
              fontFamilyButtons: '"Nunito", system-ui, sans-serif',
              borderRadius: "0.85rem",
            },
            elements: {
              rootBox: "w-full",
              cardBox: "w-full !shadow-none",
              card: "boteco-paper-card !bg-boteco-parchment w-full",
              headerTitle: "!font-brand !text-2xl !font-bold !text-boteco-green-dark",
              headerSubtitle: "!text-boteco-brown-soft",
              socialButtonsBlockButton:
                "!bg-boteco-parchment-soft !border !border-boteco-brown/25 hover:!bg-[#F6E8C2] !rounded-xl !py-2.5",
              socialButtonsBlockButtonText: "!font-semibold !text-boteco-brown",
              dividerLine: "!bg-boteco-brown/20",
              dividerText: "!text-boteco-brown-soft",
              formFieldLabel: "!font-semibold !text-boteco-brown",
              formFieldInput:
                "!bg-boteco-parchment-soft !border-boteco-brown/25 !text-boteco-brown placeholder:!text-boteco-brown/40 focus:!border-boteco-green",
              formButtonPrimary:
                "!bg-boteco-green hover:!bg-boteco-green-dark !text-white !font-bold !normal-case !rounded-xl !py-2.5 !text-[0.95rem] !shadow-[0_5px_0_-1px_rgba(10,94,44,0.55)]",
              footer: "!bg-transparent",
              footerActionText: "!text-boteco-brown-soft",
              footerActionLink: "!font-bold !text-boteco-green hover:!text-boteco-green-dark",
              identityPreviewText: "!text-boteco-brown",
              identityPreviewEditButtonIcon: "!text-boteco-green",
              badge: "!bg-boteco-parchment-soft !text-boteco-brown-soft !border !border-boteco-brown/20",
              footerActionLink__signUp: "!text-boteco-green",
            },
          }}
        />
      </div>
    </div>
  );
}
