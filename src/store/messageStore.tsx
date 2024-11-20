import { msg } from "@/api/message";
import { models } from "@types";

import { create } from "zustand";

type MessageStore = {
  messages: models.message.Message[];
  toAck: number;
  getAck: () => () => void;
  addMessage: (msg: models.message.Message) => void;
  ack: (msgId: number) => void;
  ackAllClientMessages: (clientId: number) => void;
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
  addMessage: (msg) => {
    const newMessages = [msg, ...get().messages];
    set({
      messages: newMessages,
      toAck: newMessages.length,
    });
  },
  ackAllClientMessages: (clientId: number) => {
    let total = 0;
    const newList = get().messages.filter((m) => {
      if (m.client_id === clientId) {
        ++total;
        return false;
      }
      return true;
    });
    set({
      toAck: newList.length,
      messages: newList,
    });
  },
  clear: () => {
    set({
      messages: [],
    });
  },
}));
