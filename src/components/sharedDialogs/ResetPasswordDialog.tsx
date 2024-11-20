import { auth } from "@/api/auth";
import { generatePassword, validatePassword } from "@constants";
import { showMsg } from "@/lib/myutils";
import { getUniqueId } from "@/lib/utils";
import { addDialog, removeDialog } from "@/store/DialogsUiStore";
import { getFormDataFromEvent } from "@/utils/formdata";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import InputWrapper from "../customComponents/InputWrapper";
import { InputPassword } from "../customComponents/PasswordInput";
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
import { Label } from "../ui/label";

function ResetPassword({
  resolver,
  token,
  noClose,
}: {
  resolver: () => void;
  token?: string;
  noClose?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const confPassRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [autoGen, setAutoGen] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const formData = getFormDataFromEvent<{
      password: string;
      passwordConfirm: string;
    }>(e);
    const err = validatePassword(formData);
    if (err) {
      setError(err);
      return;
    }
    if (!token) {
      const { success, error } = await auth.resetPassword(formData).request;
      if (success) {
        setOpen(false);
        resolver();
        showMsg("Password aggiornata.", "success");
      } else {
        error?.display();
      }
    } else {
      const { error, status, data } = await auth.resetPasswordWithToken({
        ...formData,
        token,
      }).request;
      // we will only have errors here even if request was good.
      // the "good error is a redirect status code meaning we successfully changed the password"
      if (status === 302) {
        setOpen(false);
        resolver();
        return;
      }
      if (data === "EXPIRED") {
        showMsg("Tempo scaduto, effettua il recupero di nuovo.");
        router.replace("/reset-password");
        return;
      }
      if (data === "INVALID") {
        showMsg(["Qualcosa è andato storto...", "Riprova."]);
        router.replace("/");
        return;
      }
      error?.display();
    }
  }
  return (
    <Dialog
      modal={true}
      open={open}
      onOpenChange={(value) => {
        if (!token && !noClose) {
          setOpen(value);
          resolver();
        }
      }}
      defaultOpen
    >
      <DialogPortal>
        <DialogContent
          className="sm:max-w-[425px]"
          showClose={token === undefined && !noClose}
        >
          <DialogHeader>
            <DialogTitle className="text-blux">Nuova password</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            La password deve essere di almeno 8 caratteri, una lettera
            maiuscola, una lettera minuscola, un numero e un carattere speciale
            tra: <br /> (, ; . : - _ ! &apos; &quot; £ $ % & ( ) = ? ^ § ] [
            &gt; &lt; @ ° #)
          </DialogDescription>
          <div className="flex flex-col items-center gap-2">
            <Button
              variant={"blue"}
              size={"sm"}
              onClick={() => {
                const p = generatePassword(16);
                if (passRef.current) passRef.current.value = p;
                if (confPassRef.current) confPassRef.current.value = p;
                setAutoGen(true);
              }}
            >
              Password casuale
            </Button>
            <Button
              variant={"blue"}
              size={"sm"}
              disabled={!autoGen}
              onClick={async () => {
                if (passRef.current) {
                  navigator.clipboard
                    .writeText(passRef.current.value)
                    .then(() => showMsg("Password copiata", "success"));
                }
              }}
            >
              Copia password
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-4 flex-col">
            <InputWrapper>
              <Label>Password</Label>
              <InputPassword
                ref={passRef}
                type="password"
                name="password"
                id="password"
                autoComplete="new-password"
              />
            </InputWrapper>
            <InputWrapper>
              <Label>Conferma password</Label>
              <InputPassword
                ref={confPassRef}
                type="password"
                name="passwordConfirm"
                id="password-confirm"
                autoComplete="new-password"
              />
            </InputWrapper>
            {error && <p className="text-red-500">{error}</p>}
            <DialogFooter className="mt-2">
              <Button type="submit" variant={"blue"}>
                Conferma
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

export function resetPasswordDialog(token?: string, noClose?: boolean) {
  const id = getUniqueId();
  const resolver = () => {
    setTimeout(() => {
      removeDialog(`reset-password-${id}`);
    }, 500);
  };
  addDialog(
    <ResetPassword token={token} resolver={resolver} noClose={noClose} />,
    `reset-password-${id}`
  );
}
