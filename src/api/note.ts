import { models } from "@types";
import { http } from "./base";
class Note {
  create(clientId: number, text: string) {
    return http.post<models.note.Note>(`/api/notes/${clientId}`, text);
  }
  update(noteId: number, text: string) {
    return http.put<models.note.Note>(`/api/notes/${noteId}`, text);
  }
  delete(noteId: number) {
    return http.delete<"OK">(`/api/notes/${noteId}`);
  }
}
export const note = new Note();
