import { describe, it, expect, beforeEach, vi } from "vitest";
import { LikeService } from "./LikeService.js";
import { RealtimeNotifier } from "./events/RealtimeNotifier.js";
import type { ILikeRepository, ITrackRepository } from "../repositories/interfaces.js";

describe("LikeService.toggle (RN07 + Observer)", () => {
  let likeRepo: ILikeRepository;
  let trackRepo: ITrackRepository;
  let notifier: RealtimeNotifier;

  beforeEach(() => {
    likeRepo = {
      find: vi.fn(async () => null),
      create: vi.fn(),
      remove: vi.fn(async () => true),
      listTrackIdsByUser: vi.fn(async () => []),
    };
    trackRepo = {
      findById: vi.fn(async () => ({ _id: "t1", status: "active", likesCount: 0 }) as any),
      incrementCounter: vi.fn(async (_id, _f, delta) => ({ likesCount: Math.max(0, 0 + delta) }) as any),
      create: vi.fn(),
      deleteById: vi.fn(),
      update: vi.fn(),
      findActiveByArtistAndTitle: vi.fn(),
      setStatus: vi.fn(),
      search: vi.fn(),
    };
    notifier = new RealtimeNotifier();
  });

  it("curte quando ainda não curtiu e emite evento de tempo real", async () => {
    const events: unknown[] = [];
    notifier.subscribe((e) => events.push(e));
    const service = new LikeService(likeRepo, trackRepo, notifier);

    const result = await service.toggle("u1", "t1");

    expect(result.liked).toBe(true);
    expect(likeRepo.create).toHaveBeenCalledWith("u1", "t1");
    expect(events).toContainEqual({ type: "track:liked", trackId: "t1", likesCount: 1 });
  });

  it("descurte quando já existe curtida (toggle idempotente)", async () => {
    likeRepo.find = vi.fn(async () => ({ _id: "l1" }) as any);
    const service = new LikeService(likeRepo, trackRepo, notifier);

    const result = await service.toggle("u1", "t1");

    expect(result.liked).toBe(false);
    expect(likeRepo.remove).toHaveBeenCalledWith("u1", "t1");
  });
});
