import { FastifyReply, FastifyRequest } from "fastify";
import {
  clientAgencyGetService,
  clientCreateExternalService,
  clientCreateService,
  clientDeleteService,
  clientGetService,
  clientUpdateCodeService,
  clientUpdateService,
  clientUpdateStateService,
  clientUpdateTypeService,
} from "./service";
import {
  ClientCreateUpdateSchema,
  ClientDeleteParams,
  ClientQuerySchema,
  ClientUpdateCodeSchema,
  ClientUpdateStateSchema,
  ClientUpdateTypeSchema,
} from "../../../shared/validation/client";
import { anyToIntOrThrow, KnownError } from "../../utils/error";

export const clientGetHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const query = await ClientQuerySchema.parseAsync(req.query);
  const clients = await clientGetService(query, req.auth.role, req.auth.id);
  if (clients instanceof KnownError) {
    return res.err(clients.message, 404);
  }
  return clients;
};

export const clientAgencyGetHandler = async (
  req: FastifyRequest<{
    Params: {
      agencyId: string;
    };
  }>,
  res: FastifyReply
) => {
  const agencyId = +req.params.agencyId;
  if (isNaN(agencyId) || req.auth.role !== "admin") return res.callNotFound();
  const query = await ClientQuerySchema.parseAsync(req.query);
  const clients = await clientAgencyGetService(query, agencyId);
  return clients;
};

export const clientCreateHandler = async (req: FastifyRequest) => {
  const client = await ClientCreateUpdateSchema.parseAsync(req.body);
  const authId = req.auth.role === "admin" ? 1 : req.auth.id;
  await clientCreateService(authId, client);
  return "OK";
};

export const clientCreateExternalHandler = async (req: FastifyRequest) => {
  req.log.info("NEW EXTERNAL CLIENT SUBMISSION");
  const client = await ClientCreateUpdateSchema.parseAsync(req.body);
  await clientCreateExternalService(client);
  return "OK";
};

export const clientUpdateHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  replay: FastifyReply
) => {
  let id = anyToIntOrThrow(req.params.id, "Id cliente mancante.");
  const client = await ClientCreateUpdateSchema.parseAsync(req.body);

  return await clientUpdateService(id, client);
};

export const clientUpdateStateHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  replay: FastifyReply
) => {
  let id = anyToIntOrThrow(req.params.id, "Id cliente mancante.");
  if (req.auth.role !== "admin")
    return replay.err("Azione non consentita", 403);
  const { state } = await ClientUpdateStateSchema.parseAsync(req.body);
  return await clientUpdateStateService(id, { state });
};

export const clientUpdateTypeHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  replay: FastifyReply
) => {
  let id = anyToIntOrThrow(req.params.id, "Id cliente mancante.");
  if (req.auth.role !== "admin")
    return replay.err("Azione non consentita", 403);
  const { type } = await ClientUpdateTypeSchema.parseAsync(req.body);
  return await clientUpdateTypeService(id, { type });
};

export const clientUpdateCodeHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  replay: FastifyReply
) => {
  let id = anyToIntOrThrow(req.params.id, "Id cliente mancante.");
  const { code } = await ClientUpdateCodeSchema.parseAsync(req.body);
  const result = await clientUpdateCodeService(id, code);
  return result;
};

export const clientDeleteHandler = async (
  req: FastifyRequest,
  replay: FastifyReply
) => {
  if (req.auth.role !== "admin") return replay.err("Errore sconosciuto.", 403);
  const { id } = await ClientDeleteParams.parseAsync(req.params);
  await clientDeleteService(id);
  return "OK";
};
