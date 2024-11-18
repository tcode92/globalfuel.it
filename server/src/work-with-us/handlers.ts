import { CreateWorkWithUsSchema } from "@validation/workWithUs";
import { FastifyRequest } from "fastify";
import { createWorkWithUsService } from "./service";

export const createWorkWithUsHandler = async (req: FastifyRequest) => {
  const data = await CreateWorkWithUsSchema.parseAsync(req.body);
  await createWorkWithUsService(data);
  return "OK";
};
