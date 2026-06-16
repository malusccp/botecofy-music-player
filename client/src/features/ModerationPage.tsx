import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchModerationTracks, moderateTrack } from "../lib/queries";
import { RhythmBadge } from "../components/RhythmBadge";
import { useIsAdmin } from "../auth/useMe";
import { MusicIcon, ShieldIcon } from "../components/icons";

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
    return (
      <div className="p-6">
        <p className="rounded-xl bg-boteco-card p-5 text-boteco-muted">
          Área restrita a administradores (RN03).
        </p>
      </div>
    );
  }

  const tracks = data?.items ?? [];

  return (
    <div>
      <header className="page-hero px-6 pb-8 pt-12 sm:px-10" style={{ ["--hero" as string]: "#DA2D1F" }}>
        <p className="text-base font-bold uppercase tracking-wide text-boteco-ink/80">Administração</p>
        <h1 className="flex items-center gap-4 font-display text-5xl text-boteco-ink sm:text-6xl">
          <ShieldIcon size={42} /> Moderação do acervo
        </h1>
        <p className="mt-3 text-lg text-boteco-muted">
          Inativar tira a faixa das buscas e impede que entre em playlists (RN04).
        </p>
      </header>

      <div className="px-6 pb-12 sm:px-10">
        {isLoading ? (
          <p className="text-lg text-boteco-muted">Carregando…</p>
        ) : tracks.length === 0 ? (
          <p className="text-lg text-boteco-muted">Nenhuma faixa no acervo.</p>
        ) : (
          <div className="overflow-hidden rounded-xl bg-boteco-card">
            {tracks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 border-b border-white/5 p-5 last:border-0"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded bg-gradient-to-br from-boteco-blue-bright/50 to-boteco-green/30">
                  {t.coverUrl ? (
                    <img src={t.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <MusicIcon size={22} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-boteco-ink">
                    {t.title} <span className="text-boteco-muted">— {t.artist}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <RhythmBadge rhythm={t.rhythm} />
                    <span
                      className={`chip ${
                        t.status === "active"
                          ? "border-boteco-green-light/40 text-boteco-green-light"
                          : "border-boteco-red-light/40 text-boteco-red-light"
                      }`}
                    >
                      {t.status === "active" ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </div>
                {t.status === "active" ? (
                  <button
                    className="btn-ghost border-boteco-red-light/40 text-boteco-red-light hover:bg-boteco-red-light/10"
                    onClick={() => moderate.mutate({ id: t.id, action: "deactivate" })}
                  >
                    Inativar
                  </button>
                ) : (
                  <button
                    className="btn-ghost border-boteco-green-light/40 text-boteco-green-light hover:bg-boteco-green-light/10"
                    onClick={() => moderate.mutate({ id: t.id, action: "reactivate" })}
                  >
                    Reativar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
