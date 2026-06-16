import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadTrack } from "../lib/queries";
import { RHYTHMS, RHYTHM_LABEL, type Rhythm } from "../types";
import { useIsCurator } from "../auth/useMe";
import { UploadIcon } from "../components/icons";

export function UploadPage() {
  const canCurate = useIsCurator();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [rhythm, setRhythm] = useState<Rhythm>("pagode");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("title", title);
      form.append("artist", artist);
      form.append("rhythm", rhythm);
      if (audio) form.append("audio", audio);
      if (cover) form.append("cover", cover);
      return uploadTrack(form);
    },
    onSuccess: () => {
      setMessage(`Faixa "${title}" cadastrada no acervo! 🎶`);
      setError("");
      setTitle("");
      setArtist("");
      setAudio(null);
      setCover(null);
      qc.invalidateQueries({ queryKey: ["tracks"] });
    },
    onError: (e: any) => {
      setError(e?.response?.data?.error?.message ?? "Erro ao cadastrar faixa.");
      setMessage("");
    },
  });

  if (!canCurate) {
    return (
      <div className="p-6 sm:p-10">
        <p className="rounded-xl bg-boteco-card p-6 text-lg text-boteco-muted">
          Apenas curadores podem enviar faixas (RN03).
        </p>
      </div>
    );
  }

  const fileInput =
    "block w-full text-sm text-boteco-muted file:mr-3 file:rounded-full file:border-0 " +
    "file:bg-boteco-green file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-boteco-green-light hover:file:text-boteco-base file:transition";

  return (
    <div>
      <header className="page-hero px-6 pb-8 pt-12 sm:px-10" style={{ ["--hero" as string]: "#E0A500" }}>
        <p className="text-base font-bold uppercase tracking-wide text-boteco-ink/80">Curadoria</p>
        <h1 className="flex items-center gap-4 font-display text-5xl text-boteco-ink sm:text-6xl">
          <UploadIcon size={44} /> Enviar faixa para o acervo
        </h1>
        <p className="mt-3 text-lg text-boteco-muted">Adicione uma nova música à curadoria do boteco.</p>
      </header>

      <div className="px-6 pb-12 sm:px-10">
        <div className="card !bg-boteco-card max-w-2xl space-y-5 p-7 text-lg">
          <input
            className="field"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="field"
            placeholder="Artista"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
          <select
            className="field"
            value={rhythm}
            onChange={(e) => setRhythm(e.target.value as Rhythm)}
          >
            {RHYTHMS.map((r) => (
              <option key={r} value={r} className="bg-boteco-card">
                {RHYTHM_LABEL[r]}
              </option>
            ))}
          </select>

          <label className="block space-y-1">
            <span className="text-base font-semibold text-boteco-ink">
              Arquivo de áudio (mp3/aac, até 15 MB)
            </span>
            <input
              type="file"
              accept="audio/*"
              className={fileInput}
              onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-base font-semibold text-boteco-ink">Capa (opcional)</span>
            <input
              type="file"
              accept="image/*"
              className={fileInput}
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            />
          </label>

          {message && <p className="text-sm text-boteco-green-light">{message}</p>}
          {error && <p className="text-sm text-boteco-red-light">{error}</p>}

          <button
            className="btn-primary"
            disabled={submit.isPending || !title || !artist || !audio}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? "Enviando…" : "Cadastrar faixa"}
          </button>
        </div>
      </div>
    </div>
  );
}
