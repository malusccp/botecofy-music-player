import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTracks } from "../lib/queries";
import { RHYTHMS, RHYTHM_LABEL, type Rhythm } from "../types";
import { TrackCard } from "../components/TrackCard";
import { SearchIcon } from "../components/icons";
import { HeroMotifs } from "../components/HeroMotifs";

const SORTS = [
  { key: "recent", label: "Mais recentes" },
  { key: "plays", label: "Mais tocadas" },
  { key: "likes", label: "Mais curtidas" },
];

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

  const setText = (v: string) =>
    setParams(v ? { q: v } : {}, { replace: true });

  const toggleRhythm = (r: Rhythm) =>
    setRhythms((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const tracks = data?.items ?? [];

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

      <div className="space-y-8 px-6 pb-12 sm:px-10">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {tracks.map((t) => (
              <TrackCard key={t.id} track={t} queue={tracks} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
