import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchModerationTracks, moderateTrack } from "../lib/queries";
import { RhythmBadge } from "../components/RhythmBadge";
import { useIsAdmin } from "../auth/useMe";

export function ModerationPage() {
  const isAdmin = useIsAdmin();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["moderation"],
    queryFn: fetchModerationTracks,
    enabled: isAdmin,
  });

  const moderate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "deactivate" | "reactivate" }) =>
      moderateTrack(id, action, action === "deactivate" ? "Conteúdo fora da curadoria" : "Revisado"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation"] });
      qc.invalidateQueries({ queryKey: ["tracks"] });
    },
  });

  if (!isAdmin) {
    return <p className="text-boteco-muted">Área restrita a administradores (RN03).</p>;
  }

  const tracks = data?.items ?? [];

  return (
    <section className="space-y-4">
      <h1 className="font-display text-3xl text-boteco-green-dark">Moderação do acervo</h1>
      <p className="text-boteco-muted">
        Inativar tira a faixa das buscas e impede que seja adicionada a playlists (RN04).
      </p>

      {isLoading ? (
        <p className="text-boteco-muted">Carregando…</p>
      ) : (
        <div className="card divide-y divide-boteco-ink/10">
          {tracks.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {t.title} <span className="text-boteco-muted">— {t.artist}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RhythmBadge rhythm={t.rhythm} />
                  <span
                    className={`chip ${
                      t.status === "active"
                        ? "border-boteco-green/40 text-boteco-green-dark"
                        : "border-boteco-red/40 text-boteco-red"
                    }`}
                  >
                    {t.status === "active" ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </div>
              {t.status === "active" ? (
                <button
                  className="btn-ghost text-boteco-red border-boteco-red/40"
                  onClick={() => moderate.mutate({ id: t.id, action: "deactivate" })}
                >
                  Inativar
                </button>
              ) : (
                <button
                  className="btn-ghost text-boteco-green-dark border-boteco-green/40"
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
