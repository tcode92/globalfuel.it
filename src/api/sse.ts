import { useMessagetStore } from "@/store/messageStore";
import { models } from "@types";
import { reportError } from "./base";

export const connect = () => {
  try {
    const sse = new EventSource("/api/sse", {
      withCredentials: true,
    });

    sse.addEventListener("chat", (ev) => {
      const msg = JSON.parse(ev.data) as models.message.Message;
      const newEvent = new CustomEvent("chat", {
        detail: msg,
      });
      window.dispatchEvent(newEvent);
      if (msg.ack === false) {
        useMessagetStore.getState().addMessage(msg);
      }
    });
  } catch (e) {
    reportError(e, window.location.toString());
  }
};
