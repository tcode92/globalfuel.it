import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { useRef, useState } from "react";
import { Button } from "../ui/button";

import { fileApi } from "@/api/file";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
type PromiseResult = string | null;
type DeleteDialogProps = {
  resolver: (value: PromiseResult) => void;
  name: string;
  id: number;
};
function RenameDocument({ resolver, id, name }: DeleteDialogProps) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
            <DialogTitle>Rinomina {name}</DialogTitle>
            <DialogDescription>
              <Input defaultValue={name} className="mt-4" ref={inputRef} />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!inputRef.current) return;
                const newName = inputRef.current.value.trim();
                if (newName === name.trim()) {
                  setOpen(false);
                  resolver(null);
                  return;
                }
                setLoading(true);
                const { success, data } = await fileApi.rename(id, newName)
                  .request;
                if (success) {
                  setOpen(false);
                  resolver(data.name);
                } else {
                  setLoading(false);
                  // show error
                }
              }}
            >
              Rinomina
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function renameDocument(
  id: number,
  name: string
): Promise<PromiseResult> {
  const unmountDelay = 500;
  return new Promise<PromiseResult>((r) => {
    const resolver = (value: PromiseResult) => {
      r(value);
      setTimeout(() => {
        removeDialog("rename-document");
      }, unmountDelay);
    };
    addDialog(
      <RenameDocument resolver={resolver} id={id} name={name} />,
      "rename-document"
    );
  });
}
