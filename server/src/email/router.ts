import { FastifyPluginAsync } from "fastify";
import { mailGetHandler, trackEmailOpenHandler } from "./handlers";

const privateRoute: FastifyPluginAsync = async (api, opts) => {
  api.get("/", mailGetHandler);
};

const route: FastifyPluginAsync = async (server, opts) => {
  server.get("/:trackId", trackEmailOpenHandler);
};

export const mailTrackerRouter = route;
export const mailPrivateRouter = privateRoute