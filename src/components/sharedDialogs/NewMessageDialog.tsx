import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { useRef, useState } from "react";
import { Button } from "../ui/button";

import { msg } from "@/api/message";
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
type PromiseResult = null;
type CreateNewMessageProps = {
  resolver: (value: PromiseResult) => void;
  name: string;
  id: number;
};
function SendMessageDialog({ resolver, id, name }: CreateNewMessageProps) {
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
            <DialogTitle className="text-blux">Nuovo messaggio</DialogTitle>
            <DialogDescription>{name}</DialogDescription>
          </DialogHeader>
          <Textarea ref={inputRef} />
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
                const { success, error } = await msg.create({
                  clientId: id,
                  message: newText,
                }).request;
                if (success) {
                  setOpen(false);
                  resolver(null);
                } else {
                  setLoading(false);
                  error.display();
                }
              }}
            >
              Invia
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function sendMessage(
  clientId: number,
  name: string
): Promise<PromiseResult> {
  const unmountDelay = 500;
  return new Promise<PromiseResult>((r) => {
    const resolver = (value: PromiseResult) => {
      r(value);
      setTimeout(() => {
        removeDialog("send-message");
      }, unmountDelay);
    };
    addDialog(
      <SendMessageDialog resolver={resolver} id={clientId} name={name} />,
      "send-message"
    );
  });
}
