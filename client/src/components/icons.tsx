/* Ícones de interface (formato estilo app de música) desenhados com currentColor,
   para herdarem as cores da identidade Botecofy onde forem usados. */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    ...props,
  } as SVGProps<SVGSVGElement>;
}

export function PlayIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor">
      <path d="M7 5.5v13c0 .9 1 1.46 1.77.98l10.3-6.5a1.15 1.15 0 0 0 0-1.96L8.77 4.52A1.15 1.15 0 0 0 7 5.5Z" />
    </svg>
  );
}

export function PauseIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function NextIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor">
      <path d="M5 5.5v13c0 .85.94 1.36 1.65.9L16 13.2V18a1 1 0 0 0 2 0V6a1 1 0 0 0-2 0v4.8L6.65 4.6C5.94 4.14 5 4.65 5 5.5Z" />
    </svg>
  );
}

export function PrevIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor">
      <path d="M19 5.5v13c0 .85-.94 1.36-1.65.9L8 13.2V18a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v4.8l9.35-6.2c.71-.46 1.65.05 1.65.9Z" />
    </svg>
  );
}

export function ShuffleIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h4v4M4 20l16-16M16 20h4v-4M4 4l5 5M14.5 13.5 20 19" />
    </svg>
  );
}

export function RepeatIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function HeartIcon({ filled, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(p)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 20.5 4.2 12.6a4.7 4.7 0 0 1 0-6.6 4.6 4.6 0 0 1 6.5 0l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 0 4.7 4.7 0 0 1 0 6.6Z" />
    </svg>
  );
}

export function HomeIcon({ filled, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(p)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function PlaylistIcon({ filled, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(p)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h11M4 11h11M4 16h7" />
      <circle cx="17" cy="16" r="3" fill={filled ? "currentColor" : "none"} />
      <path d="M20 16V8l-3 1" />
    </svg>
  );
}

export function UserIcon({ filled, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(p)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function UploadIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4m0 0L7 9m5-5 5 5" />
      <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
    </svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function VolumeIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor">
      <path d="M11 5 6.5 8.5H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h3.5L11 19a1 1 0 0 0 1.6-.8V5.8A1 1 0 0 0 11 5Z" />
      <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17.8 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function MusicIcon(p: IconProps) {
  return (
    <svg {...base(p)} fill="currentColor">
      <path d="M9 17.5a2.5 2.5 0 1 1-2.5-2.5c.5 0 .97.15 1.35.4V6l9-2v8.5a2.5 2.5 0 1 1-2.5-2.5c.5 0 .97.15 1.35.4V5.3l-5.7 1.27v9.9c.32.3.5.65.5 1.03Z" />
    </svg>
  );
}
