/**
 * This file contains fastify handlers for agency endpoint
 * /api/agency
 */

import { FastifyReply, FastifyRequest } from "fastify";
import {
  AgencyCreateSchema,
  AgencyGetQuerySchema,
  AgencyUpdateSchema,
} from "../../../shared/validation/agency";
import { KnownError } from "../../utils/error";
import {
  createAgencyService,
  deleteAgencyService,
  getAgencyService,
  getOneAgencyService,
  updateAgencyService,
} from "./service";
import { anyToIntOrThrow } from "../../constants";

// Get
export const agencyGetHandler = async (req: FastifyRequest) => {
  const query = await AgencyGetQuerySchema.parseAsync(req.query);
  const data = await getAgencyService(query);
  return data;
};

// Get one
export const agencyGetOneHandler = async (
  req: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) => {
  if (req.auth.role !== "admin") return reply.err("Non autorizzato", 403);
  if (!req.params.id) {
    return reply.callNotFound();
  }
  const agencyData = await getOneAgencyService(+req.params.id);
  if (!agencyData) return reply.callNotFound();
  return agencyData;
};

// Create
export const agencyCreateHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  req.log.info("CREATING AGENCY");
  const agency = await AgencyCreateSchema.parseAsync(req.body);
  const newAgency = await createAgencyService(agency);
  return res.status(201).send(newAgency);
};

// Update
export const agencyUpdateHandler = async (
  req: FastifyRequest<{
    Params: {
      id: string;
    };
  }>
) => {
  req.log.info("UPDATE AGENCY");
  const id = anyToIntOrThrow(req.params.id, "Id agenzia non valido.");
  const agency = await AgencyUpdateSchema.parseAsync(req.body);
  const updatedAgency = await updateAgencyService(id, agency);
  return updatedAgency;
};

// Delete
export const agencyDeleteHandler = async (
  req: FastifyRequest<{
    Querystring: {
      clients: "delete" | `${number}` | "system";
    };
    Params: {
      id: string;
    };
  }>
) => {
  req.log.info("DELETING AGENCY");
  const id = anyToIntOrThrow(req.params.id, "Id agenzia non valido.");
  const actionType = req.query.clients;
  let action: "delete" | "system" | number;
  switch (actionType) {
    case "delete": {
      action = "delete";
      break;
    }
    case "system": {
      action = "system";
      break;
    }
    default: {
      let authId = parseInt(actionType);
      if (actionType && !isNaN(authId) && authId > 0) {
        action = authId;
        break;
      }
      throw new KnownError(`Tipo di eliminazione richiesto.`);
    }
  }
  const result = await deleteAgencyService(id, action);
  return result;
};
