import { useState } from "react";
import { client as clientApi } from "../../api/clients";
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
import { addDialog, removeDialog } from "@/store/DialogsUiStore";

type DeleteDialogProps = {
  resolver: (value: boolean) => void;
  name: string;
  id: number;
};
function DeleteDialog({ resolver, id, name }: DeleteDialogProps) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  return (
    <Dialog
      modal={true}
      open={open}
      onOpenChange={(value) => {
        if (loading) return;
        setOpen(value);
        setTimeout(() => {
          resolver(value);
        }, 500);
      }}
    >
      <DialogPortal>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-blux">Elimina {name}</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare {name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={async () => {
                setLoading(true);

                const { success } = await clientApi.deleteClient(id).request;
                if (success) {
                  setOpen(false);
                  setTimeout(() => {
                    resolver(true);
                  }, 500);
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

export function deleteClient(id: number, name: string): Promise<boolean> {
  return new Promise<boolean>((r) => {
    const resolver = (value: boolean) => {
      removeDialog("delete-client-dialog");
      r(value);
    };
    addDialog(
      <DeleteDialog resolver={resolver} id={id} name={name} />,
      "delete-client-dialog"
    );
  });
}
