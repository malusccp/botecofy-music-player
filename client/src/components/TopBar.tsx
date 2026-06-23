import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { HomeIcon, SearchIcon } from "./icons";

function Brand() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-3">
      <img
        src="/logo.png"
        alt="Botecofy"
        className="h-14 w-14 rounded-full bg-white object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <span className="hidden font-brand text-3xl text-boteco-ink sm:inline">
        Boteco<span className="text-boteco-red-light">fy</span>
      </span>
    </Link>
  );
}

export function TopBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const urlQ = params.get("q") ?? "";
  // Texto digitado (resposta imediata). A URL `?q=` é a fonte da verdade da busca.
  const [q, setQ] = useState(urlQ);

  // Mantém o campo em sincronia quando a URL muda por fora (logo, limpar, voltar).
  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  // Busca enquanto digita, com debounce: só atualiza a URL/resultados após uma pausa.
  useEffect(() => {
    if (q === urlQ) return;
    const id = setTimeout(() => {
      navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/", { replace: true });
    }, 250);
    return () => clearTimeout(id);
  }, [q, urlQ, navigate]);

  const clear = () => {
    setQ("");
    navigate("/", { replace: true });
  };

  return (
    <header className="flex h-20 shrink-0 items-center gap-5 px-3 sm:px-5">
      <Brand />

      <div className="flex flex-1 items-center justify-center gap-3">
        <Link
          to="/"
          title="Início"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-boteco-panel text-boteco-ink
            transition hover:scale-105 hover:text-boteco-green-light"
        >
          <HomeIcon size={30} />
        </Link>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full max-w-2xl items-center gap-3 rounded-full bg-white/10 px-5 py-4
            text-boteco-muted ring-2 ring-boteco-yellow/20 transition hover:bg-white/[0.14] focus-within:ring-boteco-yellow/60"
        >
          <SearchIcon size={26} className="text-boteco-yellow" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="O que você quer ouvir?"
            className="w-full bg-transparent text-lg text-boteco-ink placeholder:text-boteco-muted outline-none"
          />
          {q && (
            <button
              type="button"
              onClick={clear}
              aria-label="Limpar busca"
              className="shrink-0 text-boteco-muted transition hover:text-boteco-ink"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
