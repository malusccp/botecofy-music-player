import type { AlbumQuery, IAlbumRepository } from "../repositories/interfaces.js";
import type { AlbumDoc } from "../models/Album.js";
import type { TrackDoc } from "../models/Track.js";
import { NotFoundError } from "../errors/AppError.js";

export interface AlbumWithTracks {
  album: AlbumDoc;
  tracks: TrackDoc[];
}

/** Regras de negócio de álbuns: listagem em destaque e detalhe com faixas. */
export class AlbumService {
  constructor(private readonly albums: IAlbumRepository) {}

  listTrending(query: Partial<AlbumQuery> = {}): Promise<AlbumDoc[]> {
    return this.albums.list({ artistId: query.artistId, limit: query.limit ?? 10 });
  }

  /** Álbum com suas faixas, para tocar o álbum inteiro a partir de um clique. */
  async getWithTracks(id: string): Promise<AlbumWithTracks> {
    const album = await this.albums.findByIdWithTracks(id);
    if (!album) throw new NotFoundError("Álbum não encontrado.");
    const tracks = (album.tracks ?? []) as unknown as TrackDoc[];
    return { album, tracks };
  }
}
