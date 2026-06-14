import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { UserModel } from "../models/User.js";
import { TrackModel } from "../models/Track.js";
import { PlaylistModel } from "../models/Playlist.js";
import { LikeModel } from "../models/Like.js";
import { PlayHistoryModel } from "../models/PlayHistory.js";
import { PlaylistFollowModel } from "../models/PlaylistFollow.js";
import { ModerationLogModel } from "../models/ModerationLog.js";
import type { Rhythm } from "../models/enums.js";

/**
 * Popula o banco com dados de exemplo para demonstração.
 * Os usuários usam o esquema do MODO DEV de autenticação: para "logar" como
 * cada um, o front envia o header x-dev-user-id correspondente.
 *
 *   curador  -> x-dev-user-id: curador  | x-dev-role: curator
 *   admin    -> x-dev-user-id: admin    | x-dev-role: admin
 *   ouvinte  -> x-dev-user-id: ouvinte  | x-dev-role: listener
 */

// Áudio de exemplo (placeholder). Faça upload de arquivos reais pela UI/cadastro.
const SAMPLE_AUDIO = "/uploads/audio/sample.mp3";

const SEED_TRACKS: Array<{ title: string; artist: string; rhythm: Rhythm; plays: number; likes: number }> = [
  { title: "Saideira da Madrugada", artist: "Zé do Pagode", rhythm: "pagode", plays: 320, likes: 88 },
  { title: "Mesa de Bar", artist: "Trio Resenha", rhythm: "pagode", plays: 210, likes: 51 },
  { title: "Sofrência de Garrafa", artist: "Banda Arrochaço", rhythm: "arrocha", plays: 540, likes: 132 },
  { title: "Amor de Esquina", artist: "Brega das Antigas", rhythm: "brega", plays: 175, likes: 40 },
  { title: "Coração Apertado", artist: "Brega das Antigas", rhythm: "brega", plays: 98, likes: 22 },
  { title: "Boiadeiro de Asfalto", artist: "Dupla Poeira", rhythm: "sertanejo", plays: 410, likes: 109 },
  { title: "Modão na Veia", artist: "Dupla Poeira", rhythm: "sertanejo", plays: 260, likes: 70 },
  { title: "Arrocha do Adeus", artist: "Banda Arrochaço", rhythm: "arrocha", plays: 300, likes: 95 },
];

async function seed() {
  await connectDatabase();
  console.log("[seed] limpando coleções...");
  await Promise.all([
    UserModel.deleteMany({}),
    TrackModel.deleteMany({}),
    PlaylistModel.deleteMany({}),
    LikeModel.deleteMany({}),
    PlayHistoryModel.deleteMany({}),
    PlaylistFollowModel.deleteMany({}),
    ModerationLogModel.deleteMany({}),
  ]);

  const [curator, admin, listener] = await UserModel.create([
    { clerkId: "dev:curador", displayName: "Curador Boteco", role: "curator" },
    { clerkId: "dev:admin", displayName: "Admin Boteco", role: "admin" },
    { clerkId: "dev:ouvinte", displayName: "Ouvinte Boteco", role: "listener" },
  ]);

  console.log("[seed] criando faixas...");
  const tracks = await TrackModel.create(
    SEED_TRACKS.map((t) => ({
      title: t.title,
      artist: t.artist,
      rhythm: t.rhythm,
      audioUrl: SAMPLE_AUDIO,
      coverUrl: "",
      durationSec: 180,
      status: "active",
      playsCount: t.plays,
      likesCount: t.likes,
      uploadedBy: curator._id,
    }))
  );

  console.log("[seed] criando playlists temáticas...");
  await PlaylistModel.create([
    {
      name: "Pagode de Mesa de Bar",
      description: "Para acompanhar a saideira.",
      rhythms: ["pagode"],
      isPublic: true,
      owner: curator._id,
      tracks: tracks.filter((t) => t.rhythm === "pagode").map((t) => t._id),
    },
    {
      name: "Arrocha Sofrência",
      description: "Chora, mas dança.",
      rhythms: ["arrocha"],
      isPublic: true,
      owner: curator._id,
      tracks: tracks.filter((t) => t.rhythm === "arrocha").map((t) => t._id),
    },
    {
      name: "Sertanejo Raiz & Brega",
      description: "Modão e brega para o fim de noite.",
      rhythms: ["sertanejo", "brega"],
      isPublic: true,
      owner: curator._id,
      tracks: tracks.filter((t) => t.rhythm === "sertanejo" || t.rhythm === "brega").map((t) => t._id),
    },
  ]);

  console.log("[seed] concluído.");
  console.log(`  usuários: curador(${curator.id}), admin(${admin.id}), ouvinte(${listener.id})`);
  await disconnectDatabase();
}

seed().catch(async (err) => {
  console.error("[seed] erro:", err);
  await disconnectDatabase();
  process.exit(1);
});
