import { fileApi } from "@/api/file";
import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
type PromiseResult = boolean;
type DeleteDialogProps = {
  resolver: (value: PromiseResult) => void;
  name: string;
  id: number;
};
function DeleteFile({ resolver, id, name }: DeleteDialogProps) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog
      modal={true}
      open={open}
      onOpenChange={(value) => {
        if (loading) return;
        setOpen(value);
        resolver(false);
      }}
    >
      <DialogPortal>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Elimina {name}</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare il file {name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={async () => {
                setLoading(true);
                const { success, data } = await fileApi.deleteFile(id).request;
                if (success) {
                  setOpen(false);
                  resolver(true);
                } else {
                  setLoading(false);
                  // show error
                }
              }}
            >
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function deleteFile(id: number, name: string): Promise<PromiseResult> {
  const unmountDelay = 500;
  return new Promise<PromiseResult>((r) => {
    const resolver = (value: PromiseResult) => {
      r(value);
      setTimeout(() => {
        removeDialog("delete-document");
      }, unmountDelay);
    };
    addDialog(
      <DeleteFile resolver={resolver} id={id} name={name} />,
      "delete-document"
    );
  });
}
