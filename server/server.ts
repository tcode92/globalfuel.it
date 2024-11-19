import cookiePlugin from "@fastify/cookie";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { uploadParser } from "./fplugins/busboy";
import { logger } from "./lib/log";
import { privateRouter } from "./src/privateRouter";
import { publicRouter } from "./src/publicRouter";
import { CriticalError, KnownError } from "./utils/error";
import { codetNotification } from "./lib/codet_notif";
import { prettyError } from "@validation/base";
import { mailTrackerRouter } from "./src/email/router";
import { ROLES } from "@constants";
import { IncomingMessage, ServerResponse } from "http";
const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "dd-mm-yyyy HH:MM:ss:ms",
        ignore: "pid,hostname",
        singleLine: true,
      },
    },
  },
  production: logger,
  test: false,
};
const fastify = Fastify({
  logger:
    process.env.NODE_ENV !== "production"
      ? envToLogger[process.env.NODE_ENV]
      : false,
  loggerInstance: process.env.NODE_ENV === "production" ? logger : undefined,
  trustProxy: true,
  forceCloseConnections: false,
});

// Define custom method type
type ErrMethod = (
  this: FastifyReply,
  errorMessage: string | string[],
  statusCode?: number
) => void;

function err(
  this: FastifyReply,
  errorMessage: string | string[],
  statusCode: number = 500,
  type: "warning" | "error" = "error",
  timeout?: number
): void {
  this.code(statusCode).send({
    error: {
      message: errorMessage,
      type: type || "error",
      timeout: timeout || 5000,
    },
  });
}
fastify.decorateReply("err", err);
declare module "fastify" {
  interface FastifyInstance {
    ssec: SSEClient;
  }
  interface FastifyReply {
    err: ErrMethod;
  }
}
fastify.addContentTypeParser(
  ["multipart", "multipart/form-data", "application/x-www-form-urlencoded"],
  async function (req: FastifyRequest) {
    const result = await uploadParser(req, {});
    return result;
  }
);

type SSEClient = Map<number, { role: ROLES; conn: ServerResponse<IncomingMessage>[] }>;
fastify.decorate<SSEClient>("ssec", new Map());

export async function startServer() {
  try {
    fastify.setNotFoundHandler(async (_, res) => {
      res.header("content-type", "text/plain");
      return res.status(404).send("Not Found");
    });
    fastify.setErrorHandler(async (error, request, replay) => {
      if (error instanceof ZodError) {
        const e = prettyError(error);
        return replay.status(400).send({
          error: {
            message: e.errors,
            fields: e.fields,
            type: "error",
            timeout: 5000,
          },
        });
      }
      if (error instanceof KnownError) {
        return replay.status(error.statusCode).send({
          error: {
            message: error.errorMessage ?? "Errore interno.",
            type: error.type,
            timeout: error.timeout || 5000,
          },
        });
      }
      if (error instanceof CriticalError) {
        await codetNotification.send({
          type: "error",
          text: error.message,
        });
      }
      request.log.error(error);
      return replay.status(500).send("Errore interno.");
    });
    await fastify.register(cookiePlugin, {
      hook: "onRequest",
    });
    // public routes are registred here before auth middleware
    await fastify.register(publicRouter, { prefix: "/api" });
    await fastify.register(privateRouter, { prefix: "/api" });
    await fastify.register(mailTrackerRouter, { prefix: "/m/t" });
    await fastify.after();
    const PORT = +(process.argv[2] ?? process.env.PORT ?? 3001);
    const serverConf =
      process.env.NODE_ENV === "production"
        ? { port: PORT }
        : { port: PORT, host: "0.0.0.0" };
    await fastify.listen(serverConf);
    return fastify;
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
