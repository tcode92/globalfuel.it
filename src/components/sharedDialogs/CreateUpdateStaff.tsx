import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { getFormDataFromEvent } from "@/utils/formdata";
import { useState } from "react";
import InputWrapper from "../customComponents/InputWrapper";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { staff } from "@/api/staff";
import { EMAIL_REGEX, isEmpty } from "@/constants";
import InputError from "../customComponents/InputError";
import { models } from "@types";
type PromiseResult = models.staff.Staff | null;
type DeleteDialogProps = {
  resolver: (value: PromiseResult) => void;
  data?: {
    name: string;
    email: string;
    id: number;
  };
};
function CreateUpdateStaff({ resolver, data }: DeleteDialogProps) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const formData = getFormDataFromEvent<{
      name: string;
      email: string;
    }>(e);
    const errs = verifyUser(formData);
    if (Object.entries(errs).length > 1) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    const action = data
      ? staff.update(data.id, formData)
      : staff.create(formData);
    const { data: response, success, error } = await action.request;
    if (success) {
      resolver(response);
    } else {
      error.display();
    }
    setLoading(false);
  }
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
              {data ? `Modifica ${data.name}` : "Nuovo utente"}
            </DialogTitle>
            {!data && (
              <DialogDescription>
                La password verrà inviata via email.
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputWrapper>
              <Label>Nome</Label>
              <Input
                defaultValue={data?.name}
                name="name"
                id="name"
                onChange={(e) => {
                  setErrors((prev) => ({
                    ...prev,
                    name: undefined,
                  }));
                }}
              />
              <InputError>{errors.name}</InputError>
            </InputWrapper>
            <InputWrapper>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                id="email"
                defaultValue={data?.email}
                onChange={(e) => {
                  setErrors((prev) => ({
                    ...prev,
                    email: undefined,
                  }));
                }}
              />
              <InputError>{errors.email}</InputError>
            </InputWrapper>
            <DialogFooter>
              <Button type="submit" variant={"blue"}>
                {data ? "Modifica" : "Salva"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function createUpdateStaff(data?: {
  id: number;
  name: string;
  email: string;
}): Promise<PromiseResult> {
  const unmountDelay = 500;
  return new Promise<PromiseResult>((r) => {
    const resolver = (value: PromiseResult) => {
      r(value);
      setTimeout(() => {
        removeDialog("create-update-staff");
      }, unmountDelay);
    };
    addDialog(
      <CreateUpdateStaff resolver={resolver} data={data} />,
      "create-update-staff"
    );
  });
}
function verifyUser(data: { name: string; email: string }) {
  let errors: {
    email?: string;
    name?: string;
  } = {};
  if (isEmpty(data.name)) {
    errors.name = "Nome mancante.";
  }
  if (isEmpty(data.email)) {
    errors.email = "Email mancante.";
  }
  if (!isEmpty(data.email) && !EMAIL_REGEX.test(data.email)) {
    errors.email = "Email non valida.";
  }
  return errors;
}
