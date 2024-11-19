import { FastifyPluginAsync } from "fastify";
import {
  messageAckClientHandler,
  messageAckHandler,
  messageCreateHandler,
  messageGetHandler,
  messageGetToAckHandler,
} from "./handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  api.post("/", messageCreateHandler);
  api.post("/ack", messageAckHandler);
  api.post("/ack-client", messageAckClientHandler);
  api.get("/ack", messageGetToAckHandler);
  api.get("/", messageGetHandler);
};

export const messageRouter = route;
