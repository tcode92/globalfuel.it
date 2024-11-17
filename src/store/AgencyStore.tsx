import { agency } from "@/api/agency";
import { models } from "@types";

import { create } from "zustand";

type AgencyStore = {
  agencies: models.agency.Agency[] | undefined;
  totalPages: number;
  getQuery: (query?: string) => () => void;
  refresh: () => void;
  add: (agency: models.agency.Agency) => void;
  update: (agency: models.agency.Agency) => void;
  remove: (id: number) => void;
  clearAgency: () => void;
};

export const useAgencyStore = create<AgencyStore>((set, get) => ({
  agencies: undefined,
  totalPages: 1,
  getQuery: (query?: string) => {
    const { request, abort } = agency.getAgencies(query);
    request.then((response) => {
      if (response.success) {
        set({
          agencies: response.data.list,
          totalPages: response.data.total,
        });
      }
    });
    return abort;
  },
  refresh: () => {
    const query = window.location.search;
    get().getQuery(query);
  },
  add: (agency) => {
    const agencies = get().agencies || [];
    const newAgencies = [agency, ...agencies];
    set({
      agencies: newAgencies,
    });
  },
  update: (agency) => {
    set({
      agencies: get().agencies?.map((a) => {
        if (a.id === agency.id) return agency;
        return a;
      }),
    });
  },
  remove: (id) => {
    set({
      agencies: get().agencies?.filter((a) => a.id !== id),
    });
  },
  clearAgency: () => {
    set({
      agencies: undefined,
      totalPages: 1,
    });
  },
}));
