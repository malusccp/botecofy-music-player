import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../store/playerStore";
import { getSocket } from "../lib/socket";
import { registerPlay, toggleLike } from "../lib/queries";
import { RhythmBadge } from "./RhythmBadge";
import {
  HeartIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  ShuffleIcon,
  VolumeIcon,
} from "./icons";

function fmt(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Copo americano que enche de cerveja quando há música tocando. */
function PlayerGlass({ filled }: { filled: boolean }) {
  const glass = "M11 16 H37 L33.5 52 Q33.5 55 30.5 55 H17.5 Q14.5 55 14.5 52 Z";
  return (
    <svg viewBox="0 0 48 60" className="h-14 w-14" aria-hidden>
      <defs>
        <clipPath id="pg-glass">
          <path d={glass} />
        </clipPath>
      </defs>
      {/* cerveja (sobe quando toca) */}
      <rect
        className="beer-rise"
        x="11"
        y={filled ? 22 : 55}
        width="26"
        height={filled ? 33 : 0}
        fill="#FFC400"
        clipPath="url(#pg-glass)"
      />
      {/* copo */}
      <path d={glass} fill="none" stroke="#F6EEDC" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 17 L17.5 54 M29 17 L30.5 54" stroke="#F6EEDC" strokeWidth="0.8" opacity="0.4" />
      {/* espuma com notas quando cheio */}
      {filled && (
        <path
          className="animate-foam"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          d="M9 16 Q8 6 17 8 Q19 1 25 4 Q34 1 35 10 Q43 10 39 16 Z"
          fill="#FFFDF5"
          stroke="#D9C9A0"
          strokeWidth="1"
        />
      )}
    </svg>
  );
}

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const countedRef = useRef<Set<string>>(new Set());

  // Seletores atômicos (um valor por chamada): seletores que devolvem um objeto
  // novo a cada render fazem o Zustand re-renderizar em loop ("Maximum update depth").
  const status = usePlayerStore((s) => s.status);
  const volume = usePlayerStore((s) => s.volume);
  const current = usePlayerStore((s) => s.queue[s.index] ?? null);
  const queue = usePlayerStore((s) => s.queue);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const updateTrackCounters = usePlayerStore((s) => s.updateTrackCounters);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

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
    setProgress(0);
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
    setProgress(audio.currentTime);
    // RN06: conta o play após 20s, uma vez por faixa.
    if (audio.currentTime >= 20 && !countedRef.current.has(current.id)) {
      countedRef.current.add(current.id);
      registerPlay(current.id, Math.floor(audio.currentTime)).catch(() => {});
    }
  };

  const onEnded = () => {
    const audio = audioRef.current;
    if (repeat && audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }
    if (shuffle && queue.length > 1) {
      const rand = Math.floor(Math.random() * queue.length);
      playQueue(queue, rand);
      return;
    }
    next();
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value;
      setProgress(value);
    }
  };

  const likeCurrent = async () => {
    if (!current) return;
    const res = await toggleLike(current.id).catch(() => null);
    if (res) updateTrackCounters(current.id, { liked: res.liked, likesCount: res.likesCount });
  };

  const isPlaying = status === "playing";

  return (
    <footer className="boteco-bar-top shrink-0 rounded-xl border-t border-boteco-yellow/15 bg-boteco-panel px-4 py-4 sm:px-6">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setStatus("playing")}
        onPause={() => status === "playing" && setStatus("paused")}
      />

      <div className="flex items-center gap-4">
        {/* faixa atual */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-boteco-blue-deep to-boteco-base ring-1 ring-white/10">
            {current?.coverUrl ? (
              <img src={current.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <PlayerGlass filled={!!current && isPlaying} />
            )}
          </div>
          <div className="min-w-0">
            {current ? (
              <>
                <p className="truncate text-lg font-semibold text-boteco-ink">{current.title}</p>
                <div className="flex items-center gap-2 text-base text-boteco-muted">
                  <span className="truncate">{current.artist}</span>
                  <RhythmBadge rhythm={current.rhythm} />
                </div>
              </>
            ) : (
              <p className="text-lg text-boteco-muted">Nada tocando — escolha uma faixa. 🎶</p>
            )}
          </div>
          {current && (
            <button
              onClick={likeCurrent}
              title="Curtir"
              className={`ml-1 hidden shrink-0 transition hover:scale-110 sm:block ${
                current.liked ? "text-boteco-red-light" : "text-boteco-muted hover:text-boteco-ink"
              }`}
            >
              <HeartIcon size={24} filled={current.liked} />
            </button>
          )}
        </div>

        {/* controles + progresso */}
        <div className="flex max-w-2xl flex-[1.5] flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShuffle((v) => !v)}
              title="Aleatório"
              className={`transition hover:scale-110 ${shuffle ? "text-boteco-green-light" : "text-boteco-muted hover:text-boteco-ink"}`}
            >
              <ShuffleIcon size={24} />
            </button>
            <button
              onClick={prev}
              title="Anterior"
              className="text-boteco-muted transition hover:scale-110 hover:text-boteco-ink"
            >
              <PrevIcon size={28} />
            </button>
            <button
              onClick={togglePlay}
              disabled={!current}
              title={isPlaying ? "Pausar" : "Tocar"}
              className="grid h-16 w-16 place-items-center rounded-full bg-boteco-yellow text-boteco-base
                shadow-md shadow-black/30 transition hover:scale-105 hover:bg-boteco-yellow-dark disabled:opacity-40"
            >
              {isPlaying ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
            </button>
            <button
              onClick={next}
              title="Próxima"
              className="text-boteco-muted transition hover:scale-110 hover:text-boteco-ink"
            >
              <NextIcon size={28} />
            </button>
            <button
              onClick={() => setRepeat((v) => !v)}
              title="Repetir"
              className={`transition hover:scale-110 ${repeat ? "text-boteco-green-light" : "text-boteco-muted hover:text-boteco-ink"}`}
            >
              <RepeatIcon size={24} />
            </button>
          </div>

          <div className="flex w-full items-center gap-3 text-sm text-boteco-muted">
            <span className="w-11 text-right tabular-nums">{fmt(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              disabled={!current}
              className="boteco-range h-1.5 flex-1"
              style={{ ["--pct" as string]: `${duration ? (progress / duration) * 100 : 0}%` }}
            />
            <span className="w-11 tabular-nums">{fmt(duration)}</span>
          </div>
        </div>

        {/* volume */}
        <div className="hidden flex-1 items-center justify-end gap-3 text-boteco-muted sm:flex">
          <VolumeIcon size={24} />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="boteco-range h-1.5 w-28 max-w-[45%]"
            style={{ ["--pct" as string]: `${volume * 100}%` }}
          />
        </div>
      </div>
    </footer>
  );
}

/** Atualiza, ao vivo, os contadores exibidos nos cards visíveis. */
function patchCounter(kind: "likes" | "plays", trackId: string, value: number) {
  document.querySelectorAll(`[data-${kind}="${trackId}"]`).forEach((el) => {
    // mantém apenas o número; o ícone é irmão no layout novo
    el.textContent = String(value);
  });
}
