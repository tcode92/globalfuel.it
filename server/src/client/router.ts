import { FastifyPluginAsync } from "fastify";
import {
  clientAgencyGetHandler,
  clientCreateHandler,
  clientDeleteHandler,
  clientGetHandler,
  clientUpdateCodeHandler,
  clientUpdateHandler,
  clientUpdateStateHandler,
  clientUpdateTypeHandler,
} from "./handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  api.get("/", clientGetHandler);
  api.get("/:agencyId", clientAgencyGetHandler);
  api.put("/:id", clientUpdateHandler);
  api.post("/", clientCreateHandler);
  api.delete("/delete/:id", clientDeleteHandler);
  api.patch("/code/:id", clientUpdateCodeHandler);
  api.patch("/state/:id", clientUpdateStateHandler);
  api.patch("/type/:id", clientUpdateTypeHandler);
};

export const clientRouter = route;
