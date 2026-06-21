import { describe, it, expect, beforeEach, vi } from "vitest";
import { TrackService } from "./TrackService.js";
import { UploadedTrackFactory } from "./TrackFactory.js";
import { ConflictError, ValidationError } from "../errors/AppError.js";
import type { ITrackRepository, ILikeRepository } from "../repositories/interfaces.js";

// Repositórios falsos (testam o SERVIÇO isolado de Mongo — graças ao Repository/DIP).
function makeTrackRepo(overrides: Partial<ITrackRepository> = {}): ITrackRepository {
  return {
    findById: vi.fn(),
    create: vi.fn(async (data) => ({ _id: "t1", ...data }) as any),
    deleteById: vi.fn(),
    update: vi.fn(),
    findActiveByArtistAndTitle: vi.fn(async () => null),
    incrementCounter: vi.fn(),
    setStatus: vi.fn(),
    search: vi.fn(async () => ({ items: [], total: 0 })),
    findTopByArtist: vi.fn(async () => []),
    ...overrides,
  };
}

const likeRepo: ILikeRepository = {
  find: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
  listTrackIdsByUser: vi.fn(async () => []),
};

describe("TrackService.create", () => {
  const factory = new UploadedTrackFactory("/uploads/audio/x.mp3");
  const base = { title: "Saideira", artist: "Zé", rhythm: "pagode" as const, uploadedBy: "u1" };

  beforeEach(() => vi.clearAllMocks());

  it("RN01: rejeita ritmo inválido", async () => {
    const service = new TrackService(makeTrackRepo(), likeRepo);
    await expect(
      service.create(factory, { ...base, rhythm: "funk" as any })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("exige título e artista", async () => {
    const service = new TrackService(makeTrackRepo(), likeRepo);
    await expect(service.create(factory, { ...base, title: " " })).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it("RN02: rejeita título duplicado por artista entre faixas ativas", async () => {
    const repo = makeTrackRepo({ findActiveByArtistAndTitle: vi.fn(async () => ({ _id: "dup" }) as any) });
    const service = new TrackService(repo, likeRepo);
    await expect(service.create(factory, base)).rejects.toBeInstanceOf(ConflictError);
  });

  it("cria a faixa com status ativo quando válida", async () => {
    const repo = makeTrackRepo();
    const service = new TrackService(repo, likeRepo);
    await service.create(factory, base);
    expect(repo.create).toHaveBeenCalledOnce();
    const arg = (repo.create as any).mock.calls[0][0];
    expect(arg.status).toBe("active");
    expect(arg.audioUrl).toBe("/uploads/audio/x.mp3");
  });
});
