import { models } from "@types";
import { http } from "./base";
class Message {
  create(msg: { clientId: number; message: string }) {
    return http.post<"OK">(`/api/msg`, msg);
  }

  get(query?: string) {
    return http.get<models.message.MessagePagination>(
      `/api/msg${query ? "?" + query : ""}`
    );
  }
  ack(id: number) {
    return http.post(`/api/msg/ack`, { id });
  }
  getAck() {
    return http.get<models.message.Message[]>(`/api/msg/ack`);
  }
}
export const msg = new Message();
