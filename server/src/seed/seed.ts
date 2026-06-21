import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { UserModel } from "../models/User.js";
import { TrackModel, type TrackDoc } from "../models/Track.js";
import { PlaylistModel } from "../models/Playlist.js";
import { LikeModel } from "../models/Like.js";
import { PlayHistoryModel } from "../models/PlayHistory.js";
import { PlaylistFollowModel } from "../models/PlaylistFollow.js";
import { ModerationLogModel } from "../models/ModerationLog.js";
import { ArtistModel, type ArtistDoc } from "../models/Artist.js";
import { AlbumModel, type AlbumDoc } from "../models/Album.js";
import { RHYTHMS, type Rhythm } from "../models/enums.js";

/**
 * Seed do acervo a partir da iTunes Search API (dados reais da Apple).
 * Para cada ritmo busca músicas (com vários termos, p/ ampliar o catálogo) e mapeia:
 *   trackName     -> title
 *   artistName    -> artist (e cria/reaproveita um Artist)
 *   collectionName -> Album (criado/reaproveitado por artista+título)
 *   previewUrl    -> audioUrl  (preview de ~30s, tocável no player)
 *   artworkUrl100 -> coverUrl  (trocando 100x100bb por 600x600bb p/ alta resolução)
 *
 * Limitação conhecida: a iTunes Search API não retorna foto de artista nesse
 * endpoint — usamos a capa da primeira faixa encontrada como fallback.
 */

interface ITunesTrack {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackTimeMillis?: number;
  kind?: string;
}

// "piseiro" entra como termo extra dentro do balde "sertanejo" (gênero próximo,
// evita criar um 5º ritmo e propagar isso por todo o front-end).
const SEARCH_TERMS: Record<Rhythm, string[]> = {
  brega: ["brega", "brega romântico", "brega calypso"],
  pagode: ["pagode", "pagode raiz", "pagode 90"],
  sertanejo: ["sertanejo", "sertanejo raiz", "sertanejo universitário", "piseiro"],
  arrocha: ["arrocha", "arrocha sofrência", "arrocha romântico"],
};

const LIMIT_PER_TERM = 200; // máximo aceito pela iTunes Search API

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTerm(term: string): Promise<ITunesTrack[]> {
  const q = encodeURIComponent(term);
  const url = `https://itunes.apple.com/search?term=${q}&entity=song&limit=${LIMIT_PER_TERM}&country=BR`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes respondeu ${res.status} para "${term}"`);
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
    ArtistModel.deleteMany({}),
    AlbumModel.deleteMany({}),
  ]);

  // Dono das faixas do acervo (curador "do sistema"). Os usuários reais entram via Clerk.
  const curator = await UserModel.create({
    clerkId: "seed:curador",
    displayName: "Curadoria Botecofy",
    role: "curator",
  });

  const seen = new Set<string>(); // dedupe por artista+título (RN02)
  const artistsByName = new Map<string, ArtistDoc>();
  const albumsByKey = new Map<string, AlbumDoc>(); // `${artistId}::${título em minúsculo}`
  const artistPopularity = new Map<string, number>();
  const albumPopularity = new Map<string, number>();
  const createdByRhythm: Record<Rhythm, string[]> = { pagode: [], sertanejo: [], arrocha: [], brega: [] };

  for (const rhythm of RHYTHMS) {
    for (const term of SEARCH_TERMS[rhythm]) {
      console.log(`[seed] buscando "${term}" (${rhythm}) no iTunes...`);
      let results: ITunesTrack[] = [];
      try {
        results = await fetchTerm(term);
      } catch (err) {
        console.warn(`[seed] falha ao buscar "${term}":`, (err as Error).message);
        continue;
      }
      await sleep(250); // boa prática: não martelar a API pública

      for (const item of results) {
        const title = item.trackName?.trim();
        const artistName = item.artistName?.trim();
        const audioUrl = item.previewUrl;
        if (!title || !artistName || !audioUrl) continue; // RN08: precisa de áudio

        const key = `${artistName.toLowerCase()}::${title.toLowerCase()}`;
        if (seen.has(key)) continue; // RN02: evita duplicado por artista+título
        seen.add(key);

        const coverUrl = toCoverUrl(item.artworkUrl100);

        // Resolve/cria o Artist.
        const artistKey = artistName.toLowerCase();
        let artistDoc = artistsByName.get(artistKey);
        if (!artistDoc) {
          artistDoc = await ArtistModel.create({ name: artistName, photoUrl: coverUrl, rhythms: [rhythm] });
          artistsByName.set(artistKey, artistDoc);
        } else if (!artistDoc.rhythms?.includes(rhythm)) {
          artistDoc.rhythms = [...(artistDoc.rhythms ?? []), rhythm];
        }

        // Resolve/cria o Album (quando a iTunes retorna o nome da coleção).
        let albumDoc: AlbumDoc | undefined;
        if (item.collectionName?.trim()) {
          const albumTitle = item.collectionName.trim();
          const albumKey = `${artistDoc._id}::${albumTitle.toLowerCase()}`;
          albumDoc = albumsByKey.get(albumKey);
          if (!albumDoc) {
            albumDoc = await AlbumModel.create({
              title: albumTitle,
              artist: artistDoc._id,
              coverUrl,
              rhythm,
              tracks: [],
            });
            albumsByKey.set(albumKey, albumDoc);
          }
        }

        try {
          const track: TrackDoc = await TrackModel.create({
            title,
            artist: artistName,
            rhythm,
            audioUrl,
            coverUrl,
            durationSec: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 30,
            status: "active",
            playsCount: Math.floor(Math.random() * 400),
            likesCount: Math.floor(Math.random() * 120),
            uploadedBy: curator._id,
            artistRef: artistDoc._id,
            albumRef: albumDoc?._id,
          });

          createdByRhythm[rhythm].push(String(track._id));
          artistPopularity.set(artistKey, (artistPopularity.get(artistKey) ?? 0) + track.playsCount);

          if (albumDoc) {
            albumDoc.tracks.push(track._id);
            const albumIdKey = String(albumDoc._id);
            albumPopularity.set(albumIdKey, (albumPopularity.get(albumIdKey) ?? 0) + track.playsCount);
          }
        } catch (err) {
          console.warn(`[seed] pulando "${title}" (${artistName}):`, (err as Error).message);
        }
      }
    }
    console.log(`[seed]   ${createdByRhythm[rhythm].length} faixas de ${rhythm}.`);
  }

  console.log("[seed] salvando artistas e álbuns...");
  await Promise.all(
    Array.from(artistsByName.entries()).map(([key, artist]) => {
      artist.popularity = artistPopularity.get(key) ?? 0;
      return artist.save();
    })
  );
  await Promise.all(
    Array.from(albumsByKey.values()).map((album) => {
      album.popularity = albumPopularity.get(String(album._id)) ?? 0;
      return album.save();
    })
  );

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
      description: "Modão, piseiro e brega para o fim de noite.",
      rhythms: ["sertanejo", "brega"],
      isPublic: true,
      owner: curator._id,
      tracks: [...createdByRhythm.sertanejo, ...createdByRhythm.brega],
    },
  ]);

  const total = Object.values(createdByRhythm).reduce((s, arr) => s + arr.length, 0);
  console.log(
    `[seed] concluído: ${total} faixas reais (iTunes), ${artistsByName.size} artistas, ${albumsByKey.size} álbuns + 3 playlists.`
  );
  await disconnectDatabase();
}

seed().catch(async (err) => {
  console.error("[seed] erro:", err);
  await disconnectDatabase();
  process.exit(1);
});
