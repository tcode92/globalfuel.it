import {
  FastifyInstance,
  FastifyPluginOptions,
  onRequestAsyncHookHandler,
} from "fastify";
import fp from "fastify-plugin";
import { addCookie, clearAuthTokens } from "../lib/jwt";

import { ROLES } from "@constants";
import { getAuthFromTokens } from "../../shared/auth";

declare module "fastify" {
  interface FastifyRequest {
    auth: {
      id: number;
      name: string;
      role: ROLES;
      resetPassword?: boolean;
    };
  }
}

const handler: onRequestAsyncHookHandler = async (req, replay) => {
  const accessToken = req.cookies._access;
  const refreshToken = req.cookies._refresh;
  const auth = await getAuthFromTokens(accessToken, refreshToken);
  if (auth === null) {
    if (accessToken || refreshToken) {
      await clearAuthTokens(replay);
    }
    return replay.status(401).send("Unauthorized");
  }
  if (auth.accessToken) {
    // add access token to response
    addCookie(replay, {
      name: "_access",
      maxAge: 1800,
      value: auth.accessToken,
    });
  }
  req.auth = auth.user;
};

function plugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: (err?: Error) => void
) {
  fastify.decorateRequest("auth", null as any);
  fastify.addHook("onRequest", handler);
  done();
}

export const authPlugin = fp(plugin);
