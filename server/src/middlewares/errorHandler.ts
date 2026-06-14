import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";
import { AppError } from "../errors/AppError.js";

/** 404 para rotas não encontradas. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Rota não encontrada." } });
};

/**
 * Tratamento central de erros. Traduz exceções de domínio (AppError),
 * erros do Multer e duplicidade do Mongo em respostas HTTP coerentes.
 * A regra de negócio nunca conhece `res` — só lança erros.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Arquivo excede o tamanho máximo permitido." : err.message;
    res.status(422).json({ error: { code: "UPLOAD_ERROR", message } });
    return;
  }

  // Índice único do Mongo (ex.: RN02/RN05/RN07 em corrida).
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({ error: { code: "CONFLICT", message: "Registro duplicado." } });
    return;
  }

  console.error("[error]", err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Erro interno do servidor." } });
};
