import { ZodAny, ZodEnum, ZodString, z } from "zod";

import {
  CF_REGEX,
  ClientFG,
  ClientState,
  ClientType,
  PHONE2_REGEX,
  PHONE_REGEX,
  SDI_REGEX,
  VAT_REGEX,
} from "@constants";
import { zEmail } from "./base";

export const ClientCreateUpdateSchema = z.object({
  business: EmptyString(
    z.string({
      invalid_type_error: "Ragione sociale non valida.",
      required_error: "Ragione sociale mancante.",
    })
  ),
  email: EmptyString(
    zEmail({
      invalid_error: "Email non valida.",
      required_error: "Email mancante.",
      invalid_type_error: "Email non valida.",
    })
  ),
  vat: EmptyString(
    z
      .string({
        required_error: "P.Iva mancante.",
      })
      .regex(VAT_REGEX, { message: "Partita iva non valida." })
  ),
  phone: EmptyString(
    z.string({
      required_error: "Telefono mancante.",
    })
  ).superRefine((arg, ctx) => {
    if (!PHONE_REGEX.test(arg) && !PHONE2_REGEX.test(arg)) {
      ctx.addIssue({
        code: "invalid_string",
        message: "Telefono non valido.",
        validation: "regex",
      });
    }
  }),
  address: z
    .string({ message: "Sede non valida" })
    .min(1, { message: "Sede mancante." }),
  fax: EmptyStringOptionalNullable(
    z.string().regex(PHONE2_REGEX, {
      message: "Telefono non valido.",
    })
  ),
  pec: EmptyStringOptionalNullable(
    zEmail({
      invalid_error: "PEC non valida.",
      required_error: "PEC mancante.",
      invalid_type_error: "PEC non valida.",
    })
  ),
  cf: EmptyStringOptionalNullable(
    z
      .string()
      .trim()
      .toUpperCase()
      .regex(CF_REGEX, { message: "Codice fiscale non valido" })
  ),
  business_start: EmptyStringOptionalNullable(z.string()).transform(
    (arg, ctx) => {
      if (arg) {
        const date = getDateFromStr(arg);
        if (date.toString() === "Invalid Date") {
          ctx.addIssue({
            code: "invalid_date",
            message: "Data non valida.",
          });
          return z.NEVER;
        }
        if (new Date() < date) {
          ctx.addIssue({
            code: "invalid_date",
            message: "La data non può essere nel futuro.",
          });
          return z.NEVER;
        }
        return date;
      }
      return arg;
    }
  ),
  sdi: EmptyStringOptionalNullable(
    z.string().regex(SDI_REGEX, {
      message: "Codice SDI non valido.",
    })
  ),
  fg: z.preprocess((arg) => {
    if (!arg) return null;
    if (typeof arg === "string" && arg.trim() === "") return null;
    return arg;
  }, z.enum(ClientFG).optional().nullable()),
  liters: z.preprocess((arg) => {
    if (!arg) return undefined;
    return arg;
  }, z.number({ coerce: true, message: "Valore non valido" }).min(1, { message: "Solo valori maggiori di 0" }).optional()),
  amount: z.preprocess((arg) => {
    if (!arg) return undefined;
    return arg;
  }, z.number({ coerce: true, message: "Valore non valido" }).min(1, { message: "Solo valori maggiori di 0" }).optional()),
});

export type ClientCreateUpdateInput = z.infer<typeof ClientCreateUpdateSchema>;

function EmptyString(string: ZodString) {
  return z.preprocess((arg, ctx) => {
    if (typeof arg === "string" && arg.trim() === "") return undefined;
    return arg;
  }, string);
}

function EmptyStringOptionalNullable(string: ZodString) {
  return z.preprocess((arg, ctx) => {
    if (typeof arg === "string" && arg.trim() === "") return null;
    return arg;
  }, string.optional().nullable());
}

export const ClientDeleteParams = z.object({
  id: z.string().transform((arg, ctx) => {
    const n = parseInt(arg);
    if (isNaN(n) || n <= 0) {
      ctx.addIssue({
        code: "invalid_type",
        expected: "number",
        received: typeof arg,
        path: ["id"],
      });
      return z.NEVER;
    }
    return n;
  }),
});

export const ClientUpdateStateSchema = z.object({
  state: z.enum(ClientState),
});

export type ClientUpdateStateInput = z.infer<typeof ClientUpdateStateSchema>;

export const ClientUpdateTypeSchema = z.object({
  type: z.enum(ClientType).nullable(),
});
export type ClientUpdateTypeInput = z.infer<typeof ClientUpdateTypeSchema>;

export const ClientUpdateCodeSchema = z.object({
  code: z
    .string()
    .max(15, {
      message: "Codice non valido.",
    })
    .nullable(),
});
export type ClientUpdateCodeInput = z.infer<typeof ClientUpdateCodeSchema>;

export const ClientQuerySchema = z.object({
  id: OptionalNumber(undefined, 0),
  page: OptionalNumber(1),
  limit: OptionalNumber(15),
  state: OptionalArrayEnum(ClientState),
  type: OptionalArrayEnum(["Nessun tipo", ...ClientType]),
  sbusiness: sortableString(),
  sphone: sortableString(),
  semail: sortableString(),
  svat: sortableString(),
  sagency: sortableString(),
  sstate: sortableString(),
  stype: sortableString(),
  search: z
    .string()
    .optional()
    .nullable()
    .transform((arg) => (typeof arg === "string" ? arg : undefined)),
});
export type ClientQueryInput = z.infer<typeof ClientQuerySchema>;
function OptionalNumber(defaultValue?: number, min?: number) {
  return z.any().transform((arg) => {
    let n;
    let allowedMin = min || 1;
    if (typeof arg === "string" && arg.trim() !== "") {
      n = parseInt(arg);
      if (!isNaN(n) && n >= allowedMin) return n;
    }
    if (typeof arg === "number" && arg >= allowedMin && !isNaN(arg)) {
      if (Number.isInteger(arg)) return arg;
      return +arg.toFixed(0);
    }
    if (defaultValue) return defaultValue;
    return undefined;
  });
}
function OptionalArrayEnum<T extends string>(arr: [T, ...T[]]) {
  return z
    .enum(arr)
    .transform((arg) => {
      return [arg];
    })
    .or(
      z
        .array(z.enum(arr))
        .optional()
        .nullable()
        .transform((arg) => {
          if (!arg) return undefined;
          return arg;
        })
    );
}
function sortableString() {
  return z
    .enum(["asc", "desc"])
    .optional()
    .nullable()
    .transform((arg) => {
      if (!arg) return undefined;
      if (arg.toLowerCase() === "asc") return "asc";
      if (arg.toLowerCase() === "desc") return "desc";
      return undefined;
    });
}

function getDateFromStr(str: string) {
  if (str.includes("/")) {
    const parts = str.split("/");
    const date = new Date(`${parts[1]}-${parts[0]}-${parts[2]}`);
    return date;
  }
  return new Date(str);
}
