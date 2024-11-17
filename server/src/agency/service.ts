import fs from "fs";
import path from "path";
import {
  AgencyCreateInput,
  AgencyGetQueryInput,
  AgencyUpdateInput,
} from "../../../shared/validation/agency";
import { db } from "../../database/db";
import { logger } from "../../lib/log";
import { hashPassword } from "../../lib/password";
import { generateRandomString } from "../../lib/random";
import { invalidateTokenVersion } from "../../lib/redis";

// Get
export type AgencyGetResponse = ReturnType<typeof getAgencyService>;
export const getAgencyService = async ({
  search,
  page,
  limit,
  not,
}: AgencyGetQueryInput) => {
  const data = await db.agency.get(search, page, limit, not);
  return data;
};

// Get one
export type AgencyGetOneResponse = ReturnType<typeof getOneAgencyService>;
export const getOneAgencyService = async (id: number) => {
  const agencyData = await db.agency.getOne(id);
  return agencyData;
};

// Create
export type AgencyCreateResponse = ReturnType<typeof createAgencyService>;
export const createAgencyService = async (agency: AgencyCreateInput) => {
  const pass = generateRandomString(10);
  const password = await hashPassword(pass);
  const newAgency = await db.agency.create({
    email: agency.email,
    name: agency.name,
    password,
  });
  mailer.send({
    template: "new-account",
    data: {
      name: agency.name,
      password: pass,
    },
    subject: "Conferma registrazione",
    to: agency.email,
    from: "No replay <noreplay@codet.it>",
  });
  return newAgency;
};

// Update
export type AgencyUpdateResponse = ReturnType<typeof updateAgencyService>;
export const updateAgencyService = async (
  id: number,
  agency: AgencyUpdateInput
) => {
  // system user email cannot be updated, only name is allowed to be updated.
  if (id === 1) {
    //@ts-expect-error
    agency.email = undefined;
  }
  const updatedAgency = await db.agency.update(id, agency);
  return updatedAgency;
};

// Delete
export type AgencyDeleteResponse = ReturnType<typeof deleteAgencyService>;
export const deleteAgencyService = async (
  id: number,
  actionType: "delete" | "system" | number
) => {
  const { filesToDelete, tokenV } = await db.agency.del(id, actionType);
  // do background job async and return early
  finishDeleteTask(id, tokenV, filesToDelete);
  return "OK" as const;
};
const finishDeleteTask = async (
  agencyId: number,
  tokenV: string | null,
  filesToDelete: string[]
) => {
  if (tokenV) await invalidateTokenVersion(agencyId, tokenV);
  for (const file of filesToDelete) {
    try {
      await fs.promises.unlink(path.join(process.cwd(), file));
    } catch (e) {
      logger.error(e, `Cannot delete file ${file}`);
    }
  }
  return;
};
