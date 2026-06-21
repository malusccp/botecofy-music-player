import { Router } from "express";
import type { Container } from "../config/container.js";
import { AlbumController } from "../controllers/AlbumController.js";

export function albumRoutes(c: Container): Router {
  const router = Router();
  const ctrl = new AlbumController(c);

  // Catálogo público — aceita ?artist=<id>&limit=<n>.
  router.get("/", ctrl.list);
  router.get("/:id", ctrl.getOne);

  return router;
}
