import { ROLES } from "@constants";
import { MessageCreateInput, MessageSearchFilters } from "@validation/message";
import { dbConn, SQL, Sql } from "../connection";
import { models } from "./types";

/**
 *
 * @param msg Message
 * @param authId Sender
 * @param role Sender role
 * @param agencyId Client agency id - Set when sender is admin
 * @returns message id
 */
export async function create(
  msg: MessageCreateInput,
  authId: number,
  role: ROLES,
  agencyId?: number
) {
  const msgStm = `INSERT INTO messages (auth_id, message, client_id) VALUES ($1, $2, $3) RETURNING id;`;
  const msgValues = [authId, msg.message, msg.clientId];
  const ackStm = `INSERT INTO message_ack (msg_id, auth_id, ack) VALUES ($1, $2, $3);`;
  const ackValues = (id: number) => [
    id,
    role !== "admin" ? null : agencyId,
    authId === agencyId,
  ];
  return await dbConn.transaction(async (tx) => {
    const {
      rows: [newMessage],
    } = await tx.query<{ id: number }>(msgStm, msgValues);
    await tx.query(ackStm, ackValues(newMessage.id));
    return newMessage.id;
  });
}

async function get(
  authId: number,
  role: ROLES,
  filters: MessageSearchFilters
): Promise<models.message.MessagePagination> {
  const stm = new Sql();
  const countStm = new Sql();
  countStm.add`SELECT COUNT(messages.id) AS total_pages FROM messages `;
  // Table select
  stm.add`SELECT
  messages.id,
  `;
  if (role === "admin") {
    stm.add`
    CASE
      WHEN sender.id = ${authId}
      THEN NULL
      ELSE sender.name
    END AS sender,
    CASE
      WHEN sender.role = 'agency' 
      THEN sender.id
      ELSE NULL
    END AS agency_id,
    `;
  } else {
    stm.add`
    CASE
      WHEN sender.id = ${authId}
      THEN NULL
      ELSE 'Staff'
    END AS sender,
    `;
  }
  stm.add`
    client.business as client,
    messages."message",
    messages.created_at,
    message_ack."ack" as ack,
    client.id as client_id
    FROM messages
  `;
  // Table joins
  if (role === "admin") {
    const authJoin = Sql.sql`
    LEFT JOIN auth AS sender ON sender.id = messages.auth_id
    LEFT JOIN message_ack ON message_ack.msg_id = messages."id" AND message_ack.auth_id IS NULL
    LEFT JOIN client ON client."id" = messages.client_id
    `;
    stm.addSql(authJoin);
    countStm.addSql(authJoin);
  } else {
    const agencyJoin = Sql.sql`
    LEFT JOIN auth AS sender ON sender.id = messages.auth_id
    LEFT JOIN message_ack ON message_ack.msg_id = messages."id" AND message_ack.auth_id = ${authId}
    LEFT JOIN client ON client."id" = messages.client_id
    `;
    stm.addSql(agencyJoin);
    countStm.addSql(agencyJoin);
  }
  let search: SQL[] = [];
  if (role !== "admin") {
    search.push(Sql.sql` client.auth_id = ${authId} `)
  }
  if (filters.toAck) {
    search.push(Sql.sql` message_ack.ack = FALSE `);
  }
  if (filters.client) {
    search.push(Sql.sql` client.business ILIKE ${filters.client + "%"} `);
  }
  if (filters.agency && role === "admin") {
    search.push(Sql.sql` sender."name" ILIKE ${filters.agency + "%"} `);
  }
  if (search.length > 0) {
    const where = Sql.join(search, Sql.AND);
    stm.add`WHERE ${where}`;
    countStm.add`WHERE ${where}`;
  }
  stm.add`
  ORDER BY messages.id DESC
  LIMIT ${filters.limit} OFFSET ${filters.limit * (filters.page - 1)};
  `;

  const { rows } = await stm.execute<models.message.Message>();
  console.log(countStm.query, countStm.values);
  const {
    rows: [{ total_pages }],
  } = await countStm.execute<{ total_pages: string }>();
  const totalPages = Math.ceil(+total_pages / filters.limit);
  return {
    list: rows,
    totalPages: totalPages,
    currentPage: filters.page,
    hasNext: filters.page < Math.ceil(+total_pages / filters.limit),
    hasPrev: filters.page > 1,
  };
}

async function getToAckCount(authId: number | null) {
  let stm;
  if (authId === null) {
    stm =
      "SELECT COUNT(*) AS to_ack FROM message_ack WHERE message_ack.auth_id IS NULL AND ack = FALSE;";
  } else {
    stm =
      "SELECT COUNT(*) AS to_ack FROM message_ack WHERE message_ack.auth_id = $1 AND ack = FALSE;";
  }
  const result = await dbConn.query<{ to_ack: string }>(
    stm,
    authId ? [authId] : undefined
  );
  return +result?.rows[0]?.to_ack || 0;
}

async function getToAckMessages(authId: number | null) {
  const stm = new Sql();
  stm.add`
  SELECT 
    messages.id,
    ${
      authId
        ? Sql.sql`(SELECT 'Staff') AS sender,`
        : Sql.sql`sender.name AS sender,`
    }
    CASE
      WHEN sender.role = 'agency' THEN sender.id
      ELSE NULL
    END AS agency_id,
    client.business as client,
    messages."message",
    messages.created_at,
    client.id as client_id,
    message_ack."ack" as ack
  FROM messages 
  LEFT JOIN auth AS sender ON sender.id = messages.auth_id
  LEFT JOIN message_ack ON message_ack.msg_id = messages."id" AND message_ack.auth_id ${
    authId ? Sql.sql` = ${authId}` : Sql.sql` IS NULL `
  }
  LEFT JOIN client ON client."id" = messages.client_id
  WHERE message_ack.ack = FALSE
  ORDER BY messages.id DESC;
  `;
  const { rows } = await stm.execute<models.message.Message>();
  return rows;
}

async function ack(messageId: number, authId: number | null) {
  let stm;
  let values = [];
  if (authId) {
    stm = `UPDATE message_ack SET ack = TRUE, ack_at = CURRENT_TIMESTAMP WHERE msg_id = $1 AND auth_id = $2 AND ack_at IS NULL;`;
    values = [messageId, authId];
  } else {
    stm = `UPDATE message_ack SET ack = TRUE, ack_at = CURRENT_TIMESTAMP WHERE msg_id = $1 AND auth_id IS NULL AND ack_at IS NULL;`;
    values = [messageId];
  }
  await dbConn.query(stm, values);
  return true;
}

export const message = {
  getToAckCount,
  ack,
  get,
  create,
  getToAckMessages,
};
