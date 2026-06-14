import { RHYTHM_LABEL, type Rhythm } from "../types";

const COLORS: Record<Rhythm, string> = {
  pagode: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  arrocha: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  brega: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  sertanejo: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export function RhythmBadge({ rhythm }: { rhythm: Rhythm }) {
  return <span className={`chip ${COLORS[rhythm]}`}>{RHYTHM_LABEL[rhythm]}</span>;
}
