/**
 * Padrão Observer.
 *
 * O domínio (serviços) emite eventos de negócio sem conhecer Socket.io.
 * Observadores (ex.: a camada de sockets) se inscrevem e reagem. Isso mantém
 * a regra de negócio desacoplada do transporte em tempo real (baixo
 * acoplamento + ocultamento de informação).
 */
export type DomainEvent =
  | { type: "track:liked"; trackId: string; likesCount: number }
  | { type: "track:played"; trackId: string; playsCount: number };

type Listener = (event: DomainEvent) => void;

export class RealtimeNotifier {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: DomainEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}
