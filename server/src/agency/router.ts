import { FastifyPluginAsync } from "fastify";
import {
  agencyCreateHandler,
  agencyDeleteHandler,
  agencyGetHandler,
  agencyGetOneHandler,
  agencyUpdateHandler,
} from "./handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  api.get("/:id", agencyGetOneHandler);
  api.get("/", agencyGetHandler);
  api.post("/", agencyCreateHandler);
  api.put("/:id", agencyUpdateHandler);
  api.delete("/:id", agencyDeleteHandler);
};

export const agencyRouter = route;
