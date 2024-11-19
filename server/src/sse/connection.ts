import { models } from "../../database/models/types";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { logger } from "../../lib/log";
export const sseHandler = (req: FastifyRequest, res: FastifyReply) => {
  if (!req.auth) return res.err("Accesso non autorizzato.", 401);

  const rawConn = res.raw;
  let existing = req.server.ssec.get(req.auth.id);

  res.raw.setHeader("Content-Type", "text/event-stream");
  res.raw.setHeader("Cache-Control", "no-cache");
  res.raw.setHeader("Connection", "keep-alive");

  if (!existing) {
    req.server.ssec.set(req.auth.id, {
      role: req.auth.role,
      conn: [rawConn],
    });
  } else {
    existing.conn.push(rawConn);
  }
  req.log.info(req.auth, "SSE CONNECT");
  rawConn.on("close", () => {
    const userConnections = req.server.ssec.get(req.auth.id);
    if (userConnections) {
      // Remove the closed connection
      userConnections.conn = userConnections.conn.filter(
        (conn) => conn !== rawConn
      );

      // If no connections remain, remove the user from the map
      if (userConnections.conn.length === 0) {
        req.server.ssec.delete(req.auth.id);
      }
    }
    req.log.info(req.auth, "SSE DISCONNECTED");
  });
};

type MessageKind = {
  type: "chat";
  payload: models.message.Message;
};
// Function to send SSE to a specific user by ID and message type
export function sendSSE<T extends MessageKind>(
  server: FastifyInstance,
  id: number,
  type: T["type"],
  message: T["payload"]
) {
  try {
    const userConnections = server.ssec.get(id);
    if (userConnections) {
      userConnections.conn.forEach((conn) => {
        conn.write(`event: ${type}\ndata: ${JSON.stringify(message)}\n\n`);
      });
    }
  } catch (err) {
    logger.error(err);
  }
}

// Function to send SSE to a specific user by ID

// Router
import { FastifyPluginAsync } from "fastify";

const route: FastifyPluginAsync = async (api, opts) => {
  api.get("/", sseHandler);
};

export const sseRouter = route;
