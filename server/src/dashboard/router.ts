import { FastifyPluginAsync } from "fastify";
import { dashboardGetHandler } from "./handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  api.get("/", dashboardGetHandler);
};

export const dashboardRouter = route;
