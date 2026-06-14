import { Router } from "express";
import type { Container } from "../config/container.js";
import { UserController } from "../controllers/UserController.js";
import { requireAuth } from "../middlewares/auth.js";

export function userRoutes(c: Container): Router {
  const router = Router();
  const ctrl = new UserController(c);

  router.get("/", requireAuth, ctrl.me);
  router.get("/history", requireAuth, ctrl.history);

  return router;
}
