import type { IArtistRepository } from "../repositories/interfaces.js";
import type { IAlbumRepository } from "../repositories/interfaces.js";
import type { ITrackRepository } from "../repositories/interfaces.js";
import type { ArtistDoc } from "../models/Artist.js";
import type { AlbumDoc } from "../models/Album.js";
import type { TrackDoc } from "../models/Track.js";
import type { DeezerService } from "../lib/images/DeezerService.js";
import { NotFoundError } from "../errors/AppError.js";

export interface ArtistProfile {
  artist: ArtistDoc;
  albums: AlbumDoc[];
  topTracks: TrackDoc[];
}

/** Regras de negócio de artistas: ranking de destaque e perfil completo. */
export class ArtistService {
  constructor(
    private readonly artists: IArtistRepository,
    private readonly albums: IAlbumRepository,
    private readonly tracks: ITrackRepository,
    private readonly deezer: DeezerService
  ) {}

  async listTrending(limit = 10): Promise<ArtistDoc[]> {
    const artists = await this.artists.list(limit);
    return this.enrichPhotos(artists);
  }

  async getProfile(id: string): Promise<ArtistProfile> {
    const artist = await this.artists.findById(id);
    if (!artist) throw new NotFoundError("Artista não encontrado.");

    const [albums, topTracks] = await Promise.all([
      this.albums.list({ artistId: id, limit: 20 }),
      this.tracks.findTopByArtist(id, 10),
      this.enrichPhotos([artist]),
    ]);

    return { artist, albums, topTracks };
  }

  /**
   * Busca a foto real do artista na Deezer na primeira vez que ele aparece
   * (em destaque ou ao abrir o perfil) e persiste o resultado. Chamadas
   * seguintes usam o que já está no banco.
   */
  private async enrichPhotos(artists: ArtistDoc[]): Promise<ArtistDoc[]> {
    await Promise.all(
      artists.map(async (artist) => {
        if ((artist as { photoChecked?: boolean }).photoChecked) return;
        const photo = await this.deezer.getArtistImage(artist.name);
        artist.set("photoChecked", true);
        if (photo) artist.photoUrl = photo;
        try {
          await artist.save();
        } catch {
          // foto é um detalhe estético; nunca derruba a listagem por causa disso.
        }
      })
    );
    return artists;
  }
}
