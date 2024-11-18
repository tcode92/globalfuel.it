"use client";
import { auth } from "@/api/auth";
import { validatePassword } from "@constants";
import { showMsg } from "@/lib/myutils";
import { getFormDataFromEvent } from "@/utils/formdata";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DefaultMain from "../layout/DefaultMain";
import { Label } from "recharts";
import { InputPassword } from "../customComponents/PasswordInput";
import { Button } from "../ui/button";

export const PasswordResetPage = () => {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const query = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setToken(null);
      return;
    }
    setError(null);
    const formData = getFormDataFromEvent<{
      password: string;
      passwordConfirm: string;
    }>(e);
    const err = validatePassword(formData);
    if (err) {
      setError(err);
      return;
    }
    const { success, data, error } = await auth.resetPasswordWithToken({
      ...formData,
      token,
    }).request;
    if (success && data === "OK") {
      router.replace("/dashboard");
      return;
    }
    if (data === "EXPIRED") {
      showMsg(
        "Il tempo per reimpostare la password è scaduto o il link non è più valido.\nDevi effettuare il recupero password di nuovo."
      );
      router.replace("/reimposta-password");
      return;
    }
    if (data === "INVALID") {
      setToken(null);
      return;
    }
    if (error) {
      error.display();
    }
  }

  useEffect(() => {
    if (!query) return;
    if (token === null) return;
    const t = query.get("token");
    if (typeof t === "string" && t.length > 10) {
      setToken(t);
    } else {
      setToken(null);
    }
  }, [query, router, token]);
  return (
    <>
      <DefaultMain className="flex flex-col flex-1 items-center justify-center">
        {token === undefined && <p>Caricamento...</p>}
        {token === null && (
          <>
            <p>Ci è stato un errore temporano.</p>
            <p>Ti preghiamo di riprovare più tardi.</p>
          </>
        )}
        {typeof token === "string" && (
          <div className="max-w-[500px] w-full flex items-center flex-col">
            <div className="text-center text-blux text-2xl font-bold uppercase">
              Reimposta password
            </div>
            <p className="text-center text-sm mt-4">
              La password deve essere almeno 8 caratteri, una lettera maiuscola,
              una lettera minuscola, un numero e un carattere speciale tra:
              <br /> , ; . : - _ ! &apos; &quot; £ $ % & ( ) = ? ^ § ] [ &gt;
              &lt; @ ° #
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex gap-4 flex-col max-w-64 w-full mt-4"
            >
              <div>
                <Label>Nuova password</Label>
                <InputPassword
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label>Conferma password</Label>
                <InputPassword
                  type="password"
                  name="passwordConfirm"
                  id="password-confirm"
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}

              <Button type="submit" variant={"blue"}>
                Conferma
              </Button>
            </form>
          </div>
        )}
      </DefaultMain>
    </>
  );
};
