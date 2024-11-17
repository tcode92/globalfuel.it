import { ReactNode } from "react";
import { create } from "zustand";

type AskStore = {
  elements: { id: string | number; component: ReactNode }[];
  ask: (element: ReactNode, id: string | number) => void;
  dismiss: (id: string | number) => void;
};

export const useAsk = create<AskStore>((set, get) => ({
  elements: [],
  ask: (component, id: string | number) => {
    set({
      elements: [{ component, id }, ...get().elements],
    });
  },
  dismiss: (id) => {
    set({
      elements: get().elements.filter((item) => item.id !== id),
    });
  },
}));

export const ask = useAsk.getInitialState().ask;
