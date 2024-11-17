import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { useRef, useState } from "react";
import { Button } from "../ui/button";

import { note } from "@/api/note";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { models } from "@types";
type PromiseResult = models.note.Note | null;
type CreateEditContactDialogProps = {
  resolver: (value: PromiseResult) => void;
  name: string;
  clientOrNoteId: number;
  text?: string;
};
function CreateEditNote({
  resolver,
  clientOrNoteId,
  text,
  name,
}: CreateEditContactDialogProps) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  return (
    <Dialog
      modal={true}
      open={open}
      onOpenChange={(value) => {
        if (loading) return;
        setOpen(false);
        resolver(null);
      }}
    >
      <DialogPortal>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-blux">Nota</DialogTitle>
            <DialogDescription>{name}</DialogDescription>
          </DialogHeader>
          <Textarea defaultValue={text} ref={inputRef} />
          <DialogFooter>
            <Button
              variant={"blue"}
              onClick={async () => {
                if (!inputRef.current) return;
                const newText = inputRef.current.value;
                if (newText.trim() === "") {
                  setOpen(false);
                  resolver(null);
                  return;
                }
                setLoading(true);
                const action = text ? note.update : note.create;
                const { success, data, error } = await action(
                  clientOrNoteId,
                  newText
                ).request;
                if (success) {
                  setOpen(false);
                  resolver(data);
                } else {
                  setLoading(false);
                  error.display();
                }
              }}
            >
              {text ? "Modifica" : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function createEditNote(
  clientOrNoteId: number,
  name: string,
  text?: string
): Promise<PromiseResult> {
  const unmountDelay = 500;
  return new Promise<PromiseResult>((r) => {
    const resolver = (value: PromiseResult) => {
      r(value);
      setTimeout(() => {
        removeDialog("create-edit-note");
      }, unmountDelay);
    };
    addDialog(
      <CreateEditNote
        resolver={resolver}
        clientOrNoteId={clientOrNoteId}
        text={text}
        name={name}
      />,
      "create-edit-note"
    );
  });
}
