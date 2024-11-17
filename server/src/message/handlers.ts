import { FastifyRequest } from "fastify";
import {
  messageAckSchema,
  messageCreateSchema,
  messageFileterSchema,
} from "../../../shared/validation/message";
import {
  messageAckService,
  messageCreateService,
  messageGetService,
  messageGetToAckService,
} from "./service";

export const messageCreateHandler = async (req: FastifyRequest) => {
  const msg = await messageCreateSchema.parseAsync(req.body);
  const result = await messageCreateService(msg, req.auth.id, req.auth.role);
  return result;
};

export const messageAckHandler = async (req: FastifyRequest) => {
  const { id } = await messageAckSchema.parseAsync(req.body);
  return await messageAckService(
    id,
    req.auth.role === "admin" ? null : req.auth.id
  );
};

export const messageGetHandler = async (req: FastifyRequest) => {
  const query = await messageFileterSchema.parseAsync(req.query);
  return await messageGetService(req.auth.id, req.auth.role, query);
};

export const messageGetToAckHandler = async (req: FastifyRequest) => {
  const result = await messageGetToAckService(
    req.auth.role === "admin" ? null : req.auth.id
  );
  return result;
};
