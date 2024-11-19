import { FastifyReply, FastifyRequest } from "fastify";
import {
  messageAckClientSchema,
  messageAckSchema,
  messageCreateSchema,
  messageQuerySchema,
} from "@validation/message";
import {
  messageAckClientService,
  messageAckService,
  messageCreateService,
  messageGetService,
  messageGetToAckService,
} from "./service";
import { handleError } from "../../utils/error";

export const messageCreateHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const msg = await messageCreateSchema.parseAsync(req.body);
  const result = await messageCreateService(msg, req.auth, req.server);
  if (result instanceof Error) {
    return handleError(res, result);
  }
  return result;
};

export const messageAckHandler = async (req: FastifyRequest) => {
  const { id } = await messageAckSchema.parseAsync(req.body);
  return await messageAckService(
    id,
    req.auth.role === "admin" ? null : req.auth.id
  );
};
export const messageAckClientHandler = async (req: FastifyRequest) => {
  const { clientId } = await messageAckClientSchema.parseAsync(req.body);
  return await messageAckClientService(
    clientId,
    req.auth.role === "admin" ? null : req.auth.id
  );
};

export const messageGetHandler = async (req: FastifyRequest) => {
  const query = await messageQuerySchema.parseAsync(req.query);
  return await messageGetService(
    query.clientId,
    req.auth.id,
    req.auth.role,
    query.skip
  );
};

export const messageGetToAckHandler = async (req: FastifyRequest) => {
  const result = await messageGetToAckService(
    req.auth.role === "admin" ? null : req.auth.id
  );
  return result;
};
