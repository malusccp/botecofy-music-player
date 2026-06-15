import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlaylist, fetchPlaylists } from "../lib/queries";
import { RHYTHMS, RHYTHM_LABEL, type Rhythm } from "../types";
import { RhythmBadge } from "../components/RhythmBadge";
import { useIsCurator } from "../auth/useMe";

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
    <section className="space-y-6">
      <h1 className="font-display text-3xl text-boteco-green-dark">Playlists temáticas</h1>

      {canCurate && (
        <div className="card p-4 space-y-3">
          <h2 className="font-semibold">Nova playlist (curadoria)</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              className="rounded-lg bg-boteco-cream border border-boteco-ink/15 px-3 py-2"
              placeholder="Nome da playlist"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="rounded-lg bg-boteco-cream border border-boteco-ink/15 px-3 py-2"
              placeholder="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
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
                    ? "bg-boteco-green text-white border-boteco-green"
                    : "border-boteco-ink/20 text-boteco-muted"
                }`}
              >
                {RHYTHM_LABEL[r]}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-boteco-red">{error}</p>}
          <button
            className="btn-primary"
            disabled={create.isPending || !name || rhythms.length === 0}
            onClick={() => create.mutate()}
          >
            Criar playlist
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((p) => (
          <Link key={p.id} to={`/playlists/${p.id}`} className="card p-4 hover:border-boteco-green/40 transition">
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-sm text-boteco-muted mb-3">{p.description || "Sem descrição"}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {p.rhythms.map((r) => (
                <RhythmBadge key={r} rhythm={r} />
              ))}
            </div>
            <span className="text-xs text-boteco-muted">{p.trackCount} faixas</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
