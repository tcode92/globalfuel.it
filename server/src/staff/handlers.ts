import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUpdateStaffSchema } from "../../../shared/validation/staff";
import { anyToIntOrThrow } from "../../constants";
import {
  staffCreateService,
  staffDeleteService,
  staffGetService,
  staffUpdateService,
} from "./service";

export const staffCreateHandler = async (req: FastifyRequest) => {
  const { name, email } = await CreateUpdateStaffSchema.parseAsync(req.body);
  const user = await staffCreateService(name, email);
  return user;
};

export const staffDeleteHandler = async (
  req: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) => {
  const id = anyToIntOrThrow(req.params.id, "Id utente non valido.");
  const result = await staffDeleteService(id);
  if (result) {
    return reply.send("OK");
  } else {
    return reply.err("Errore interno.", 500);
  }
};

export const staffGetHandler = async () => {
  return await staffGetService();
};

export const staffUpdateHandler = async (
  req: FastifyRequest<{
    Params: {
      id: string;
    };
  }>
) => {
  const id = anyToIntOrThrow(req.params.id, "Id utente non valido.");
  const { name, email } = await CreateUpdateStaffSchema.parseAsync(req.body);
  return staffUpdateService(id, name, email);
};
