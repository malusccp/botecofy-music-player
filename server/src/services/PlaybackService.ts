import type {
  ITrackRepository,
  IPlayHistoryRepository,
} from "../repositories/interfaces.js";
import { NotFoundError, ValidationError } from "../errors/AppError.js";
import type { RealtimeNotifier } from "./events/RealtimeNotifier.js";

/** Segundos mínimos de reprodução para contabilizar um play (RN06). */
export const MIN_PLAY_SECONDS = 20;

export interface PlayResult {
  counted: boolean;
  playsCount: number;
}

/**
 * Regras de reprodução (HU03/HU08). RN06: só conta play após reprodução
 * mínima. Registra histórico e emite evento de tempo real (Observer).
 */
export class PlaybackService {
  constructor(
    private readonly tracks: ITrackRepository,
    private readonly history: IPlayHistoryRepository,
    private readonly notifier: RealtimeNotifier
  ) {}

  async registerPlay(userId: string, trackId: string, listenedSeconds: number): Promise<PlayResult> {
    if (typeof listenedSeconds !== "number" || listenedSeconds < 0) {
      throw new ValidationError("Tempo de reprodução inválido.");
    }

    const track = await this.tracks.findById(trackId);
    if (!track || track.status !== "active") throw new NotFoundError("Faixa não encontrada.");

    // RN06: reprodução curta não conta como play, mas registra no histórico.
    await this.history.add(userId, trackId);
    if (listenedSeconds < MIN_PLAY_SECONDS) {
      return { counted: false, playsCount: track.playsCount ?? 0 };
    }

    const updated = await this.tracks.incrementCounter(trackId, "playsCount", 1);
    const playsCount = updated?.playsCount ?? (track.playsCount ?? 0) + 1;

    this.notifier.emit({ type: "track:played", trackId, playsCount });
    return { counted: true, playsCount };
  }

  async recentHistory(userId: string, limit = 20) {
    return this.history.listRecentByUser(userId, limit);
  }
}
