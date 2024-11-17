import { FastifyReply } from "fastify";
import { ZodError } from "zod";
type ZodErrorRecordString = Record<string, string>;
type ZodErrorRecord = Record<string, string | ZodErrorRecordString>;
function getZodErrorFieldsFromZodError(e: ZodError) {
  let errorsObj: ZodErrorRecord = {};
  for (const issue of e.issues) {
    if (issue.path.length === 1) {
      errorsObj[issue.path[0]] = issue.message;
    } else {
      const mainKey = issue.path[0];
      let result: Record<string, any> = {};
      let curr = result;
      for (let i = 1; i < issue.path.length; i++) {
        const k = issue.path[i];
        if (i === issue.path.length - 1) {
          curr[k] = issue.message;
        } else {
          curr[k] = {};
          curr = curr[k];
        }
      }
      errorsObj[mainKey] = errorsObj[mainKey]
        ? Object.assign(errorsObj[mainKey], result)
        : result;
    }
  }
  return errorsObj;
}
export function prettyError(e: ZodError) {
  const err = e.flatten().fieldErrors;
  const fieldsError = getZodErrorFieldsFromZodError(e);
  return {
    errors: Object.values(err).flat(),
    fields: fieldsError,
  };
}

export class KnownError extends Error {
  errorMessage: string | string[] | undefined;
  timeout: number | undefined;
  type: "warn" | "error";
  statusCode: number;
  constructor(
    msg?: string | string[] | undefined,
    type: "warn" | "error" = "error",
    statusCode: number = 500
  ) {
    super();
    this.errorMessage = msg;
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

export const fastifyErrorHandler = (
  res: FastifyReply,
  error: KnownError | CriticalError | RedirectError
) => {
  switch (error.name) {
    case "REDIRECT_ERR":
    case "CRITICAL_ERR":
    case "KNOWN_ERR":
    case "ZodError":
    default: {
    }
  }
  res.status(500).send("Internal server error");
  return;
};
