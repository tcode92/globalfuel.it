import { logger } from "../../lib/log";
import { dbConn } from "../connection";
import { models } from "./types";

async function create(clientId: number, text: string) {
  const {
    rows: [newContact],
  } = await dbConn.query<models.note.Note>(
    "INSERT INTO note (text, client_id) VALUES ($1, $2) RETURNING id, text, created_at;",
    [text, clientId]
  );
  return newContact;
}
async function update(noteId: number, text: string) {
  const {
    rows: [updatedContact],
  } = await dbConn.query<models.note.Note>(
    "UPDATE note SET text = $1 WHERE id = $2 RETURNING id, text, created_at;",
    [text, noteId]
  );
  return updatedContact;
}
async function del(noteId: number) {
  try {
    await dbConn.query("DELETE FROM note WHERE id = $1;", [noteId]);
    return true;
  } catch (e) {
    logger.error(e);
    return false;
  }
}

export const note = {
  create,
  update,
  del,
};
