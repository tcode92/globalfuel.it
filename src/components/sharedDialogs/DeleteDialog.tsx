import { getUniqueId } from "@/lib/utils";
import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { ReactNode, useState } from "react";
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
  title: string;
  description?: string;
  children?: ReactNode;
};
function DeleteFile({
  resolver,
  title,
  description,
  children,
}: DeleteDialogProps) {
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
            <DialogTitle className="text-blux mb-2">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={async () => {
                resolver(true);
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

export function deleteDialog(
  data: Omit<DeleteDialogProps, "resolver">
): Promise<PromiseResult> {
  const unmountDelay = 500;
  const rId = getUniqueId();
  return new Promise<PromiseResult>((r) => {
    const resolver = (value: PromiseResult) => {
      r(value);
      setTimeout(() => {
        removeDialog(rId);
      }, unmountDelay);
    };
    addDialog(<DeleteFile {...data} resolver={resolver} />, rId);
  });
}
