import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { StorageService, StoredFile } from "./StorageService.js";

/**
 * Implementação concreta do StorageService que grava em disco local.
 * URL pública servida estaticamente por `/uploads`.
 */
export class LocalStorageService implements StorageService {
  constructor(private readonly baseDir: string, private readonly publicBase = "/uploads") {}

  async save(file: StoredFile, folder: string): Promise<string> {
    const dir = path.join(this.baseDir, folder);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(file.originalName) || this.extFromMime(file.mimeType);
    const name = `${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(dir, name), file.buffer);

    return `${this.publicBase}/${folder}/${name}`;
  }

  private extFromMime(mime: string): string {
    if (mime.includes("mpeg") || mime.includes("mp3")) return ".mp3";
    if (mime.includes("aac")) return ".aac";
    if (mime.includes("png")) return ".png";
    if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
    return "";
  }
}
