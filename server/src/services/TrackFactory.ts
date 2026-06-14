import type { Rhythm } from "../models/enums.js";

/**
 * Padrão Factory Method.
 *
 * Cria o objeto de domínio "atributos de faixa" a partir de fontes diferentes
 * (upload de arquivo local ou URL externa), centralizando os valores padrão e
 * mantendo o TrackService livre dos detalhes de montagem.
 */
export interface NewTrackInput {
  title: string;
  artist: string;
  rhythm: Rhythm;
  durationSec?: number;
  coverUrl?: string;
  uploadedBy: string;
}

export interface TrackAttrsToPersist extends NewTrackInput {
  audioUrl: string;
  status: "active";
  playsCount: number;
  likesCount: number;
}

export abstract class TrackFactory {
  abstract resolveAudioUrl(): string;

  build(input: NewTrackInput): TrackAttrsToPersist {
    return {
      ...input,
      coverUrl: input.coverUrl ?? "",
      durationSec: input.durationSec ?? 0,
      audioUrl: this.resolveAudioUrl(),
      status: "active",
      playsCount: 0,
      likesCount: 0,
    };
  }
}

/** Faixa cujo áudio já foi salvo pelo StorageService (upload de arquivo). */
export class UploadedTrackFactory extends TrackFactory {
  constructor(private readonly storedAudioUrl: string) {
    super();
  }
  resolveAudioUrl(): string {
    return this.storedAudioUrl;
  }
}

/** Faixa apontando para um áudio já hospedado externamente (URL). */
export class ExternalTrackFactory extends TrackFactory {
  constructor(private readonly externalUrl: string) {
    super();
  }
  resolveAudioUrl(): string {
    return this.externalUrl;
  }
}
