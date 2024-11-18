import {
  CF_REGEX,
  EMAIL_REGEX,
  PHONE2_REGEX,
  POSTALCODE_REGEX,
  SDI_REGEX,
  VAT_REGEX,
  isEmpty,
  isValidDate,
  isValidPhone,
  transformDate,
} from "@constants";
import { getFormDataFromEvent } from "@/utils/formdata";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InputError from "../customComponents/InputError";
import InputWrapper from "../customComponents/InputWrapper";
import { SelectCustom } from "../customComponents/Select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { client } from "@/api/clients";
import { models } from "@types";

export const FG: models.client.FullClient["fg"][] = [
  "assoc.",
  "coop",
  "ditta individuale",
  "libero professionista",
  "onlus e CRI",
  "pubblica amministrazione",
  "sas",
  "snc",
  "spa",
  "srl",
  "srls",
];
type OptionsFlags<Type> = {
  [Property in keyof Type]?: Type[Property] extends object
    ? OptionsFlags<Type[Property]> // If the property is an object, recursively apply OptionsFlags
    : string; // Otherwise, the value is a string
};
export type ClientErrors = OptionsFlags<models.client.FullClient>;
export default function CreateEditClientForm({
  data,
  onValidData,
  isPublic,
}: {
  isPublic?: boolean;
  data?: Partial<models.client.FullClient>;
  /**
   * This allow to handle the submission of the data externaly
   *
   *
   * @param client Full client
   * @returns true | Errors
   */
  onValidData?: (
    client: models.client.FullClient
  ) => Promise<ClientErrors | undefined | void>;
}) {
  const router = useRouter();
  const [error, setError] = useState<ClientErrors>({});
  function removeErr<T extends keyof ClientErrors>(
    err: T,
    overrideVal?: T extends "address" ? ClientErrors[T] : never
  ) {
    setError((prev) => {
      if (err === "address") {
      }
      return {
        ...prev,
        [err]:
          err === "address" && overrideVal
            ? { ...prev["address"], ...overrideVal }
            : undefined,
      };
    });
  }
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError({});
    const formData = getFormDataFromEvent<models.client.FullClient>(e);
    // validate form
    const errs = validateClient(formData);
    if (Object.keys(errs).length > 0) {
      setError(errs);
      return;
    } else {
      // this is used to handle the submission of the form externally.
      // if onValidData is present submitting the data to the server is on you
      if (onValidData) {
        const errors = await onValidData(formData);
        if (typeof errors === "object") {
          setError(errors);
        }
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
        } else {
          error.display();
        }
      }
    }
  }
  const labelClass = "text-left";
  return (
    <form
      className="flex flex-col md:grid md:grid-cols-2 gap-4 py-4 w-full"
      onSubmit={handleFormSubmit}
    >
      {/* code */}
      {/* business */}
      <InputWrapper>
        <Label htmlFor="business" className={labelClass}>
          Ragione sociale*
        </Label>
        <Input
          id="business"
          name="business"
          defaultValue={data?.business || undefined}
          onChange={() => {
            removeErr("business");
          }}
        />
        <InputError>{error.business}</InputError>
      </InputWrapper>
      {/* vat */}
      <InputWrapper>
        <Label htmlFor="vat" className={labelClass}>
          P.Iva*
        </Label>
        <Input
          id="vat"
          name="vat"
          defaultValue={data?.vat || undefined}
          onChange={() => {
            removeErr("vat");
          }}
        />
        <InputError>{error.vat}</InputError>
      </InputWrapper>
      {/* business_start */}
      <InputWrapper>
        <Label htmlFor="business_start" className={labelClass}>
          Data inizio attività
        </Label>
        <Input
          id="business_start"
          name="business_start"
          defaultValue={transformDate(data?.business_start)}
          onChange={() => {
            removeErr("business_start");
          }}
        />
        <InputError>{error.business_start}</InputError>
      </InputWrapper>
      {/* email */}
      <InputWrapper>
        <Label htmlFor="email" className={labelClass}>
          Email*
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={data?.email || undefined}
          onChange={() => {
            removeErr("email");
          }}
        />
        <InputError>{error.email}</InputError>
      </InputWrapper>
      {/* phone */}
      <InputWrapper>
        <Label htmlFor="phone" className={labelClass}>
          Telefono*
        </Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={data?.phone || undefined}
          onChange={() => {
            removeErr("phone");
          }}
        />
        <InputError>{error.phone}</InputError>
      </InputWrapper>
      {/* fax */}
      <InputWrapper>
        <Label htmlFor="fax" className={labelClass}>
          Fax
        </Label>
        <Input
          id="fax"
          name="fax"
          defaultValue={data?.fax || undefined}
          onChange={() => {
            removeErr("fax");
          }}
        />
        <InputError>{error.fax}</InputError>
      </InputWrapper>
      {/* pec */}
      <InputWrapper>
        <Label htmlFor="pec" className={labelClass}>
          PEC*
        </Label>
        <Input
          id="pec"
          name="pec"
          defaultValue={data?.pec || undefined}
          onChange={() => {
            removeErr("pec");
          }}
        />
        <InputError>{error.pec}</InputError>
      </InputWrapper>
      {/* sdi */}
      <InputWrapper>
        <Label htmlFor="sdi" className={labelClass}>
          Codice SDI
        </Label>
        <Input
          id="sdi"
          name="sdi"
          defaultValue={data?.sdi || undefined}
          onChange={() => {
            removeErr("sdi");
          }}
        />
        <InputError>{error.sdi}</InputError>
      </InputWrapper>
      {/* FG */}
      <InputWrapper>
        <Label htmlFor="fg" className={labelClass}>
          Forma giuridica*
        </Label>
        <SelectCustom
          name="fg"
          id="fg"
          values={FG}
          defaultValue={data?.fg ?? ""}
          placeHolder="Seleziona forma giuridica"
          onChange={() => {
            removeErr("fg");
          }}
        />
        <InputError>{error.fg}</InputError>
      </InputWrapper>
      {/* Address street */}
      <InputWrapper>
        <Label htmlFor="address.street" className={labelClass}>
          Indirizzo*
        </Label>
        <Input
          id="address.street"
          name="address.street"
          defaultValue={data?.address?.street ?? undefined}
          onChange={() => {
            removeErr("address", {
              street: undefined,
            });
          }}
        />
        <InputError>{error.address?.street}</InputError>
      </InputWrapper>
      {/* Address cap */}
      <InputWrapper>
        <Label htmlFor="address.postalCode" className={labelClass}>
          CAP*
        </Label>
        <Input
          id="address.postalCode"
          name="address.postalCode"
          defaultValue={data?.address?.postalCode ?? undefined}
          onChange={() => {
            removeErr("address", {
              postalCode: undefined,
            });
          }}
        />
        <InputError>{error.address?.postalCode}</InputError>
      </InputWrapper>
      {/* Address province */}
      <InputWrapper>
        <Label htmlFor="address.province" className={labelClass}>
          Provincia*
        </Label>
        <Input
          id="address.province"
          name="address.province"
          defaultValue={data?.address?.province ?? undefined}
          onChange={() => {
            removeErr("address", {
              province: undefined,
            });
          }}
        />
        <InputError>{error.address?.province}</InputError>
      </InputWrapper>
      <div className="grid grid-cols-4 gap-4 mt-2 col-span-2">
        <Button
          type="submit"
          className="col-start-4 justify-self-end self-end"
          variant={"blue"}
        >
          {isPublic && "Invia richiesta"}
          {!isPublic && <>{data ? " Salva" : "Nuovo"}</>}
        </Button>
      </div>
    </form>
  );
}
function validateClient(client: Partial<models.client.FullClient>) {
  let errors: ClientErrors = {};
  function addAddressErr(
    key: keyof models.client.FullClient["address"],
    err: string
  ) {
    if (errors.address) {
      errors.address[key] = err;
    } else {
      errors.address = { [key]: err };
    }
  }
  if (isEmpty(client.business)) {
    errors.business = "Ragione sociale mancante.";
  }
  if (isEmpty(client.vat)) {
    errors.vat = "P.Iva mancante.";
  }
  if (isEmpty(client.email)) {
    errors.email = "Email mancante.";
  }
  if (!isEmpty(client.email) && !EMAIL_REGEX.test(client.email?.trim() || "")) {
    errors.email = "Email non valida.";
  }
  if (isEmpty(client.pec)) {
    errors.pec = "PEC mancante.";
  }
  if (!isEmpty(client.pec) && !EMAIL_REGEX.test(client.pec?.trim() || "")) {
    errors.pec = "PEC non valida.";
  }
  if (!isEmpty(client.vat) && !VAT_REGEX.test(client.vat?.trim() || "")) {
    errors.vat = "P.Iva non corretta.";
  }
  if (!isEmpty(client.cf) && !CF_REGEX.test(client.cf?.trim() || "")) {
    errors.cf = "Codice fiscale non valido.";
  }
  if (isEmpty(client.phone)) {
    errors.phone = "Telefono mancante.";
  }
  if (!isEmpty(client.phone) && !isValidPhone(client.phone)) {
    errors.phone = "Telefono non valido.";
  }
  if (
    !isEmpty(client.fax) &&
    !PHONE2_REGEX.test(client.fax?.replaceAll(" ", "") || "")
  ) {
    errors.fax = "Fax non valido.";
  }
  /* if (isEmpty(client.sdi)) {
    errors.sdi = "Codice SDI mancante.";
  } */
  if (isEmpty(client.fg)) {
    errors.fg = "Seleziona forma giuridica.";
  }
  if (!isEmpty(client.sdi) && !SDI_REGEX.test(client.sdi || "")) {
    errors.sdi = "Codice SDI non valido.";
  }
  if (isEmpty(client.address?.street)) {
    addAddressErr("street", "Indirizzo mancante.");
  }
  if (isEmpty(client.address?.postalCode)) {
    addAddressErr("postalCode", "CAP mancante.");
  }
  if (
    !isEmpty(client.address?.postalCode) &&
    !POSTALCODE_REGEX.test(client.address?.postalCode.replaceAll(" ", "") || "")
  ) {
    addAddressErr("postalCode", "CAP non valido.");
  }
  if (isEmpty(client.address?.province)) {
    addAddressErr("province", "Provincia mancante.");
  }
  if (!isEmpty(client.business_start) && !isValidDate(client.business_start)) {
    errors.business_start = "Data non valida.";
  }
  return errors;
}
