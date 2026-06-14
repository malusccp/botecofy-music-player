import type { ITrackRepository, ILikeRepository, TrackQuery } from "../repositories/interfaces.js";
import type { TrackDoc } from "../models/Track.js";
import { isRhythm, type Rhythm } from "../models/enums.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors/AppError.js";
import { TrackFactory, type NewTrackInput } from "./TrackFactory.js";

export interface CreateTrackData extends NewTrackInput {}

/**
 * Regras de negócio do acervo de faixas (HU01, HU02).
 * Aplica RN01, RN02, RN04. Depende de abstrações (DIP).
 */
export class TrackService {
  constructor(
    private readonly tracks: ITrackRepository,
    private readonly likes: ILikeRepository
  ) {}

  /**
   * Cadastra uma faixa usando uma fábrica (Factory Method) que resolve a
   * origem do áudio (upload ou URL externa).
   */
  async create(factory: TrackFactory, data: CreateTrackData): Promise<TrackDoc> {
    if (!data.title?.trim() || !data.artist?.trim()) {
      throw new ValidationError("Título e artista são obrigatórios.");
    }
    if (!isRhythm(data.rhythm)) {
      throw new ValidationError("Ritmo inválido. Use: brega, pagode, sertanejo ou arrocha.");
    }

    // RN02: não permitir título duplicado por artista entre faixas ativas.
    const duplicate = await this.tracks.findActiveByArtistAndTitle(data.artist.trim(), data.title.trim());
    if (duplicate) {
      throw new ConflictError("Já existe uma faixa ativa com esse título para o mesmo artista.");
    }

    const attrs = factory.build({ ...data, title: data.title.trim(), artist: data.artist.trim() });
    return this.tracks.create(attrs as unknown as Record<string, unknown>);
  }

  /** Busca/filtragem do acervo. RN04: lista apenas faixas ativas por padrão. */
  async search(query: TrackQuery): Promise<{ items: TrackDoc[]; total: number }> {
    return this.tracks.search({ ...query, status: query.status ?? "active" });
  }

  async getById(id: string): Promise<TrackDoc> {
    const track = await this.tracks.findById(id);
    if (!track) throw new NotFoundError("Faixa não encontrada.");
    return track;
  }

  /** Conjunto de ids curtidos por um usuário (para marcar `liked` nos DTOs). */
  async likedTrackIds(userId: string): Promise<Set<string>> {
    const ids = await this.likes.listTrackIdsByUser(userId);
    return new Set(ids);
  }

  static buildQuery(raw: {
    rhythms?: string;
    text?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }): TrackQuery {
    const rhythms = (raw.rhythms ?? "")
      .split(",")
      .map((r) => r.trim())
      .filter((r): r is Rhythm => isRhythm(r));

    return {
      rhythms: rhythms.length ? rhythms : undefined,
      text: raw.text,
      sort: raw.sort,
      page: Math.max(1, Number(raw.page ?? 1) || 1),
      limit: Math.min(50, Math.max(1, Number(raw.limit ?? 12) || 12)),
    };
  }
}
