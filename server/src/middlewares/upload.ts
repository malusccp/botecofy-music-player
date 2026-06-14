import multer from "multer";
import { env } from "../config/env.js";

/**
 * Upload de áudio e capa em memória (Multer). Validação de tipo (RN08) e a
 * persistência ficam no StorageService/serviço — aqui só recebemos o arquivo.
 */
const AUDIO_MIME = ["audio/mpeg", "audio/mp3", "audio/aac", "audio/x-m4a"];
const IMAGE_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxAudioBytes }, // RN08: limite de tamanho
  fileFilter: (_req, file, cb) => {
    const allowed = file.fieldname === "audio" ? AUDIO_MIME : IMAGE_MIME;
    if (!allowed.includes(file.mimetype)) {
      cb(new Error(`Formato não suportado para "${file.fieldname}": ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

/** Aceita um arquivo de áudio (obrigatório) e uma capa (opcional). */
export const uploadTrackFiles = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);
