import path from "node:path";
import { env } from "./env.js";

import { TrackRepository } from "../repositories/TrackRepository.js";
import { PlaylistRepository } from "../repositories/PlaylistRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { LikeRepository } from "../repositories/LikeRepository.js";
import { PlayHistoryRepository } from "../repositories/PlayHistoryRepository.js";
import { PlaylistFollowRepository } from "../repositories/PlaylistFollowRepository.js";
import { ModerationLogRepository } from "../repositories/ModerationLogRepository.js";

import { LocalStorageService } from "../lib/storage/LocalStorageService.js";
import { RealtimeNotifier } from "../services/events/RealtimeNotifier.js";
import { ClerkAuthProvider, type AuthProvider } from "../middlewares/authProvider.js";

import { UserService } from "../services/UserService.js";
import { TrackService } from "../services/TrackService.js";
import { PlaylistService } from "../services/PlaylistService.js";
import { LikeService } from "../services/LikeService.js";
import { PlaybackService } from "../services/PlaybackService.js";
import { ModerationService } from "../services/ModerationService.js";

/**
 * Composition Root. Único lugar onde implementações concretas são escolhidas e
 * injetadas. O resto do sistema só conhece abstrações (SOLID/DIP).
 */
export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export function buildContainer() {
  // Persistência
  const trackRepo = new TrackRepository();
  const playlistRepo = new PlaylistRepository();
  const userRepo = new UserRepository();
  const likeRepo = new LikeRepository();
  const historyRepo = new PlayHistoryRepository();
  const followRepo = new PlaylistFollowRepository();
  const moderationRepo = new ModerationLogRepository();

  // Infra
  const storage = new LocalStorageService(UPLOADS_DIR, "/uploads");
  const notifier = new RealtimeNotifier();
  const authProvider: AuthProvider = new ClerkAuthProvider(env.adminEmails, env.curatorEmails);

  // Domínio / aplicação
  const userService = new UserService(userRepo);
  const trackService = new TrackService(trackRepo, likeRepo);
  const playlistService = new PlaylistService(playlistRepo, trackRepo, followRepo);
  const likeService = new LikeService(likeRepo, trackRepo, notifier);
  const playbackService = new PlaybackService(trackRepo, historyRepo, notifier);
  const moderationService = new ModerationService(trackRepo, moderationRepo);

  return {
    env,
    storage,
    notifier,
    authProvider,
    userService,
    trackService,
    playlistService,
    likeService,
    playbackService,
    moderationService,
  };
}

export type Container = ReturnType<typeof buildContainer>;
