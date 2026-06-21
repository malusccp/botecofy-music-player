import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlaylist, fetchPlaylists } from "../lib/queries";
import { RHYTHMS, RHYTHM_LABEL, type Rhythm } from "../types";
import { useIsCurator } from "../auth/useMe";
import { PlusIcon } from "../components/icons";
import { HeroMotifs } from "../components/HeroMotifs";
import { PlaylistCard } from "../components/PlaylistCard";

export function PlaylistsPage() {
  const canCurate = useIsCurator();
  const qc = useQueryClient();

  const { data: playlists = [] } = useQuery({ queryKey: ["playlists"], queryFn: fetchPlaylists });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rhythms, setRhythms] = useState<Rhythm[]>([]);
  const [error, setError] = useState("");

  const create = useMutation({
    mutationFn: () => createPlaylist({ name, description, rhythms, isPublic: true }),
    onSuccess: () => {
      setName("");
      setDescription("");
      setRhythms([]);
      setError("");
      qc.invalidateQueries({ queryKey: ["playlists"] });
    },
    onError: (e: any) => setError(e?.response?.data?.error?.message ?? "Erro ao criar playlist."),
  });

  return (
    <div>
      <header
        className="page-hero relative px-6 pb-10 pt-14 sm:px-10"
        style={{ ["--hero" as string]: "#2949D6" }}
      >
        <HeroMotifs />
        <p className="text-base font-bold uppercase tracking-wide text-boteco-ink/80">
          Coleções temáticas
        </p>
        <h1 className="font-display text-5xl text-boteco-ink sm:text-7xl">Playlists do boteco</h1>
        <p className="mt-3 max-w-2xl text-lg text-boteco-muted sm:text-xl">
          Selecionadas por ritmo para cada momento da mesa.
        </p>
      </header>

      <div className="space-y-10 px-6 pb-12 sm:px-10">
        {canCurate && (
          <div className="card !bg-boteco-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-boteco-ink">
              <PlusIcon size={22} /> Nova playlist (curadoria)
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="field"
                placeholder="Nome da playlist"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="field"
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {RHYTHMS.map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    setRhythms((prev) =>
                      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
                    )
                  }
                  className={`chip ${
                    rhythms.includes(r)
                      ? "border-boteco-green-light bg-boteco-green text-white"
                      : "border-white/15 text-boteco-muted hover:border-white/40 hover:text-boteco-ink"
                  }`}
                >
                  {RHYTHM_LABEL[r]}
                </button>
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-boteco-red-light">{error}</p>}
            <button
              className="btn-primary mt-4"
              disabled={create.isPending || !name || rhythms.length === 0}
              onClick={() => create.mutate()}
            >
              Criar playlist
            </button>
          </div>
        )}

        {playlists.length === 0 ? (
          <p className="text-boteco-muted">Ainda não há playlists públicas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
