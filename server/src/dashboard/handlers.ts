import { FastifyRequest } from "fastify";
import { dashboardGetService } from "./service";

export const dashboardGetHandler = async (req: FastifyRequest) => {
  const auth = req.auth.role === "admin" ? undefined : req.auth.id;
  const data = await dashboardGetService(auth);
  return data;
};
