import { useMessagetStore } from "@/store/messageStore";
import { models } from "@types";

export const connect = () => {
  const sse = new EventSource("/api/sse", {
    withCredentials: true,
  });

  sse.addEventListener("chat", (ev) => {
    const msg = JSON.parse(ev.data) as models.message.Message;
    if (msg.ack === false) {
      useMessagetStore.getState().addMessage(msg);
    }
    const newEvent = new CustomEvent("chat", {
      detail: msg,
    });
    window.dispatchEvent(newEvent);
  });
};
