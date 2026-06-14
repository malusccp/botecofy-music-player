import type { Request, Response, NextFunction } from "express";
import type { Container } from "../config/container.js";
import { toPlaylistDTO } from "../dtos/mappers.js";
import type { Actor } from "../services/PlaylistService.js";

export class PlaylistController {
  constructor(private readonly c: Container) {}

  private actor(req: Request): Actor {
    return { id: req.actor!.id, role: req.actor!.role };
  }

  /** POST /api/playlists (HU04) */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const playlist = await this.c.playlistService.create(this.actor(req), {
        name: req.body.name,
        description: req.body.description,
        rhythms: req.body.rhythms,
        isPublic: req.body.isPublic,
      });
      res.status(201).json(toPlaylistDTO(playlist));
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/playlists — públicas + próprias (RN09) */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const playlists = await this.c.playlistService.listVisible(this.actor(req));
      res.json(playlists.map((p) => toPlaylistDTO(p)));
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/playlists/:id — com faixas (HU06) */
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const playlist = await this.c.playlistService.getVisible(this.actor(req), req.params.id);
      res.json(toPlaylistDTO(playlist, true));
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/playlists/:id/tracks { trackId } */
  addTrack = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const playlist = await this.c.playlistService.addTrack(
        this.actor(req),
        req.params.id,
        req.body.trackId
      );
      res.json(toPlaylistDTO(playlist));
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/playlists/:id/tracks/:trackId */
  removeTrack = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const playlist = await this.c.playlistService.removeTrack(
        this.actor(req),
        req.params.id,
        req.params.trackId
      );
      res.json(toPlaylistDTO(playlist));
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/playlists/:id */
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.c.playlistService.remove(this.actor(req), req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/playlists/:id/follow — seguir/deixar de seguir (HU06) */
  toggleFollow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.c.playlistService.toggleFollow(this.actor(req), req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/playlists/followed/mine */
  listFollowed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const playlists = await this.c.playlistService.listFollowed(this.actor(req));
      res.json(playlists.map((p) => toPlaylistDTO(p)));
    } catch (err) {
      next(err);
    }
  };
}
