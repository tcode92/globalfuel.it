import { mail } from "@/api/mail";
import { models } from "@types";
import { create } from "zustand";

type MailsStore = {
  mails: models.mail.Mail[];
  totalPages: number;
  loading: boolean;
  getQuery: (query?: string) => () => void;
  refresh: () => void;
  add: (mail: models.mail.Mail) => void;
  update: (mail: models.mail.Mail) => void;
  clear: () => void;
};

export const useMailStore = create<MailsStore>((set, get) => ({
  mails: [],
  totalPages: 1,
  loading: true,
  getQuery: (query) => {
    const { request, abort } = mail.get(query);
    set({ loading: true });
    request.then((response) => {
      if (response.success) {
        set({
          mails: response.data.data,
          totalPages: response.data.totalPages,
          loading: false,
        });
      } else {
        set({
          loading: false,
        });
      }
    });
    return abort;
  },
  refresh: () => {
    const query = window.location.search;
    get().getQuery(query);
  },
  add: () => {},
  update: (mail) => {
    const curr = get().mails;
    if (!curr) return;
    set({
      mails: curr.map((m) => {
        if (m.id === mail.id) return mail;
        return m;
      }),
    });
  },
  clear: () => {
    set({
      mails: [],
      totalPages: 1,
      loading: true,
    });
  },
}));
