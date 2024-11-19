"use client";

import InputWrapper from "../customComponents/InputWrapper";
import { Input } from "../ui/input";
import InputError from "../customComponents/InputError";
import { Button } from "../ui/button";
import { FormEvent, useState } from "react";
import { getFormDataFromEvent } from "@/utils/formdata";
import {
  CreateWorkWithUsInput,
  CreateWorkWithUsSchema,
} from "@validation/workWithUs";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { wwu } from "@/api/wwu";
import {
  prettyError,
  ZodErrorRecord,
  ZodErrorRecordString,
} from "@validation/base";

export const WorkWithUsForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<ZodErrorRecordString>({});
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const formData = getFormDataFromEvent<CreateWorkWithUsInput>(e);
    setLoading(true);
    const data = CreateWorkWithUsSchema.safeParse({
      ...formData,
      consent: true,
    });
    if (!data.success) {
      const errorFields = prettyError(data.error).fields;
      setErrors(errorFields as ZodErrorRecordString);
      setLoading(false);
      return;
    }
    const result = await wwu.create(data.data).request;
    if (result.error && !result.error.isAbortError) {
      result.error.display();
    }
    if (result.success) {
      setSuccess(true);
      return;
    }
    setLoading(false);
  }
  function clearErr(target: keyof CreateWorkWithUsInput) {
    if (errors[target]) {
      setErrors((prev) => ({ ...prev, [target]: undefined }));
    }
  }
  return (
    <form
      className="gap-4 flex flex-col md:grid md:grid-cols-2 justify-items-end w-full"
      onSubmit={handleSubmit}
    >
      <InputWrapper>
        <Label>Nome *</Label>
        <Input
          placeholder="Nome"
          name="name"
          onChange={() => clearErr("name")}
        />
        <InputError>{errors.name}</InputError>
      </InputWrapper>
      <InputWrapper>
        <Label>Cognome *</Label>
        <Input
          placeholder="Cognome"
          name="surname"
          onChange={() => clearErr("surname")}
        />
        <InputError>{errors.surname}</InputError>
      </InputWrapper>
      <InputWrapper>
        <Label>Ragione sociale *</Label>
        <Input
          placeholder="Ragione sociale"
          name="business"
          onChange={() => clearErr("business")}
        />
        <InputError>{errors.business}</InputError>
      </InputWrapper>
      <InputWrapper>
        <Label>P. IVA *</Label>
        <Input
          placeholder="P. Iva."
          name="vat"
          onChange={() => clearErr("vat")}
        />
        <InputError>{errors.vat}</InputError>
      </InputWrapper>
      <InputWrapper>
        <Label>Email *</Label>
        <Input
          placeholder="Email"
          type="email"
          name="email"
          onChange={() => clearErr("email")}
        />
        <InputError>{errors.email}</InputError>
      </InputWrapper>
      <InputWrapper>
        <Label>Telefono *</Label>
        <Input
          placeholder="Telefono"
          name="phone"
          type="phone"
          onChange={() => clearErr("phone")}
        />
        <InputError>{errors.phone}</InputError>
      </InputWrapper>
      <div className="col-span-2 w-full">
        <InputWrapper>
          <Label className="flex items-start text-[1rem] leading-4">
            <Checkbox
              className="mr-2"
              value={consent ? "on" : "off"}
              onCheckedChange={() => setConsent((prev) => !prev)}
            />{" "}
            Dichiaro di aver letto l&apos;informativa privacy.
          </Label>
        </InputWrapper>
      </div>
      {success && (
        <div className="col-span-2 w-full text-center font-bold text-green-700">
          Abbiamo ricevuto la tua richiesta, il nostro team ti contatterà al più
          presto!
        </div>
      )}
      <Button
        variant={"blue"}
        className="self-end col-span-2"
        disabled={!consent || loading}
      >
        Invia
      </Button>
    </form>
  );
};
