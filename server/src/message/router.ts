import { FastifyPluginAsync } from "fastify";
import {
  messageAckHandler,
  messageCreateHandler,
  messageGetHandler,
  messageGetToAckHandler,
} from "./handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  api.post("/", messageCreateHandler);
  api.post("/ack", messageAckHandler);
  api.get("/ack", messageGetToAckHandler);
  api.get("/", messageGetHandler);
};

export const messageRouter = route;
