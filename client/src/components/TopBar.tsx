import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <span className="hidden font-display text-3xl text-boteco-ink sm:inline">
        Boteco<span className="text-boteco-red-light">fy</span>
      </span>
    </Link>
  );
}

export function TopBar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (value: string) => {
    setQ(value);
    navigate(value ? `/?q=${encodeURIComponent(value)}` : "/", { replace: true });
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
            onChange={(e) => onSearch(e.target.value)}
            placeholder="O que você quer ouvir?"
            className="w-full bg-transparent text-lg text-boteco-ink placeholder:text-boteco-muted outline-none"
          />
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
