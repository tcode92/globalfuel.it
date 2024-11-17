import { agency as agencyApi } from "@/api/agency";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMAIL_REGEX, isEmpty } from "@/constants";
import { getUniqueId } from "@/lib/utils";
import { useAgencyStore } from "@/store/AgencyStore";
import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { getFormDataFromEvent } from "@/utils/formdata";
import { useState } from "react";
function CreateEdit({
  onClose,
  agency,
  resolver,
}: {
  onClose?: (state: boolean) => void;
  agency?: { id: number; name: string; email: string } & object;
  resolver: () => void;
}) {
  const { add, update } = useAgencyStore();
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
  }>({
    email: undefined,
    name: undefined,
  });
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      modal={true}
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (onClose && val === false) onClose(false);
        if (val === false) {
          setTimeout(() => {
            resolver();
          }, 500);
        }
      }}
      defaultOpen
    >
      <DialogPortal>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-blux">
              {agency ? `Modifica ${agency.name}` : "Nuova agenzia"}
            </DialogTitle>
            <DialogDescription>
              {agency ? "Modifica" : "Inserisci"} i dati dell&apos;agenzia.
              Salva quando hai finito.
            </DialogDescription>
            {!agency && (
              <DialogDescription>
                La password verrà inviata via email.
              </DialogDescription>
            )}
          </DialogHeader>
          <form
            className="grid gap-4 py-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = getFormDataFromEvent<{
                name: string;
                email: string;
              }>(e);
              const errs = validateAgency(formData);
              if (Object.keys(errs).length > 0) {
                setErrors(errs);
                return;
              }
              const action = agency
                ? agencyApi.updateAgency(agency.id, formData)
                : agencyApi.createAgency(formData);
              const { success, data, error } = await action.request;
              if (success) {
                if (agency) {
                  update(data);
                } else {
                  add(data);
                }
                setOpen(false);
              } else {
                error?.display();
              }
            }}
          >
            {/* name */}
            <div className="grid grid-cols-[50px_1fr] items-center gap-4">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                defaultValue={agency?.name}
                onChange={(e) => {
                  setErrors((prev) => ({
                    ...prev,
                    name: undefined,
                  }));
                }}
              />
              {errors.name && (
                <p className="text-red-500 col-start-2 -mt-2">{errors.name}</p>
              )}
            </div>
            {/* email */}
            <div className="grid grid-cols-[50px_1fr] items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={agency?.email}
                onChange={(e) => {
                  setErrors((prev) => ({
                    ...prev,
                    email: undefined,
                  }));
                }}
              />
              {errors.email && (
                <p className="text-red-500 col-start-2 -mt-2">{errors.email}</p>
              )}
            </div>
            {/* maybe other data */}
            {/* password */}
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Password*
              </Label>
              <Input id="password" className="col-span-3" />
            </div> */}
            <DialogFooter>
              <Button type="submit" variant={"blue"}>Salva</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
export function createEditAgency(
  agency?: { id: number; name: string; email: string } & object,
  onClose?: (state: boolean) => void
) {
  const id = getUniqueId();
  const resolver = () => {
    removeDialog(`create-update-agency-${id}`);
  };
  addDialog(
    <CreateEdit agency={agency} onClose={onClose} resolver={resolver} />,
    `create-update-agency-${id}`
  );
}

function validateAgency(agency: { name: string; email: string }) {
  let errors: { email?: string; name?: string } = {};
  if (isEmpty(agency.name)) {
    errors.name = "Nome agenzia mancante.";
  }
  if (isEmpty(agency.email)) {
    errors.email = "Email mancante.";
  } else {
    if (!EMAIL_REGEX.test(agency.email)) {
      errors.email = "Email non valida.";
    }
  }
  return errors;
}
