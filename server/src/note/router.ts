import { FastifyPluginAsync } from "fastify";
import {
  noteCreateHandler,
  noteDeleteHandler,
  noteUpdateHandler,
} from "./handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  //TODO api.get("/", );
  api.post("/:clientId", noteCreateHandler);
  api.put("/:noteId", noteUpdateHandler);
  api.delete("/:noteId", noteDeleteHandler);
};

export const noteRouter = route;