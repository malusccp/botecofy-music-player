import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTracks, type TrackFilters } from "../lib/queries";
import { RHYTHMS, RHYTHM_LABEL, type Rhythm } from "../types";
import { TrackCard } from "../components/TrackCard";

const SORTS = [
  { key: "recent", label: "Mais recentes" },
  { key: "plays", label: "Mais tocadas" },
  { key: "likes", label: "Mais curtidas" },
];

export function DiscoverPage() {
  const [filters, setFilters] = useState<TrackFilters>({ rhythms: [], text: "", sort: "recent" });

  const { data, isLoading } = useQuery({
    queryKey: ["tracks", filters],
    queryFn: () => fetchTracks(filters),
  });

  const toggleRhythm = (r: Rhythm) =>
    setFilters((f) => ({
      ...f,
      rhythms: f.rhythms.includes(r) ? f.rhythms.filter((x) => x !== r) : [...f.rhythms, r],
    }));

  const tracks = data?.items ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-boteco-amber">Descobrir o som do boteco</h1>
        <p className="text-boteco-cream/60">Curadoria por ritmo: brega, pagode, sertanejo e arrocha.</p>
      </div>

      <div className="card p-4 space-y-3">
        <input
          className="w-full rounded-lg bg-boteco-bg border border-white/10 px-3 py-2"
          placeholder="Buscar por título ou artista…"
          value={filters.text}
          onChange={(e) => setFilters((f) => ({ ...f, text: e.target.value }))}
        />
        <div className="flex flex-wrap items-center gap-2">
          {RHYTHMS.map((r) => (
            <button
              key={r}
              onClick={() => toggleRhythm(r)}
              className={`chip ${
                filters.rhythms.includes(r)
                  ? "bg-boteco-amber text-boteco-bg border-boteco-amber"
                  : "border-white/15 text-boteco-cream/70"
              }`}
            >
              {RHYTHM_LABEL[r]}
            </button>
          ))}
          <span className="ml-auto text-sm text-boteco-cream/60">Ordenar:</span>
          <select
            className="rounded-lg bg-boteco-bg border border-white/10 px-2 py-1 text-sm"
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-boteco-cream/60">Carregando o acervo…</p>
      ) : tracks.length === 0 ? (
        <p className="text-boteco-cream/60">Nenhuma faixa encontrada com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tracks.map((t) => (
            <TrackCard key={t.id} track={t} queue={tracks} />
          ))}
        </div>
      )}
    </section>
  );
}
