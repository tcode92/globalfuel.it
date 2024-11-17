import { models } from "@types";
import { http } from "./base";
class Message {
  create(msg: { clientId: number; message: string }) {
    return http.post<models.message.Message>(`/api/msg`, msg);
  }

  get(clientId: number, skip: number) {
    return http.get<models.message.MessagePagination>(
      `/api/msg?clientId=${clientId}&skip=${skip}`
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
