import { ReactNode } from "react";
import { create } from "zustand";
type DialogID = string | number;
type DialogUiStore = {
  dialogs: { dialog: ReactNode; id: DialogID }[];
  addDialog: (dialog: ReactNode, id: DialogID) => void;
  removeDialog: (id: DialogID) => void;
};

export const useDialogUiStore = create<DialogUiStore>((set, get) => ({
  dialogs: [],
  addDialog: (dialog: ReactNode, id: DialogID) => {
    const currentDialogs = get().dialogs;
    if (currentDialogs.find((item) => item.id === id) !== undefined) return;
    set({
      dialogs: [{ dialog, id }, ...currentDialogs],
    });
  },
  removeDialog: (id: DialogID) => {
    set({
      dialogs: get().dialogs.filter((item) => item.id !== id),
    });
  },
}));
export const addDialog = useDialogUiStore.getState().addDialog
export const removeDialog = useDialogUiStore.getState().removeDialog