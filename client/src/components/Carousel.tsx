import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

/** Fileira horizontal com scroll (carrossel) reutilizada pelas seções de destaque do Descobrir. */
export function Carousel({ title, children }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl text-boteco-ink sm:text-3xl">{title}</h2>
      <div className="no-scrollbar flex gap-5 overflow-x-auto pb-2">{children}</div>
    </section>
  );
}
