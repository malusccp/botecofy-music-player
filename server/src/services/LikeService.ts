import type { ILikeRepository, ITrackRepository } from "../repositories/interfaces.js";
import { NotFoundError } from "../errors/AppError.js";
import type { RealtimeNotifier } from "./events/RealtimeNotifier.js";

export interface LikeResult {
  liked: boolean;
  likesCount: number;
}

/**
 * Regras de curtida (HU05). RN07: idempotente — curtir/descurtir em toggle.
 * Emite evento de domínio para atualização em tempo real (Observer), sem
 * conhecer Socket.io.
 */
export class LikeService {
  constructor(
    private readonly likes: ILikeRepository,
    private readonly tracks: ITrackRepository,
    private readonly notifier: RealtimeNotifier
  ) {}

  async toggle(userId: string, trackId: string): Promise<LikeResult> {
    const track = await this.tracks.findById(trackId);
    if (!track || track.status !== "active") throw new NotFoundError("Faixa não encontrada.");

    const existing = await this.likes.find(userId, trackId);
    let liked: boolean;

    if (existing) {
      await this.likes.remove(userId, trackId);
      liked = false;
    } else {
      // RN07: índice único garante unicidade mesmo em corrida.
      await this.likes.create(userId, trackId);
      liked = true;
    }

    const updated = await this.tracks.incrementCounter(trackId, "likesCount", liked ? 1 : -1);
    const likesCount = Math.max(0, updated?.likesCount ?? 0);

    this.notifier.emit({ type: "track:liked", trackId, likesCount });
    return { liked, likesCount };
  }
}
