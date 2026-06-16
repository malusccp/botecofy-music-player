import { RHYTHM_LABEL, type Rhythm } from "../types";

// Cada ritmo é uma "ficha de bar" com uma das cores da logo do Botecofy
// (saturadas o suficiente para brilharem sobre o porta-copos escuro).
const COLORS: Record<Rhythm, string> = {
  pagode: "bg-boteco-green/25 text-boteco-green-light border-boteco-green-light/50",
  sertanejo: "bg-boteco-yellow/25 text-boteco-yellow border-boteco-yellow/50",
  arrocha: "bg-boteco-red/25 text-boteco-red-light border-boteco-red-light/50",
  brega: "bg-boteco-blue/30 text-boteco-blue-light border-boteco-blue-light/50",
};

export function RhythmBadge({ rhythm }: { rhythm: Rhythm }) {
  return (
    <span
      className={`chip shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ${COLORS[rhythm]}`}
    >
      {RHYTHM_LABEL[rhythm]}
    </span>
  );
}
