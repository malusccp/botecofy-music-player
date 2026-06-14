import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchModerationTracks, moderateTrack } from "../lib/queries";
import { RhythmBadge } from "../components/RhythmBadge";
import { useSession } from "../auth/SessionContext";

export function ModerationPage() {
  const { session } = useSession();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["moderation"],
    queryFn: fetchModerationTracks,
    enabled: session?.role === "admin",
  });

  const moderate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "deactivate" | "reactivate" }) =>
      moderateTrack(id, action, action === "deactivate" ? "Conteúdo fora da curadoria" : "Revisado"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation"] });
      qc.invalidateQueries({ queryKey: ["tracks"] });
    },
  });

  if (session?.role !== "admin") {
    return <p className="text-boteco-cream/60">Área restrita a administradores (RN03).</p>;
  }

  const tracks = data?.items ?? [];

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl text-boteco-amber">Moderação do acervo</h1>
      <p className="text-boteco-cream/60">
        Inativar tira a faixa das buscas e impede que seja adicionada a playlists (RN04).
      </p>

      {isLoading ? (
        <p className="text-boteco-cream/60">Carregando…</p>
      ) : (
        <div className="card divide-y divide-white/5">
          {tracks.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {t.title} <span className="text-boteco-cream/50">— {t.artist}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RhythmBadge rhythm={t.rhythm} />
                  <span
                    className={`chip ${
                      t.status === "active"
                        ? "border-emerald-500/40 text-emerald-300"
                        : "border-rose-500/40 text-rose-300"
                    }`}
                  >
                    {t.status === "active" ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>
              {t.status === "active" ? (
                <button
                  className="btn-ghost text-rose-300 border-rose-400/40"
                  onClick={() => moderate.mutate({ id: t.id, action: "deactivate" })}
                >
                  Inativar
                </button>
              ) : (
                <button
                  className="btn-ghost text-emerald-300 border-emerald-400/40"
                  onClick={() => moderate.mutate({ id: t.id, action: "reactivate" })}
                >
                  Reativar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
