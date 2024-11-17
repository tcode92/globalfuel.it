import { db } from "../../database/db";

export const noteDeleteService = async (noteId: number) => {
    return await db.note.del(noteId)
};
export const noteUpdateService = async (noteId: number, text: string) => {
  return await db.note.update(noteId, text);
};
export const noteCreateService = async (clientId: number, text: string) => {
  return await db.note.create(clientId, text);
};
