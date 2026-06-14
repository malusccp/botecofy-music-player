import { create } from "zustand";
import type { Track } from "../types";

/**
 * Máquina de estados do player (padrão State aplicado no front-end).
 *   idle → loading → playing ⇄ paused → ended
 * Mantém a fila e o índice atual. O elemento <audio> é controlado pelo
 * PlayerBar, que reage a este estado.
 */
export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "ended";

interface PlayerState {
  status: PlayerStatus;
  queue: Track[];
  index: number;
  volume: number;
  current: () => Track | null;

  playQueue: (tracks: Track[], startIndex?: number) => void;
  enqueue: (track: Track) => void;
  togglePlay: () => void;
  setStatus: (status: PlayerStatus) => void;
  next: () => void;
  prev: () => void;
  setVolume: (v: number) => void;
  updateTrackCounters: (id: string, patch: Partial<Pick<Track, "likesCount" | "playsCount" | "liked">>) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  status: "idle",
  queue: [],
  index: 0,
  volume: 0.8,

  current: () => {
    const { queue, index } = get();
    return queue[index] ?? null;
  },

  playQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) return;
    set({ queue: tracks, index: startIndex, status: "loading" });
  },

  enqueue: (track) =>
    set((s) => {
      const queue = [...s.queue, track];
      // Se estava ocioso, começa a tocar o que foi enfileirado.
      return s.status === "idle" || s.queue.length === 0
        ? { queue, index: queue.length - 1, status: "loading" }
        : { queue };
    }),

  togglePlay: () =>
    set((s) => {
      if (s.queue.length === 0) return s;
      if (s.status === "playing") return { status: "paused" };
      return { status: "playing" };
    }),

  setStatus: (status) => set({ status }),

  next: () =>
    set((s) => {
      if (s.index < s.queue.length - 1) return { index: s.index + 1, status: "loading" };
      return { status: "ended" };
    }),

  prev: () =>
    set((s) => {
      if (s.index > 0) return { index: s.index - 1, status: "loading" };
      return s;
    }),

  setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)) }),

  updateTrackCounters: (id, patch) =>
    set((s) => ({
      queue: s.queue.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
}));
