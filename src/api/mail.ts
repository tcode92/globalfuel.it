import { models } from "@types";
import { http } from "./base";
class Mail {
  get(query?: string) {
    return http.get<models.mail.Pagination>(`/api/mail?${query}`);
  }
}
export const mail = new Mail();
