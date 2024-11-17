import { FastifyPluginAsync } from "fastify";
import {
  staffCreateHandler,
  staffDeleteHandler,
  staffGetHandler,
  staffUpdateHandler,
} from "./handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  api.get("/", staffGetHandler);
  api.post("/", staffCreateHandler);
  api.put("/:id", staffUpdateHandler);
  // api.patch("/reset-password/:id", sendNewPasswordHandler);
  api.delete("/:id", staffDeleteHandler);
};

export const staffRouter = route;
