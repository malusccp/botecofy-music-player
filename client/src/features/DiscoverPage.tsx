import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTracks, fetchTrendingArtists, fetchTrendingAlbums, fetchPlaylists } from "../lib/queries";
import { RHYTHMS, RHYTHM_LABEL, type Rhythm, type Track } from "../types";
import { TrackTile } from "../components/TrackTile";
import { SearchIcon } from "../components/icons";
import { HeroMotifs } from "../components/HeroMotifs";
import { Carousel } from "../components/Carousel";
import { ArtistCard } from "../components/ArtistCard";
import { AlbumCard } from "../components/AlbumCard";
import { PlaylistCard } from "../components/PlaylistCard";

const SORTS = [
  { key: "recent", label: "Mais recentes" },
  { key: "plays", label: "Mais tocadas" },
  { key: "likes", label: "Mais curtidas" },
];

// "Como você está se sentindo hoje?" — cada humor leva a um ritmo do acervo.
const MOODS: { rhythm: Rhythm; label: string; emoji: string; from: string; to: string }[] = [
  { rhythm: "arrocha", label: "Sofrência", emoji: "💔", from: "#9B2B1B", to: "#DA2D1F" },
  { rhythm: "pagode", label: "Mesa de bar", emoji: "🍻", from: "#0B8A3D", to: "#1E6F3C" },
  { rhythm: "sertanejo", label: "Modão", emoji: "🤠", from: "#B8860B", to: "#E8920E" },
  { rhythm: "brega", label: "Romântico", emoji: "🌹", from: "#1E40AF", to: "#2949D6" },
];

/**
 * Espalha as faixas para que músicas do mesmo artista não fiquem
 * uma do lado da outra: agrupa por artista e intercala em round-robin.
 */
function spreadByArtist(tracks: Track[]): Track[] {
  const groups = new Map<string, Track[]>();
  for (const t of tracks) {
    const key = t.artist.toLowerCase();
    const bucket = groups.get(key) ?? [];
    bucket.push(t);
    groups.set(key, bucket);
  }
  const buckets = [...groups.values()];
  const out: Track[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const bucket of buckets) {
      const next = bucket.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

export function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const text = params.get("q") ?? "";
  const [rhythms, setRhythms] = useState<Rhythm[]>([]);
  const [sort, setSort] = useState("recent");

  const filters = { rhythms, text, sort };
  const { data, isLoading } = useQuery({
    queryKey: ["tracks", filters],
    queryFn: () => fetchTracks(filters),
  });

  const { data: recentTracks = [] } = useQuery({
    queryKey: ["tracks", "recent"],
    queryFn: () => fetchTracks({ rhythms: [], text: "", sort: "recent" }),
    select: (res) => spreadByArtist(res.items).slice(0, 14),
  });
  const { data: trendingArtists = [] } = useQuery({
    queryKey: ["artists", "trending"],
    queryFn: () => fetchTrendingArtists(12),
  });
  const { data: trendingAlbums = [] } = useQuery({
    queryKey: ["albums", "trending"],
    queryFn: () => fetchTrendingAlbums({ limit: 12 }),
  });
  const { data: hotPlaylists = [] } = useQuery({
    queryKey: ["playlists", "trending"],
    queryFn: fetchPlaylists,
    select: (items) => items.slice(0, 10),
  });

  const setText = (v: string) =>
    setParams(v ? { q: v } : {}, { replace: true });

  const toggleRhythm = (r: Rhythm) =>
    setRhythms((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  // Mesmo artista nunca colado: espalha as faixas do resultado principal.
  const tracks = spreadByArtist(data?.items ?? []);

  return (
    <div>
      {/* header com gradiente (estilo capa do app) */}
      <header
        className="page-hero relative px-6 pb-10 pt-14 sm:px-10"
        style={{ ["--hero" as string]: "#E8920E" }}
      >
        <HeroMotifs />
        <p className="text-base font-bold uppercase tracking-wide text-boteco-yellow">
          Curadoria por ritmo
        </p>
        <h1 className="font-display text-5xl text-boteco-ink drop-shadow sm:text-7xl">
          Descobrir o som do boteco
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-boteco-muted sm:text-xl">
          Brega, pagode, sertanejo e arrocha — direto da mesa. 🍻
        </p>
      </header>

      <div className="space-y-10 px-6 pb-12 sm:px-10">
        {/* Como você está se sentindo hoje? */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-boteco-ink sm:text-3xl">
            Como você está se sentindo hoje?
          </h2>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {MOODS.map((m) => (
              <button
                key={m.rhythm}
                onClick={() => setRhythms([m.rhythm])}
                className={`relative flex h-28 w-44 shrink-0 items-end overflow-hidden rounded-2xl p-4 text-left shadow-lg shadow-black/20 transition hover:scale-[1.03] sm:w-52 ${
                  rhythms.length === 1 && rhythms[0] === m.rhythm ? "ring-2 ring-boteco-yellow" : ""
                }`}
                style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}
              >
                <span className="absolute right-3 top-2 text-4xl drop-shadow">{m.emoji}</span>
                <span className="font-display text-xl text-white drop-shadow">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {recentTracks.length > 0 && (
          <Carousel title="Recentes">
            {recentTracks.map((t) => (
              <TrackTile key={t.id} track={t} queue={recentTracks} />
            ))}
          </Carousel>
        )}

        {trendingArtists.length > 0 && (
          <Carousel title="Artistas do Momento">
            {trendingArtists.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </Carousel>
        )}

        {trendingAlbums.length > 0 && (
          <Carousel title="Recomendações de Álbuns">
            {trendingAlbums.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </Carousel>
        )}

        {hotPlaylists.length > 0 && (
          <Carousel title="Playlists em Alta">
            {hotPlaylists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} className="w-56 shrink-0 sm:w-64" />
            ))}
          </Carousel>
        )}

        {/* busca + filtros */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex max-w-lg flex-1 items-center gap-3 rounded-full bg-white/5 px-5 py-3 text-boteco-muted ring-1 ring-white/10 focus-within:ring-white/30">
            <SearchIcon size={22} className="text-boteco-yellow" />
            <input
              className="w-full bg-transparent text-lg text-boteco-ink placeholder:text-boteco-muted outline-none"
              placeholder="Buscar por título ou artista…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {RHYTHMS.map((r) => (
              <button
                key={r}
                onClick={() => toggleRhythm(r)}
                className={`chip px-4 py-2 text-sm ${
                  rhythms.includes(r)
                    ? "border-boteco-green-light bg-boteco-green text-white"
                    : "border-white/15 text-boteco-muted hover:border-white/40 hover:text-boteco-ink"
                }`}
              >
                {RHYTHM_LABEL[r]}
              </button>
            ))}
            <select
              className="ml-auto rounded-full border border-white/15 bg-boteco-card px-4 py-2 text-base text-boteco-ink outline-none lg:ml-2"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key} className="bg-boteco-card">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-lg text-boteco-muted">Carregando o acervo…</p>
        ) : tracks.length === 0 ? (
          <p className="text-lg text-boteco-muted">Nenhuma faixa encontrada com esses filtros.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {tracks.map((t) => (
              <TrackTile key={t.id} track={t} queue={tracks} className="w-full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
