import type { Request, Response, NextFunction } from "express";
import type { Container } from "../config/container.js";
import { toAlbumDTO, toTrackDTO } from "../dtos/mappers.js";

export class AlbumController {
  constructor(private readonly c: Container) {}

  /** GET /api/albums — "Recomendações de Álbuns" (ou álbuns de um artista, via ?artist=). */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10) || 10));
      const artistId = typeof req.query.artist === "string" ? req.query.artist : undefined;
      const albums = await this.c.albumService.listTrending({ artistId, limit });
      res.json({ items: albums.map(toAlbumDTO) });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/albums/:id — detalhe do álbum com suas faixas (para tocar o álbum inteiro). */
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { album, tracks } = await this.c.albumService.getWithTracks(req.params.id);
      res.json({ album: toAlbumDTO(album), tracks: tracks.map((t) => toTrackDTO(t)) });
    } catch (err) {
      next(err);
    }
  };
}
