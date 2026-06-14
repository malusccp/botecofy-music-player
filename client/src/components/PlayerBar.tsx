import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";
import { getSocket } from "../lib/socket";
import { registerPlay } from "../lib/queries";
import { RhythmBadge } from "./RhythmBadge";

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const countedRef = useRef<Set<string>>(new Set());

  const { status, volume } = usePlayerStore((s) => ({ status: s.status, volume: s.volume }));
  const current = usePlayerStore((s) => s.queue[s.index] ?? null);
  const { togglePlay, next, prev, setStatus, setVolume, updateTrackCounters } = usePlayerStore();

  // Atualizações em tempo real (Observer → Socket.io → UI).
  useEffect(() => {
    const socket = getSocket();
    const onLiked = (e: { trackId: string; likesCount: number }) => {
      updateTrackCounters(e.trackId, { likesCount: e.likesCount });
      patchCounter("likes", e.trackId, e.likesCount);
    };
    const onPlayed = (e: { trackId: string; playsCount: number }) => {
      updateTrackCounters(e.trackId, { playsCount: e.playsCount });
      patchCounter("plays", e.trackId, e.playsCount);
    };
    socket.on("track:liked", onLiked);
    socket.on("track:played", onPlayed);
    return () => {
      socket.off("track:liked", onLiked);
      socket.off("track:played", onPlayed);
    };
  }, [updateTrackCounters]);

  // Carrega a faixa atual quando ela muda.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    audio.src = current.audioUrl;
    audio.load();
    audio.play().then(() => setStatus("playing")).catch(() => setStatus("paused"));
  }, [current?.id]);

  // Reflete play/pause da máquina de estados no elemento de áudio.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (status === "playing") audio.play().catch(() => setStatus("paused"));
    if (status === "paused") audio.pause();
  }, [status]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    // RN06: conta o play após 20s, uma vez por faixa.
    if (audio.currentTime >= 20 && !countedRef.current.has(current.id)) {
      countedRef.current.add(current.id);
      registerPlay(current.id, Math.floor(audio.currentTime)).catch(() => {});
    }
  };

  if (!current) {
    return (
      <footer className="fixed bottom-0 inset-x-0 border-t border-white/5 bg-boteco-surface/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-boteco-cream/50">
          Nada tocando — escolha uma faixa para puxar o som. 🎶
        </div>
      </footer>
    );
  }

  return (
    <footer className="fixed bottom-0 inset-x-0 border-t border-white/5 bg-boteco-surface/95 backdrop-blur z-20">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={next}
        onPlay={() => setStatus("playing")}
        onPause={() => status === "playing" && setStatus("paused")}
      />
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{current.title}</p>
          <div className="flex items-center gap-2 text-sm text-boteco-cream/60">
            <span className="truncate">{current.artist}</span>
            <RhythmBadge rhythm={current.rhythm} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={prev} title="Anterior">
            ⏮
          </button>
          <button className="btn-primary w-12" onClick={togglePlay}>
            {status === "playing" ? "⏸" : "▶"}
          </button>
          <button className="btn-ghost" onClick={next} title="Próxima">
            ⏭
          </button>
        </div>

        <label className="hidden sm:flex items-center gap-2 text-xs text-boteco-cream/60">
          🔊
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
      </div>
    </footer>
  );
}

/** Atualiza, ao vivo, os contadores exibidos nos cards visíveis. */
function patchCounter(kind: "likes" | "plays", trackId: string, value: number) {
  document.querySelectorAll(`[data-${kind}="${trackId}"]`).forEach((el) => {
    el.textContent = kind === "plays" ? `▶ ${value}` : String(value);
  });
}
