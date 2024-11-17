import { msg } from "@/api/message";
import { models } from "@types";

import { create } from "zustand";

type MessageStore = {
  messages: models.message.Message[];
  toAck: number;
  getAck: () => () => void;
  ack: (msgId: number) => void;
  clear: () => void;
};

export const useMessagetStore = create<MessageStore>((set, get) => ({
  messages: [],
  toAck: 0,
  getAck: () => {
    const { abort, request } = msg.getAck();
    request.then((response) => {
      if (response.success) {
        set({
          messages: response.data,
          toAck: response.data.length,
        });
      }
    });
    return abort;
  },
  ack: (id) => {
    const curr = get().messages;
    if (!curr) return;
    set({
      messages: curr.filter((m) => m.id !== id),
      toAck: get().toAck - 1,
    });
  },
  clear: () => {
    set({
      messages: [],
    });
  },
}));
