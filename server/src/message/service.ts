import { db } from "../../database/db";
import { KnownError } from "../../utils/error";
import {
  MessageCreateInput,
  MessageSearchFilters,
} from "../../../shared/validation/message";
import { ROLES } from "@constants";

export const messageAckService = async (
  messageId: number,
  authId: number | null
) => {
  const msgs = await db.message.ack(messageId, authId);
  return msgs;
};

export const messageCreateService = async (
  message: MessageCreateInput,
  authId: number,
  authRole: ROLES
) => {
  let clientAgencyId = undefined;
  if (authRole === "admin") {
    clientAgencyId = (await db.client.getAgency(message.clientId, ["id"])).id;
    // check for system client -
    if (clientAgencyId === 1) {
      return new KnownError(
        "Non è possibile inviare messaggi per un cliente di Petrol Service."
      );
    }
  }
  const result = await db.message.create(
    message,
    authId,
    authRole,
    clientAgencyId
  );
  return result;
};

export type MessagePaginationResponse = Awaited<ReturnType<typeof messageGetService>>
export const messageGetService = async (
  authId: number,
  authRole: ROLES,
  query: MessageSearchFilters
) => {
  const msgs = await db.message.get(authId, authRole, query);
  return msgs;
};

export const messageGetToAckService = async (authId: number | null) => {
  return db.message.getToAckMessages(authId);
};