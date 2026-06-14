import type { Request, Response, NextFunction } from "express";
import type { Container } from "../config/container.js";
import { toTrackDTO } from "../dtos/mappers.js";

export class ModerationController {
  constructor(private readonly c: Container) {}

  /** GET /api/moderation/tracks?status= — fila de moderação (HU07) */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as "active" | "inactive" | undefined;
      const tracks = await this.c.moderationService.list(status);
      res.json({ items: tracks.map((t) => toTrackDTO(t)) });
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/moderation/tracks/:id/deactivate (HU07, RN04) */
  deactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const track = await this.c.moderationService.deactivate(
        req.actor!.id,
        req.params.id,
        req.body?.reason ?? ""
      );
      res.json(toTrackDTO(track));
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/moderation/tracks/:id/reactivate */
  reactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const track = await this.c.moderationService.reactivate(
        req.actor!.id,
        req.params.id,
        req.body?.reason ?? ""
      );
      res.json(toTrackDTO(track));
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/moderation/tracks/:id/history */
  history = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await this.c.moderationService.history(req.params.id);
      res.json({
        items: logs.map((l) => ({
          id: String(l._id),
          action: l.action,
          reason: l.reason,
          admin: (l.admin as unknown as { displayName?: string })?.displayName ?? String(l.admin),
          createdAt: l.createdAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  };
}
