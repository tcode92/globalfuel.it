import { FastifyReply } from "fastify";
import { ZodError } from "zod";

export class KnownError extends Error {
  errorMessage: string | string[];
  timeout: number | undefined;
  type: "warn" | "error";
  statusCode: number;
  constructor(
    msg?: string | string[] | undefined,
    type: "warn" | "error" = "error",
    statusCode: number = 500
  ) {
    super();
    this.errorMessage = msg ?? "Errore sconosciuto.";
    this.name = "KNOWN_ERR";
    this.statusCode = statusCode;
    this.type = type;
  }
}
export class CriticalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CRITICAL_ERR";
  }
}

export class RedirectError extends Error {
  statusCode: number;
  url: string;
  constructor(url: string, statusCode: number = 307) {
    super();
    this.name = "REDIRECT_ERR";
    this.statusCode = statusCode;
    this.url = url;
  }
}

export const handleError = (
  res: FastifyReply,
  error: KnownError | CriticalError | RedirectError
) => {
  if (isRedirectError(error)) {
    return res.redirect(error.url, error.statusCode);
  }

  if (isKnownError(error)) {
    // return the response to the user
    return res.status(error.statusCode).send({
      error: {
        message: error.errorMessage ?? "Errore interno.",
        type: error.type,
        timeout: error.timeout || 5000,
      },
    });
  }
  if (isZodError(error)) {
    // let fastify error handler handle this
    throw error;
  }
  if (isCriticalError(error)) {
    // Let fastify handle the critical error so we recive notifications
    throw error;
  }

  return res.status(500).send("Errore interno.");
};

function isRedirectError(error: any): error is RedirectError {
  return error?.name === "REDIRECT_ERR";
}

function isCriticalError(error: any): error is CriticalError {
  return error?.name === "CRITICAL_ERR";
}

function isKnownError(error: any): error is KnownError {
  return error?.name === "KNOWN_ERR";
}
function isZodError(error: any): error is ZodError {
  return error?.name === "ZodError";
}

export function anyToIntOrThrow(param: any, err: string) {
  let n: number = parseInt(param);
  if (isNaN(n) || n < 1) {
    throw new KnownError(err, "error", 400);
  }
  return n;
}
