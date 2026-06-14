import { Router } from "express";
import { z } from "zod";
import type { Container } from "../config/container.js";
import { PlaylistController } from "../controllers/PlaylistController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validateBody } from "../middlewares/validate.js";
import { RHYTHMS } from "../models/enums.js";

const createSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  description: z.string().optional(),
  rhythms: z.array(z.enum(RHYTHMS)).min(1, "Informe ao menos um ritmo."),
  isPublic: z.boolean().optional(),
});

const addTrackSchema = z.object({ trackId: z.string().min(1) });

export function playlistRoutes(c: Container): Router {
  const router = Router();
  const ctrl = new PlaylistController(c);

  router.get("/", requireAuth, ctrl.list);
  router.get("/followed/mine", requireAuth, ctrl.listFollowed);
  router.get("/:id", requireAuth, ctrl.getOne);

  // HU04 — curadoria: apenas curador/admin (RN03).
  router.post(
    "/",
    requireAuth,
    requireRole("curator", "admin"),
    validateBody(createSchema),
    ctrl.create
  );
  router.post(
    "/:id/tracks",
    requireAuth,
    requireRole("curator", "admin"),
    validateBody(addTrackSchema),
    ctrl.addTrack
  );
  router.delete(
    "/:id/tracks/:trackId",
    requireAuth,
    requireRole("curator", "admin"),
    ctrl.removeTrack
  );
  router.delete("/:id", requireAuth, requireRole("curator", "admin"), ctrl.remove);

  // HU06 — seguir playlist (qualquer ouvinte autenticado).
  router.post("/:id/follow", requireAuth, ctrl.toggleFollow);

  return router;
}
