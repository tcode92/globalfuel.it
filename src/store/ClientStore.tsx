import { client } from "@/api/clients";
import { models } from "@types";
import { create } from "zustand";

type ClientsStore = {
  clients: models.client.ClientTable[];
  totalPages: number;
  currAgencyId: number | undefined;
  loading: boolean;
  getQuery: (query?: string) => () => void;
  refresh: () => void;
  add: (client: models.client.ClientTable) => void;
  update: (client: models.client.ClientTable) => void;
  remove: (id: number) => void;
  setAgencyId: (id: number | undefined) => void;
  clearClients: () => void;
};

export const useClientStore = create<ClientsStore>((set, get) => ({
  clients: [],
  totalPages: 1,
  currAgencyId: undefined,
  loading: true,
  getQuery: (query) => {
    const { request, abort } = client.getClients(query, get().currAgencyId);
    set({ loading: true });
    request.then((response) => {
      if (response.success) {
        set({
          clients: response.data.list,
          totalPages: response.data.total,
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
  update: (client) => {
    const curr = get().clients;
    if (!curr) return;
    set({
      clients: curr.map((c) => {
        if (c.id === client.id) return client;
        return c;
      }),
    });
  },
  remove: () => {},
  setAgencyId: (id) => {
    set({
      currAgencyId: id,
    });
  },
  clearClients: () => {
    set({
      clients: [],
      totalPages: 1,
      currAgencyId: undefined,
      loading: true,
    });
  },
}));
