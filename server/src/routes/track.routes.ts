import { Router } from "express";
import { z } from "zod";
import type { Container } from "../config/container.js";
import { TrackController } from "../controllers/TrackController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { uploadTrackFiles } from "../middlewares/upload.js";
import { validateBody } from "../middlewares/validate.js";
import { RHYTHMS } from "../models/enums.js";

const playSchema = z.object({
  listenedSeconds: z.coerce.number().min(0).default(0),
});

export function trackRoutes(c: Container): Router {
  const router = Router();
  const ctrl = new TrackController(c);

  // HU02 — listagem pública (mas usa actor se autenticado p/ marcar `liked`).
  router.get("/", ctrl.list);
  router.get("/:id", ctrl.getOne);

  // HU01 — apenas curador/admin (RN03). Validação de campos textuais via Zod
  // após o multer popular req.body.
  router.post(
    "/",
    requireAuth,
    requireRole("curator", "admin"),
    uploadTrackFiles,
    validateBody(
      z.object({
        title: z.string().min(1, "Título é obrigatório."),
        artist: z.string().min(1, "Artista é obrigatório."),
        rhythm: z.enum(RHYTHMS),
        durationSec: z.coerce.number().min(0).optional(),
      })
    ),
    ctrl.create
  );

  // HU03 — registrar play (RN06).
  router.post("/:id/play", requireAuth, validateBody(playSchema), ctrl.registerPlay);

  // HU05 — curtir/descurtir (RN07).
  router.post("/:id/like", requireAuth, ctrl.toggleLike);

  return router;
}
