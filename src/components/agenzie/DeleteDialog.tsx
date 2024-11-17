import { Checkbox } from "@/components/ui/checkbox";
import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { showMsg } from "@/lib/myutils";
import { useEffect, useState } from "react";
import { agency as agencyApi } from "../../api/agency";
import CustomSearchSelect from "../customComponents/CustomSearchSelect";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import { models } from "@types";
type DeleteDialogProps = {
  resolver: (value: boolean) => void;
  name: string;
  id: number;
  clients: number;
};
function DeleteDialog({ resolver, clients, id, name }: DeleteDialogProps) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"delete" | "swap" | "system">(
    "delete"
  );
  const [agency, setAgency] = useState<models.agency.Agency | undefined>(
    undefined
  );
  const [agencyList, setAgencyList] = useState<models.agency.Agency[]>([]);
  useEffect(() => {
    const { request, abort } = agencyApi.getAgencies(`limit=50&not=${id}`);
    request.then((response) => {
      if (response.success) {
        setAgencyList(response.data.list);
      }
    });
    return () => {
      abort();
    };
  }, [id]);
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
          {clients > 0 && (
            <div className="flex flex-col gap-2">
              <p>
                <b>{name}</b> ha{" "}
                <strong className="text-blux">{clients}</strong> clienti,
                seleziona la modalità di eliminazione.
              </p>
              <div className="flex">
                <div className="flex items-center">
                  <Checkbox
                    className="mr-2 text"
                    checked={deleteMode === "delete"}
                    onCheckedChange={(checkState) => {
                      if (checkState) {
                        setDeleteMode("delete");
                      }
                    }}
                  />
                </div>
                <p>Elimina {clients} clienti</p>
              </div>
              <div className="flex">
                <div className="flex items-center">
                  <Checkbox
                    className="mr-2"
                    checked={deleteMode === "system"}
                    onCheckedChange={(checkState) => {
                      if (checkState) {
                        setDeleteMode("system");
                      }
                    }}
                  />
                </div>
                <p>Assegna clienti al sistema</p>
              </div>
              <div className="flex">
                <div className="flex items-center">
                  <Checkbox
                    className="mr-2 text-blux selected:text-blux"
                    checked={deleteMode === "swap"}
                    onCheckedChange={(checkState) => {
                      if (checkState) {
                        setDeleteMode("swap");
                      }
                    }}
                  />
                </div>
                <p>
                  Assegna clienti{" "}
                  {agency ? "a " + agency.name : "ad un'altra agenzia"}
                </p>
              </div>
              {deleteMode === "swap" && (
                <>
                  <CustomSearchSelect
                    items={agencyList}
                    onItem={(item) => {
                      setAgency(item);
                    }}
                    renderer={(item) => {
                      return item.name;
                    }}
                    keyId={"id"}
                    onTextChange={async (text: string) => {
                      const { data, success } = await agencyApi.getAgencies(
                        `search=${text}&limit=50&not=${id}`
                      ).request;
                      if (success) {
                        setAgencyList(data.list);
                      }
                    }}
                    selected={agency}
                    selectedKey="id"
                    placeholder="Cerca agenzia..."
                  />
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={async () => {
                setLoading(true);
                const action = deleteMode === "swap" ? agency?.id : deleteMode;
                if (action === undefined) {
                  showMsg(
                    "Seleziona un'agezia a cui assegnare i clienti.",
                    "warning"
                  );
                  setLoading(false);
                  return;
                }
                const { success, error } = await agencyApi.deleteAgency(
                  id,
                  action
                ).request;
                if (success) {
                  setOpen(false);
                  setTimeout(() => {
                    resolver(true);
                  }, 500);
                } else {
                  setLoading(false);
                  error.display();
                }
              }}
            >
              Elimina
            </Button>
            <DialogClose className="hidden" id="close-dialog-delete-agency" />
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
export function deleteAgency(
  id: number,
  name: string,
  clients: number
): Promise<boolean> {
  return new Promise<boolean>((r) => {
    const resolver = (value: boolean) => {
      removeDialog("delete-agency-dialog");
      r(value);
    };
    addDialog(
      <DeleteDialog
        resolver={resolver}
        clients={clients}
        id={id}
        name={name}
      />,
      "delete-agency-dialog"
    );
  });
}
