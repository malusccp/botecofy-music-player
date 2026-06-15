import { RHYTHM_LABEL, type Rhythm } from "../types";

// Cada ritmo herda uma das quatro cores da logo do Botecofy.
const COLORS: Record<Rhythm, string> = {
  pagode: "bg-boteco-green/10 text-boteco-green-dark border-boteco-green/30",
  sertanejo: "bg-boteco-yellow/20 text-boteco-yellow-dark border-boteco-yellow/60",
  arrocha: "bg-boteco-red/10 text-boteco-red border-boteco-red/30",
  brega: "bg-boteco-blue/10 text-boteco-blue border-boteco-blue/30",
};

export function RhythmBadge({ rhythm }: { rhythm: Rhythm }) {
  return <span className={`chip ${COLORS[rhythm]}`}>{RHYTHM_LABEL[rhythm]}</span>;
}
