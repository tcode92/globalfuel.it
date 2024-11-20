import { client } from "@/api/clients";
import { getFormDataFromEvent } from "@/utils/formdata";
import { CLIENT_FG, transformDate } from "@constants";
import { models } from "@types";
import {
  ClientCreateUpdateInput,
  ClientCreateUpdateSchema,
} from "@validation/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InputError from "../customComponents/InputError";
import InputWrapper from "../customComponents/InputWrapper";
import { IR } from "../customComponents/RequiredMark";
import { SelectCustom } from "../customComponents/Select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { typeToFlattenedError } from "zod";

type ClientErrors = Partial<
  typeToFlattenedError<ClientCreateUpdateInput>["fieldErrors"]
>;
export default function CreateEditClientForm({
  data,
  onValidData,
}: {
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
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError({});
    const formData = getFormDataFromEvent<models.client.FullClient>(e);
    // validate form
    const clientData = ClientCreateUpdateSchema.safeParse(formData);
    if (!clientData.success) {
      setError(clientData.error.formErrors.fieldErrors);
    } else {
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
          ? client.update(data.id, clientData.data)
          : client.create(clientData.data);
      const { success, error, data: response } = await action.request;
      if (success) {
        router.back();
        return;
      } else {
        if (response?.error && response.error.fields) {
          setError(response.error.fields);
        } else {
          error.display();
        }
      }
    }

    setLoading(false);
  }
  const labelClass = "text-left";
  return (
    <form
      className="flex flex-col md:grid md:grid-cols-2 gap-4 py-4 w-full"
      onSubmit={handleFormSubmit}
    >
      {/* business */}
      <InputWrapper>
        <Label htmlFor="business" className={labelClass}>
          Ragione sociale <IR />
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
          P.Iva <IR />
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

      {/* email */}
      <InputWrapper>
        <Label htmlFor="email" className={labelClass}>
          Email <IR />
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
          Telefono <IR />
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
      {/* Address  */}
      <InputWrapper>
        <Label htmlFor="address" className={labelClass}>
          Indirizzo <IR />
        </Label>
        <Input
          id="address"
          name="address"
          defaultValue={data?.address ?? undefined}
          onChange={() => {
            removeErr("address");
          }}
        />
        <InputError>{error.address}</InputError>
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

      {/* pec */}
      <InputWrapper>
        <Label htmlFor="pec" className={labelClass}>
          PEC
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

      {/* FG */}
      <InputWrapper>
        <Label htmlFor="fg" className={labelClass}>
          Forma giuridica
        </Label>
        <SelectCustom
          name="fg"
          id="fg"
          values={CLIENT_FG}
          defaultValue={data?.fg ?? ""}
          placeHolder="Seleziona forma giuridica"
          onChange={() => {
            removeErr("fg");
          }}
        />
        <InputError>{error.fg}</InputError>
      </InputWrapper>
      <InputWrapper>
        <Label htmlFor="cf" className={labelClass}>
          Codice fiscale
        </Label>
        <Input
          id="cf"
          name="cf"
          defaultValue={data?.cf ?? ""}
          onChange={() => {
            removeErr("cf");
          }}
        />
        <InputError>{error.cf}</InputError>
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
      <div className="col-span-2 w-full font-bold text-blux-600">Consumi</div>
      <InputWrapper>
        <Label htmlFor="liters" className={labelClass}>
          Litri/mese
        </Label>
        <Input
          id="liters"
          name="liters"
          type="number"
          defaultValue={data?.liters ?? ""}
          onChange={() => {
            removeErr("liters");
          }}
        />
        <InputError>{error.liters}</InputError>
      </InputWrapper>
      <InputWrapper>
        <Label htmlFor="amount" className={labelClass}>
          Euro/mese
        </Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          defaultValue={data?.amount ?? ""}
          onChange={() => {
            removeErr("amount");
          }}
        />
        <InputError>{error.amount}</InputError>
      </InputWrapper>
      <div className="grid grid-cols-4 gap-4 mt-2 col-span-2">
        <Button
          type="submit"
          className="col-start-4 justify-self-end self-end"
          variant={"blue"}
          disabled={loading}
        >
          {data ? " Salva" : "Nuovo"}
        </Button>
      </div>
    </form>
  );
}
