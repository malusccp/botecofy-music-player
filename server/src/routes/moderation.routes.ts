import { Router } from "express";
import type { Container } from "../config/container.js";
import { ModerationController } from "../controllers/ModerationController.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

export function moderationRoutes(c: Container): Router {
  const router = Router();
  const ctrl = new ModerationController(c);

  // HU07 — apenas admin (RN03/RN04).
  router.use(requireAuth, requireRole("admin"));
  router.get("/tracks", ctrl.list);
  router.post("/tracks/:id/deactivate", ctrl.deactivate);
  router.post("/tracks/:id/reactivate", ctrl.reactivate);
  router.get("/tracks/:id/history", ctrl.history);

  return router;
}
