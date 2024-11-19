import { db } from "../../database/db";
import { KnownError } from "../../utils/error";
import { MessageCreateInput } from "@validation/message";
import { ROLES } from "@constants";
import { sendSSE } from "../sse/connection";
import { FastifyInstance, FastifyRequest } from "fastify";

export const messageAckService = async (
  messageId: number,
  authId: number | null
) => {
  const msgs = await db.message.ack(messageId, authId);
  return msgs;
};
export const messageAckClientService = async (
  clientId: number,
  authId: number | null
) => {
  const msgs = await db.message.ackAllClientMessages(clientId, authId);
  return msgs;
};

export const messageCreateService = async (
  message: MessageCreateInput,
  auth: FastifyRequest["auth"],
  server: FastifyInstance
) => {
  const info = await db.client.getClientAgencyInfo(message.clientId);
  if (!info) {
    return new KnownError("Utente non trovato.");
  }
  if (auth.role === "admin" && info.agency_id === 1) {
    return new KnownError(
      "Non è possibile inviare messaggi per un cliente di Petrol Service."
    );
  }
  const result = await db.message.create(
    message,
    auth.id,
    auth.role,
    auth.role === "admin" ? info.agency_id : undefined
  );

  for (const [id, client] of server.ssec) {
    if (id === auth.id) continue; // do not send the message to the sender
    if (id === info?.agency_id) {
      // if this is true admin sent it, we send the message to the agency
      const m: typeof result = {
        ack: false,
        agency_id: null,
        client: info.name,
        client_id: info.id,
        created_at: result.created_at,
        id: result.id,
        message: result.message,
        sender: "Staff",
      };
      sendSSE(server, id, "chat", m);
    }
    if (client.role === "admin") {
      const m: typeof result = {
        ack: auth.role === "admin",
        agency_id: info.agency_id,
        client: info.name,
        client_id: info.id,
        created_at: result.created_at,
        id: result.id,
        message: result.message,
        sender: auth.name,
      };
      sendSSE(server, id, "chat", m);
    }
  }

  return result;
};

export type MessagePaginationResponse = Awaited<
  ReturnType<typeof messageGetService>
>;

export const messageGetService = async (
  clientId: number,
  authId: number,
  authRole: ROLES,
  skip?: number
) => {
  const msgs = await db.message.getClientMessages(
    clientId,
    authId,
    authRole,
    skip
  );
  return msgs;
};

export const messageGetToAckService = async (authId: number | null) => {
  return db.message.getToAckMessages(authId);
};
