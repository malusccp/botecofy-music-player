import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadTrack } from "../lib/queries";
import { RHYTHMS, RHYTHM_LABEL, type Rhythm } from "../types";
import { useSession } from "../auth/SessionContext";

export function UploadPage() {
  const { session } = useSession();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [rhythm, setRhythm] = useState<Rhythm>("pagode");
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canCurate = session?.role === "curator" || session?.role === "admin";

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
    return <p className="text-boteco-cream/60">Apenas curadores podem enviar faixas (RN03).</p>;
  }

  return (
    <section className="max-w-lg space-y-4">
      <h1 className="font-display text-3xl text-boteco-amber">Enviar faixa para o acervo</h1>

      <div className="card p-5 space-y-3">
        <input
          className="w-full rounded-lg bg-boteco-bg border border-white/10 px-3 py-2"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full rounded-lg bg-boteco-bg border border-white/10 px-3 py-2"
          placeholder="Artista"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <select
          className="w-full rounded-lg bg-boteco-bg border border-white/10 px-3 py-2"
          value={rhythm}
          onChange={(e) => setRhythm(e.target.value as Rhythm)}
        >
          {RHYTHMS.map((r) => (
            <option key={r} value={r}>
              {RHYTHM_LABEL[r]}
            </option>
          ))}
        </select>

        <label className="block text-sm text-boteco-cream/70">
          Arquivo de áudio (mp3/aac, até 15 MB)
          <input
            type="file"
            accept="audio/*"
            className="mt-1 block w-full text-sm"
            onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="block text-sm text-boteco-cream/70">
          Capa (opcional)
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </label>

        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          className="btn-primary"
          disabled={submit.isPending || !title || !artist || !audio}
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? "Enviando…" : "Cadastrar faixa"}
        </button>
      </div>
    </section>
  );
}
