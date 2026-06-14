import { Router } from "express";
import type { Container } from "../config/container.js";
import { trackRoutes } from "./track.routes.js";
import { playlistRoutes } from "./playlist.routes.js";
import { userRoutes } from "./user.routes.js";
import { moderationRoutes } from "./moderation.routes.js";
import { availableSortKeys } from "../services/strategies/SortStrategy.js";
import { RHYTHMS } from "../models/enums.js";

export function buildApiRouter(c: Container): Router {
  const api = Router();

  api.get("/health", (_req, res) => res.json({ status: "ok", service: "botecofy-api" }));
  api.get("/meta", (_req, res) =>
    res.json({ rhythms: RHYTHMS, sortKeys: availableSortKeys })
  );

  api.use("/tracks", trackRoutes(c));
  api.use("/playlists", playlistRoutes(c));
  api.use("/me", userRoutes(c));
  api.use("/moderation", moderationRoutes(c));

  return api;
}
