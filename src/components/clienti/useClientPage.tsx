import { client } from "@/api/clients";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";
import { FileType } from "@constants";
import { models } from "@types";

type ClientPageStore = {
  client: models.client.FullClient | undefined | "Not found" | "Error";
  renameDoc: (id: number, key: FileType, newName: string) => void;
  removeDoc: (id: number, key: FileType) => void;
  setClient: (
    client: models.client.FullClient | undefined | "Not found" | "Error"
  ) => void;
  addDoc: (doc: models.file.Doc, key: FileType) => void;
  addNote: (note: models.note.Note) => void;
  updateNote: (note: models.note.Note) => void;
  deleteNote: (id: number) => void;
};

export const useClientPage = create<ClientPageStore>((set, get) => ({
  client: undefined,
  removeDoc: (id, key) => {
    if (!get().client) return;
    const client = get().client;
    if (!client || client === "Not found" || client === "Error") return;
    set({
      client: {
        ...client,
        docs: {
          ...client.docs,
          [key]: client.docs[key].filter((doc) => doc.id !== id),
        },
      },
    });
  },
  renameDoc: (id, key, name) => {
    if (!get().client) return;
    const client = get().client;
    if (!client || client === "Not found" || client === "Error") return;

    set({
      client: {
        ...client,
        docs: {
          ...client.docs,
          [key]: client.docs[key].map((doc) => {
            if (doc.id === id) {
              return {
                ...doc,
                name: name,
              };
            }
            return doc;
          }),
        },
      },
    });
  },
  setClient: (client) => {
    set({
      client: client,
    });
  },
  addDoc: (doc, key: FileType) => {
    const client = get().client;
    if (!client || client === "Not found" || client === "Error") return;
    set({
      client: {
        ...client,
        docs: {
          ...client.docs,
          [doc.type]: [...client.docs?.[key], doc],
        },
      },
    });
  },
  addNote: (note) => {
    const curr = get().client;
    if (typeof curr !== "object") return;
    set({
      client: {
        ...curr,
        note: [note, ...curr.note],
      },
    });
  },
  updateNote: (note) => {
    const curr = get().client;
    if (typeof curr !== "object") return;
    set({
      client: {
        ...curr,
        note: curr.note.map((c) => {
          if (c.id === note.id) return note;
          return c;
        }),
      },
    });
  },
  deleteNote: (id) => {
    const curr = get().client;
    if (typeof curr !== "object") return;
    set({
      client: {
        ...curr,
        note: curr.note.filter((c) => c.id !== id),
      },
    });
  },
}));

export const useClientFetch = () => {
  const { setClient } = useClientPage();
  const params = useParams();
  useEffect(() => {
    if (!params) return;
    let id: number | undefined = params.id
      ? parseInt(params.id.toString())
      : NaN;
    if (isNaN(id)) {
      id = undefined;
    } else {
      id = Math.abs(id);
    }

    if (!id) {
      setClient("Not found");
      return;
    }
    const { abort, request } = client.getFullClient(id);
    request.then((response) => {
      const { success, data, status, error } = response;
      if (success) {
        setClient(data);
      } else {
        if (status === 404) setClient("Not found");
        if (status >= 500) {
          setClient("Error");
          error?.display();
        }
      }
    });
    return () => {
      abort();
      setClient(undefined);
    };
  }, [params, setClient]);
  return null;
};
