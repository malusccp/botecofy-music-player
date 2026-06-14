import { describe, it, expect, beforeEach, vi } from "vitest";
import { PlaybackService, MIN_PLAY_SECONDS } from "./PlaybackService.js";
import { RealtimeNotifier } from "./events/RealtimeNotifier.js";
import type { ITrackRepository, IPlayHistoryRepository } from "../repositories/interfaces.js";

describe("PlaybackService.registerPlay (RN06)", () => {
  let trackRepo: ITrackRepository;
  let history: IPlayHistoryRepository;
  let notifier: RealtimeNotifier;

  beforeEach(() => {
    trackRepo = {
      findById: vi.fn(async () => ({ _id: "t1", status: "active", playsCount: 5 }) as any),
      incrementCounter: vi.fn(async () => ({ playsCount: 6 }) as any),
      create: vi.fn(),
      deleteById: vi.fn(),
      update: vi.fn(),
      findActiveByArtistAndTitle: vi.fn(),
      setStatus: vi.fn(),
      search: vi.fn(),
    };
    history = { add: vi.fn(), listRecentByUser: vi.fn(async () => []) };
    notifier = new RealtimeNotifier();
  });

  it("NÃO conta play abaixo do mínimo, mas registra histórico", async () => {
    const service = new PlaybackService(trackRepo, history, notifier);
    const result = await service.registerPlay("u1", "t1", MIN_PLAY_SECONDS - 1);

    expect(result.counted).toBe(false);
    expect(history.add).toHaveBeenCalledWith("u1", "t1");
    expect(trackRepo.incrementCounter).not.toHaveBeenCalled();
  });

  it("conta play a partir do mínimo e emite evento", async () => {
    const events: unknown[] = [];
    notifier.subscribe((e) => events.push(e));
    const service = new PlaybackService(trackRepo, history, notifier);

    const result = await service.registerPlay("u1", "t1", MIN_PLAY_SECONDS);

    expect(result.counted).toBe(true);
    expect(result.playsCount).toBe(6);
    expect(events).toContainEqual({ type: "track:played", trackId: "t1", playsCount: 6 });
  });
});
