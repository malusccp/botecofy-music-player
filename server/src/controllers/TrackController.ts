import type { Request, Response, NextFunction } from "express";
import type { Container } from "../config/container.js";
import { UploadedTrackFactory } from "../services/TrackFactory.js";
import { toTrackDTO } from "../dtos/mappers.js";
import { TrackService } from "../services/TrackService.js";
import { ValidationError } from "../errors/AppError.js";
import type { Rhythm } from "../models/enums.js";

type Files = Record<string, Express.Multer.File[]>;

export class TrackController {
  constructor(private readonly c: Container) {}

  /** POST /api/tracks — cadastra faixa com upload (HU01). */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Files | undefined;
      const audio = files?.audio?.[0];
      if (!audio) throw new ValidationError("Arquivo de áudio é obrigatório.");

      const audioUrl = await this.c.storage.save(
        { buffer: audio.buffer, originalName: audio.originalname, mimeType: audio.mimetype },
        "audio"
      );

      let coverUrl = "";
      const cover = files?.cover?.[0];
      if (cover) {
        coverUrl = await this.c.storage.save(
          { buffer: cover.buffer, originalName: cover.originalname, mimeType: cover.mimetype },
          "covers"
        );
      }

      const factory = new UploadedTrackFactory(audioUrl);
      const track = await this.c.trackService.create(factory, {
        title: req.body.title,
        artist: req.body.artist,
        rhythm: req.body.rhythm as Rhythm,
        durationSec: req.body.durationSec ? Number(req.body.durationSec) : 0,
        coverUrl,
        uploadedBy: req.actor!.id,
      });

      res.status(201).json(toTrackDTO(track));
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/tracks — busca/filtra o acervo (HU02). */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = TrackService.buildQuery(req.query as Record<string, string>);
      const { items, total } = await this.c.trackService.search(query);

      const likedIds = req.actor
        ? await this.c.trackService.likedTrackIds(req.actor.id)
        : new Set<string>();

      res.json({
        items: items.map((t) => toTrackDTO(t, likedIds.has(String(t._id)))),
        total,
        page: query.page,
        limit: query.limit,
      });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/tracks/:id */
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const track = await this.c.trackService.getById(req.params.id);
      res.json(toTrackDTO(track));
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/tracks/:id/play — registra reprodução (HU03, RN06). */
  registerPlay = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listened = Number(req.body?.listenedSeconds ?? 0);
      const result = await this.c.playbackService.registerPlay(
        req.actor!.id,
        req.params.id,
        listened
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/tracks/:id/like — curte/descurte em tempo real (HU05, RN07). */
  toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.c.likeService.toggle(req.actor!.id, req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
