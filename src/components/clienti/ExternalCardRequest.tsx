import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InputError from "../customComponents/InputError";
import InputWrapper from "../customComponents/InputWrapper";
import { IR } from "../customComponents/RequiredMark";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type OptionsFlags<Type> = {
  [Property in keyof Type]?: Type[Property] extends object
    ? OptionsFlags<Type[Property]> // If the property is an object, recursively apply OptionsFlags
    : string; // Otherwise, the value is a string
};
export type ClientErrors = OptionsFlags<{
  business: string;
  vat: string;
  address: string;
  email: string;
  phone: string;
  liters: string;
  amount: string;
}>;

export default function ExternalCardReqForm() {
  const router = useRouter();
  const [error, setError] = useState<ClientErrors>({});
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  function removeErr<T extends keyof ClientErrors>(err: T) {
    setError((prev) => {
      return {
        ...prev,
        [err]: undefined,
      };
    });
  }
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    /* e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError({});
    const formData = getFormDataFromEvent<models.client.FullClient>(e);
    // validate form
    const errs = validateClient(formData);
    if (Object.keys(errs).length > 0) {
      setError(errs);
      setLoading(false);
      return;
    } else {
      // this is used to handle the submission of the form externally.
      // if onValidData is present submitting the data to the server is on you
      if (onValidData) {
        const errors = await onValidData(formData);
        if (typeof errors === "object") {
          setError(errors);
        }
        setLoading(false);
        return;
      }
      // submitform
      const action =
        data && data.id
          ? client.update(data.id, formData)
          : client.create(formData);
      const { success, error, data: response } = await action.request;
      if (success) {
        router.back();
      } else {
        if (response?.error && response.error.fields) {
          setError(response.error.fields);
          setLoading(false);
        } else {
          error.display();
          setLoading(false);
        }
      }
    } */
  }
  const labelClass = "text-left";
  return (
    <form
      className="flex flex-col md:grid md:grid-cols-2 gap-4 py-4 w-full"
      onSubmit={handleFormSubmit}
      autoComplete="on"
    >
      {/* code */}
      {/* business */}
      <InputWrapper>
        <Label htmlFor="business" className={labelClass}>
          Ragione sociale <IR />
        </Label>
        <Input
          required
          id="business"
          name="business"
          autoComplete="organization"
          onChange={() => {
            removeErr("business");
          }}
        />
        <InputError>{error.business}</InputError>
      </InputWrapper>
      {/* vat */}
      <InputWrapper>
        <Label htmlFor="vat" className={labelClass}>
          P.Iva <IR />
        </Label>
        <Input
          required
          id="vat"
          name="vat"
          onChange={() => {
            removeErr("vat");
          }}
        />
        <InputError>{error.vat}</InputError>
      </InputWrapper>
      {/* Address */}
      <InputWrapper>
        <Label htmlFor="address" className={labelClass}>
          Sede <IR />
        </Label>
        <Input
          id="address"
          name="address"
          onChange={() => {
            removeErr("address");
          }}
        />
        <InputError>{error.address}</InputError>
      </InputWrapper>
      {/* email */}
      <InputWrapper>
        <Label htmlFor="email" className={labelClass}>
          Email <IR />
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          onChange={() => {
            removeErr("email");
          }}
        />
        <InputError>{error.email}</InputError>
      </InputWrapper>
      {/* phone */}
      <InputWrapper>
        <Label htmlFor="phone" className={labelClass}>
          Telefono <IR />
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Inserisci il numero di telefono"
          autoComplete="tel"
          required
          onChange={() => {
            removeErr("phone");
          }}
        />
        <InputError>{error.phone}</InputError>
      </InputWrapper>
      <div></div>
      <div className="col-span-2 w-full font-bold text-blux-600">Consumi</div>
      <InputWrapper>
        <Label htmlFor="phone" className={labelClass}>
          Litri/mese
        </Label>
        <Input
          id="liters"
          name="liters"
          type="number"
          onChange={() => {
            removeErr("liters");
          }}
        />
        <InputError>{error.liters}</InputError>
      </InputWrapper>
      <InputWrapper>
        <Label htmlFor="phone" className={labelClass}>
          Euro/mese
        </Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          onChange={() => {
            removeErr("amount");
          }}
        />
        <InputError>{error.amount}</InputError>
      </InputWrapper>
      <div className="col-span-2 w-full my-4">
        <InputWrapper>
          <Label className="flex items-start text-[1rem] leading-4">
            <Checkbox
              className="mr-2"
              value={consent ? "on" : "off"}
              onCheckedChange={() => setConsent((prev) => !prev)}
            />{" "}
            Autorizzo il trattamento dei dati ai sensi del D. Lgs. 30/06/03 n°
            196 e del GDPR (UE 2016 679).
          </Label>
        </InputWrapper>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-2 col-span-2">
        <Button
          type="submit"
          className="col-start-4 justify-self-end self-end"
          variant={"blue"}
          disabled={!consent || loading}
        >
          Invia richiesta
        </Button>
      </div>
    </form>
  );
}
