import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { UserModel } from "../models/User.js";
import { TrackModel } from "../models/Track.js";
import { PlaylistModel } from "../models/Playlist.js";
import { LikeModel } from "../models/Like.js";
import { PlayHistoryModel } from "../models/PlayHistory.js";
import { PlaylistFollowModel } from "../models/PlaylistFollow.js";
import { ModerationLogModel } from "../models/ModerationLog.js";
import { RHYTHMS, type Rhythm } from "../models/enums.js";

/**
 * Seed do acervo a partir da iTunes Search API (dados reais da Apple).
 * Para cada ritmo busca músicas e mapeia:
 *   trackName    -> title
 *   artistName   -> artist
 *   previewUrl   -> audioUrl  (preview de ~30s, tocável no player)
 *   artworkUrl100 -> coverUrl (trocando 100x100bb por 600x600bb p/ alta resolução)
 */

interface ITunesTrack {
  trackName?: string;
  artistName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
  kind?: string;
}

const SEARCH_TERMS: Record<Rhythm, string> = {
  pagode: "pagode",
  sertanejo: "sertanejo",
  arrocha: "arrocha",
  brega: "brega",
};

const LIMIT_PER_RHYTHM = 12;

async function fetchRhythm(rhythm: Rhythm): Promise<ITunesTrack[]> {
  const term = encodeURIComponent(SEARCH_TERMS[rhythm]);
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=${LIMIT_PER_RHYTHM}&country=BR`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes respondeu ${res.status} para "${rhythm}"`);
  const data = (await res.json()) as { results?: ITunesTrack[] };
  return data.results ?? [];
}

function toCoverUrl(artworkUrl100?: string): string {
  if (!artworkUrl100) return "";
  return artworkUrl100.replace("100x100bb", "600x600bb");
}

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

  // Dono das faixas do acervo (curador "do sistema"). Os usuários reais entram via Clerk.
  const curator = await UserModel.create({
    clerkId: "seed:curador",
    displayName: "Curadoria Botecofy",
    role: "curator",
  });

  const seen = new Set<string>();
  const createdByRhythm: Record<Rhythm, string[]> = { pagode: [], sertanejo: [], arrocha: [], brega: [] };

  for (const rhythm of RHYTHMS) {
    console.log(`[seed] buscando "${rhythm}" no iTunes...`);
    let results: ITunesTrack[] = [];
    try {
      results = await fetchRhythm(rhythm);
    } catch (err) {
      console.warn(`[seed] falha ao buscar ${rhythm}:`, (err as Error).message);
      continue;
    }

    for (const item of results) {
      const title = item.trackName?.trim();
      const artist = item.artistName?.trim();
      const audioUrl = item.previewUrl;
      if (!title || !artist || !audioUrl) continue; // RN08: precisa de áudio

      const key = `${artist.toLowerCase()}::${title.toLowerCase()}`;
      if (seen.has(key)) continue; // RN02: evita duplicado por artista+título
      seen.add(key);

      try {
        const track = await TrackModel.create({
          title,
          artist,
          rhythm,
          audioUrl,
          coverUrl: toCoverUrl(item.artworkUrl100),
          durationSec: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 30,
          status: "active",
          playsCount: Math.floor(Math.random() * 400),
          likesCount: Math.floor(Math.random() * 120),
          uploadedBy: curator._id,
        });
        createdByRhythm[rhythm].push(String(track._id));
      } catch (err) {
        console.warn(`[seed] pulando "${title}" (${artist}):`, (err as Error).message);
      }
    }
    console.log(`[seed]   ${createdByRhythm[rhythm].length} faixas de ${rhythm}.`);
  }

  console.log("[seed] criando playlists temáticas...");
  await PlaylistModel.create([
    {
      name: "Pagode de Mesa de Bar",
      description: "Para acompanhar a saideira.",
      rhythms: ["pagode"],
      isPublic: true,
      owner: curator._id,
      tracks: createdByRhythm.pagode,
    },
    {
      name: "Arrocha Sofrência",
      description: "Chora, mas dança.",
      rhythms: ["arrocha"],
      isPublic: true,
      owner: curator._id,
      tracks: createdByRhythm.arrocha,
    },
    {
      name: "Sertanejo Raiz & Brega",
      description: "Modão e brega para o fim de noite.",
      rhythms: ["sertanejo", "brega"],
      isPublic: true,
      owner: curator._id,
      tracks: [...createdByRhythm.sertanejo, ...createdByRhythm.brega],
    },
  ]);

  const total = Object.values(createdByRhythm).reduce((s, arr) => s + arr.length, 0);
  console.log(`[seed] concluído: ${total} faixas reais (iTunes) + 3 playlists.`);
  await disconnectDatabase();
}

seed().catch(async (err) => {
  console.error("[seed] erro:", err);
  await disconnectDatabase();
  process.exit(1);
});
