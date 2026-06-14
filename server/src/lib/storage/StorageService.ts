/**
 * Abstração de armazenamento de arquivos (SOLID/DIP).
 *
 * O TrackService depende desta interface, não de disco/S3 concretos. Trocar o
 * armazenamento local por nuvem no futuro não afeta as regras de negócio.
 */
export interface StoredFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StorageService {
  /** Persiste o arquivo e devolve a URL pública para reprodução/exibição. */
  save(file: StoredFile, folder: string): Promise<string>;
}
