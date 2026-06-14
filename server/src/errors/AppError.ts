/**
 * Exceções de domínio. Os serviços lançam estes erros; o middleware central
 * (errorHandler) traduz para resposta HTTP. Mantém regra de negócio sem
 * conhecer `req`/`res` (separação de responsabilidades).
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = "APP_ERROR"
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, message, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado.") {
    super(404, message, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Ação não permitida.") {
    super(403, message, "FORBIDDEN");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Autenticação necessária.") {
    super(401, message, "UNAUTHORIZED");
  }
}
