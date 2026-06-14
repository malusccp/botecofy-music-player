import type {
  IPlaylistRepository,
  ITrackRepository,
  IPlaylistFollowRepository,
} from "../repositories/interfaces.js";
import type { PlaylistDoc } from "../models/Playlist.js";
import { isRhythm, type Rhythm, type Role } from "../models/enums.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/AppError.js";

export interface CreatePlaylistData {
  name: string;
  description?: string;
  rhythms: Rhythm[];
  isPublic?: boolean;
}

export interface Actor {
  id: string;
  role: Role;
}

/**
 * Regras de curadoria por ritmo (HU04, HU06).
 * RN01, RN03, RN05, RN09. Depende de abstrações (DIP).
 */
export class PlaylistService {
  constructor(
    private readonly playlists: IPlaylistRepository,
    private readonly tracks: ITrackRepository,
    private readonly follows: IPlaylistFollowRepository
  ) {}

  async create(actor: Actor, data: CreatePlaylistData): Promise<PlaylistDoc> {
    this.assertCanCurate(actor); // RN03
    this.assertValidRhythms(data.rhythms); // RN01 + RN05
    if (!data.name?.trim()) throw new ValidationError("Nome da playlist é obrigatório.");

    // RN05: nome único por curador.
    const dup = await this.playlists.findByOwnerAndName(actor.id, data.name.trim());
    if (dup) throw new ConflictError("Você já tem uma playlist com esse nome.");

    return this.playlists.create({
      name: data.name.trim(),
      description: data.description?.trim() ?? "",
      rhythms: data.rhythms,
      isPublic: data.isPublic ?? true,
      owner: actor.id,
      tracks: [],
    });
  }

  /** Lista playlists visíveis ao ator: públicas + as próprias (RN09). */
  async listVisible(actor: Actor): Promise<PlaylistDoc[]> {
    return this.playlists.listVisible({ $or: [{ isPublic: true }, { owner: actor.id }] });
  }

  async getVisible(actor: Actor, id: string): Promise<PlaylistDoc> {
    const playlist = await this.playlists.findByIdPopulated(id);
    if (!playlist) throw new NotFoundError("Playlist não encontrada.");
    if (!playlist.isPublic && String(playlist.owner) !== actor.id && actor.role !== "admin") {
      throw new NotFoundError("Playlist não encontrada."); // RN09: privada some para terceiros
    }
    return playlist;
  }

  async addTrack(actor: Actor, playlistId: string, trackId: string): Promise<PlaylistDoc> {
    const playlist = await this.requireOwned(actor, playlistId);

    const track = await this.tracks.findById(trackId);
    if (!track || track.status !== "active") {
      throw new ValidationError("Só é possível adicionar faixas ativas."); // RN04
    }
    if (playlist.tracks.some((t) => String(t) === trackId)) {
      throw new ConflictError("Faixa já está na playlist.");
    }

    playlist.tracks.push(track._id);
    await playlist.save();
    return playlist;
  }

  async removeTrack(actor: Actor, playlistId: string, trackId: string): Promise<PlaylistDoc> {
    const playlist = await this.requireOwned(actor, playlistId);
    playlist.tracks = playlist.tracks.filter((t) => String(t) !== trackId) as typeof playlist.tracks;
    await playlist.save();
    return playlist;
  }

  async remove(actor: Actor, playlistId: string): Promise<void> {
    await this.requireOwned(actor, playlistId);
    await this.playlists.deleteById(playlistId);
  }

  // --- Seguir playlists (HU06) ---

  async toggleFollow(actor: Actor, playlistId: string): Promise<{ following: boolean }> {
    const playlist = await this.getVisible(actor, playlistId); // respeita RN09
    if (!playlist.isPublic) throw new ForbiddenError("Só é possível seguir playlists públicas.");

    const existing = await this.follows.find(actor.id, playlistId);
    if (existing) {
      await this.follows.remove(actor.id, playlistId);
      return { following: false };
    }
    await this.follows.create(actor.id, playlistId);
    return { following: true };
  }

  async listFollowed(actor: Actor): Promise<PlaylistDoc[]> {
    const ids = await this.follows.listPlaylistIdsByUser(actor.id);
    const playlists = await Promise.all(ids.map((id) => this.playlists.findById(id)));
    return playlists.filter((p): p is PlaylistDoc => p !== null && p.isPublic);
  }

  // --- helpers de regra ---

  private async requireOwned(actor: Actor, playlistId: string): Promise<PlaylistDoc> {
    const playlist = await this.playlists.findById(playlistId);
    if (!playlist) throw new NotFoundError("Playlist não encontrada.");
    // RN03/RN10: só o dono ou admin altera.
    if (String(playlist.owner) !== actor.id && actor.role !== "admin") {
      throw new ForbiddenError("Apenas o dono pode alterar esta playlist.");
    }
    return playlist;
  }

  private assertCanCurate(actor: Actor): void {
    if (actor.role !== "curator" && actor.role !== "admin") {
      throw new ForbiddenError("Apenas curadores podem criar playlists.");
    }
  }

  private assertValidRhythms(rhythms: Rhythm[]): void {
    if (!Array.isArray(rhythms) || rhythms.length === 0) {
      throw new ValidationError("Informe ao menos um ritmo."); // RN05
    }
    if (!rhythms.every(isRhythm)) {
      throw new ValidationError("Ritmo inválido. Use: brega, pagode, sertanejo ou arrocha."); // RN01
    }
  }
}
