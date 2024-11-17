import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { anyToIntOrThrow } from "../../constants";
import {
    noteCreateService,
    noteDeleteService,
    noteUpdateService,
} from "./service";

export const noteCreateHandler = async (
  req: FastifyRequest<{
    Params: {
      clientId: string;
    };
  }>,
  reply: FastifyReply
) => {
  if (req.auth.role !== "admin") return reply.callNotFound();
  const clientId = anyToIntOrThrow(
    req.params.clientId,
    "Id cliente non valido."
  );
  const text = await z
    .string({
      invalid_type_error: "Testo contatto non valido.",
      required_error: "Testo contatto mancante.",
    })
    .parseAsync(req.body);
  return await noteCreateService(clientId, text);
};

export const noteUpdateHandler = async (
  req: FastifyRequest<{
    Params: {
      noteId: string;
    };
  }>,
  reply: FastifyReply
) => {
  if (req.auth.role !== "admin") return reply.callNotFound();
  const noteId = anyToIntOrThrow(req.params.noteId, "Id contatto non valido.");
  const text = await z
    .string({
      invalid_type_error: "Testo contatto non valido.",
      required_error: "Testo contatto mancante.",
    })
    .parseAsync(req.body);

  return await noteUpdateService(noteId, text);
};

export const noteDeleteHandler = async (
  req: FastifyRequest<{ Params: { noteId: string } }>,
  res: FastifyReply
) => {
  if (req.auth.role !== "admin") return res.callNotFound();
  const noteId = anyToIntOrThrow(req.params.noteId, "Id contatto non valido.");
  if (await noteDeleteService(noteId)) {
    return res.send("OK");
  } else {
    return res.err("Non è stato possibile eliminare il contatto.", 500);
  }
};
