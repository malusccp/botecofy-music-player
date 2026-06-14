import type { Request, Response, NextFunction } from "express";
import type { Container } from "../config/container.js";
import { toTrackDTO } from "../dtos/mappers.js";
import type { TrackDoc } from "../models/Track.js";

export class UserController {
  constructor(private readonly c: Container) {}

  /** GET /api/me — perfil sincronizado (HU08) */
  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        id: req.actor!.id,
        displayName: req.actor!.displayName,
        role: req.actor!.role,
      });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/me/history — últimas faixas tocadas (HU08) */
  history = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.c.playbackService.recentHistory(req.actor!.id, 20);
      const items = rows
        .map((r) => r.track as unknown as TrackDoc)
        .filter((t) => t && (t as { title?: string }).title)
        .map((t) => toTrackDTO(t));
      res.json({ items });
    } catch (err) {
      next(err);
    }
  };
}
