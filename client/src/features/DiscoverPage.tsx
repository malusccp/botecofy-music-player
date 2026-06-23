import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTracks, fetchTrendingArtists, fetchTrendingAlbums, fetchPlaylists } from "../lib/queries";
import { type Rhythm, type Track } from "../types";
import { TrackTile } from "../components/TrackTile";
import { Carousel } from "../components/Carousel";
import { ArtistCard } from "../components/ArtistCard";
import { AlbumCard } from "../components/AlbumCard";
import { PlaylistCard } from "../components/PlaylistCard";

// "Acesso rápido" — cada humor leva a uma playlist real do ritmo.
const MOODS: { rhythm: Rhythm; label: string; from: string; to: string }[] = [
  { rhythm: "arrocha", label: "Sofrência", from: "#9B2B1B", to: "#DA2D1F" },
  { rhythm: "pagode", label: "Mesa de bar", from: "#0B8A3D", to: "#1E6F3C" },
  { rhythm: "sertanejo", label: "Modão", from: "#B8860B", to: "#E8920E" },
  { rhythm: "brega", label: "Romântico", from: "#1E40AF", to: "#2949D6" },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

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
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const text = (params.get("q") ?? "").trim();

  // Resultados da busca do topo (só busca quando há texto).
  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ["tracks", "search", text],
    queryFn: () => fetchTracks({ rhythms: [], text, sort: "recent" }),
    enabled: text.length > 0,
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
  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists"],
    queryFn: fetchPlaylists,
  });
  const hotPlaylists = playlists.slice(0, 10);

  // Tile de acesso rápido → playlist real daquele ritmo (ou página de playlists).
  const goToMood = (rhythm: Rhythm) => {
    const match = playlists.find((p) => p.rhythms.includes(rhythm));
    navigate(match ? `/playlists/${match.id}` : "/playlists");
  };

  const searchResults = spreadByArtist(searchData?.items ?? []);

  return (
    <div className="space-y-10 px-6 pb-12 pt-8 sm:px-10">
      {text ? (
        /* visão de resultados da busca do topo */
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-boteco-ink sm:text-3xl">
            Resultados para “{text}”
          </h2>
          {isSearching ? (
            <p className="text-lg text-boteco-muted">Buscando…</p>
          ) : searchResults.length === 0 ? (
            <p className="text-lg text-boteco-muted">Nenhuma faixa encontrada para “{text}”.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {searchResults.map((t) => (
                <TrackTile key={t.id} track={t} queue={searchResults} className="w-full" />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* home curada */
        <>
          {/* saudação + acesso rápido (estilo capa do app) */}
          <section className="space-y-5">
            <h1 className="font-display text-3xl text-boteco-ink sm:text-4xl">{greeting()} 🍻</h1>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MOODS.map((m) => (
                <button
                  key={m.rhythm}
                  onClick={() => goToMood(m.rhythm)}
                  className="group flex items-center gap-3 overflow-hidden rounded-lg bg-white/5 text-left ring-1 ring-white/5 transition hover:bg-white/10"
                >
                  <div
                    className="h-16 w-16 shrink-0"
                    style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}
                  />
                  <span className="truncate pr-3 font-bold text-boteco-ink">{m.label}</span>
                </button>
              ))}
            </div>
          </section>

          {recentTracks.length > 0 && (
            <Carousel title="Tocados recentemente">
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
        </>
      )}
    </div>
  );
}
