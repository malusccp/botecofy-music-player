import { Router } from "express";
import type { Container } from "../config/container.js";
import { ArtistController } from "../controllers/ArtistController.js";

export function artistRoutes(c: Container): Router {
  const router = Router();
  const ctrl = new ArtistController(c);

  // Catálogo público (dados de navegação, não pessoais) — mesmo padrão de track.routes.
  router.get("/", ctrl.list);
  router.get("/:id", ctrl.getOne);

  return router;
}
