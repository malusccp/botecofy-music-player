import type {
  ITrackRepository,
  IModerationLogRepository,
} from "../repositories/interfaces.js";
import { NotFoundError } from "../errors/AppError.js";
import type { TrackDoc } from "../models/Track.js";

/**
 * Regras de moderação do acervo (HU07). RN04: faixa inativa some das buscas e
 * não entra em playlists. Toda ação é registrada (ModerationLog).
 */
export class ModerationService {
  constructor(
    private readonly tracks: ITrackRepository,
    private readonly logs: IModerationLogRepository
  ) {}

  async deactivate(adminId: string, trackId: string, reason: string): Promise<TrackDoc> {
    return this.changeStatus(adminId, trackId, "inactive", "deactivate", reason);
  }

  async reactivate(adminId: string, trackId: string, reason: string): Promise<TrackDoc> {
    return this.changeStatus(adminId, trackId, "active", "reactivate", reason);
  }

  async history(trackId: string) {
    return this.logs.listByTrack(trackId);
  }

  /** Lista faixas para a fila de moderação (inclui inativas, ao contrário da busca pública). */
  async list(status?: "active" | "inactive"): Promise<TrackDoc[]> {
    if (status) {
      const { items } = await this.tracks.search({ status, page: 1, limit: 100 });
      return items;
    }
    const [active, inactive] = await Promise.all([
      this.tracks.search({ status: "active", page: 1, limit: 100 }),
      this.tracks.search({ status: "inactive", page: 1, limit: 100 }),
    ]);
    return [...inactive.items, ...active.items];
  }

  private async changeStatus(
    adminId: string,
    trackId: string,
    status: "active" | "inactive",
    action: "deactivate" | "reactivate",
    reason: string
  ): Promise<TrackDoc> {
    const track = await this.tracks.findById(trackId);
    if (!track) throw new NotFoundError("Faixa não encontrada.");

    const updated = await this.tracks.setStatus(trackId, status);
    await this.logs.add({ track: trackId, admin: adminId, action, reason: reason ?? "" });
    return updated!;
  }
}
