import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { client } from "@/api/clients";
import { getUniqueId } from "@/lib/utils";
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
import { showMsg } from "@/lib/myutils";
type PromiseResult = string | null | undefined;
type DeleteDialogProps = {
  resolver: (value: PromiseResult) => void;
  name: string;
  id: number;
  code: string | null;
};
function ClientCode({ resolver, id, name, code }: DeleteDialogProps) {
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
            <DialogTitle className="text-blux">
              Codice cliente: {name}
            </DialogTitle>
            <DialogDescription>
              <Input
                defaultValue={code || undefined}
                className="mt-4"
                ref={inputRef}
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={"blue"}
              onClick={async () => {
                if (!inputRef.current) return;
                const newCode = inputRef.current.value.trim();
                if (newCode.trim() === code?.trim()) {
                  setOpen(false);
                  resolver(undefined);
                  return;
                }
                const c = newCode.trim() === "" ? null : newCode.trim();
                setLoading(true);
                const { success, error } = await client.updateCode(id, c)
                  .request;
                if (success) {
                  setOpen(false);
                  showMsg("Il nuovo codice è stato inviato.", "success");
                  resolver(c);
                } else {
                  setLoading(false);
                  error?.display();
                }
              }}
            >
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function clientCode(
  id: number,
  name: string,
  code: string | null
): Promise<PromiseResult> {
  const unmountDelay = 500;
  const uId = getUniqueId();
  return new Promise<PromiseResult>((r) => {
    const resolver = (value: PromiseResult) => {
      r(value);
      setTimeout(() => {
        removeDialog(uId);
      }, unmountDelay);
    };
    addDialog(
      <ClientCode resolver={resolver} code={code} id={id} name={name} />,
      uId
    );
  });
}
