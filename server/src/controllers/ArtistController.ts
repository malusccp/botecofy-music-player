import type { Request, Response, NextFunction } from "express";
import type { Container } from "../config/container.js";
import { toArtistDTO, toAlbumDTO, toTrackDTO } from "../dtos/mappers.js";

export class ArtistController {
  constructor(private readonly c: Container) {}

  /** GET /api/artists — "Artistas do Momento" (ranking por popularidade). */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10) || 10));
      const artists = await this.c.artistService.listTrending(limit);
      res.json({ items: artists.map(toArtistDTO) });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/artists/:id — perfil completo (foto, álbuns, faixas mais populares). */
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { artist, albums, topTracks } = await this.c.artistService.getProfile(req.params.id);
      res.json({
        artist: toArtistDTO(artist),
        albums: albums.map(toAlbumDTO),
        topTracks: topTracks.map((t) => toTrackDTO(t)),
      });
    } catch (err) {
      next(err);
    }
  };
}
