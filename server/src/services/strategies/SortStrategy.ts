/**
 * Padrão Strategy + SOLID/OCP.
 *
 * Cada estratégia de ordenação da descoberta (HU02) encapsula um critério.
 * Adicionar uma nova ordenação = registrar uma nova estratégia, SEM alterar
 * o TrackService ou o TrackRepository (aberto para extensão, fechado para
 * modificação).
 */
export interface SortStrategy {
  readonly key: string;
  toMongoSort(): Record<string, 1 | -1>;
}

class RecentFirstStrategy implements SortStrategy {
  readonly key = "recent";
  toMongoSort() {
    return { createdAt: -1 as const };
  }
}

class MostPlayedStrategy implements SortStrategy {
  readonly key = "plays";
  toMongoSort() {
    return { playsCount: -1 as const };
  }
}

class MostLikedStrategy implements SortStrategy {
  readonly key = "likes";
  toMongoSort() {
    return { likesCount: -1 as const };
  }
}

const STRATEGIES: SortStrategy[] = [
  new RecentFirstStrategy(),
  new MostPlayedStrategy(),
  new MostLikedStrategy(),
];

const DEFAULT_STRATEGY = STRATEGIES[0];

/** Seleciona a estratégia pela chave; cai no padrão (mais recentes) se inválida. */
export function resolveSort(key?: string): Record<string, 1 | -1> {
  const strategy = STRATEGIES.find((s) => s.key === key) ?? DEFAULT_STRATEGY;
  return strategy.toMongoSort();
}

export const availableSortKeys = STRATEGIES.map((s) => s.key);
