import { z } from "zod";
import { KnownError } from "./utils/error";
import { promisify } from "util";
export const sleep = promisify(setTimeout);
export const ERR_STR = {
  EMAIL_ERR: "Email non valida",
  EMAIL_REQ: "Email richiesta",
  VAT_ERR: "P.Iva non valida",
  VAT_REQ: "P.Iva richiesta",
} as const;
export const VAT_REGEX = /^\d{11}$/;
export const CF_REGEX = /^\w{6}\d{2}\w\d{2}\w\d{3}\w$/i;
export const PHONE_REGEX = /^(\+39)?\s?3\d{2} ?\d{6,7}$/;
export const PHONE2_REGEX = /^(\+39)?[\s+]?0[\d\s]{9,12}$/;
export const SDI_REGEX = /^[a-zA-Z0-9]{7}$/;
export const POSTALCODE_REGEX = /^\d{5}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[,;.:\-_!"'£$%&()=?^§\][><@°#])[A-Za-z\d,;.:\-_!"'£$%&()=?^§\][><@°#]{8,}$/;
export const zEmail = (data?: {
  required_error?: string;
  invalid_error?: string;
  invalid_type_error?: string;
}) =>
  z
    .string({
      required_error: data?.required_error,
      invalid_type_error: data?.invalid_type_error,
    })
    .trim()
    .toLowerCase()
    .email({
      message: data?.invalid_error,
    });
export function anyToIntOrThrow(param: any, err: string) {
  let n: number = parseInt(param);
  if (isNaN(n) || n < 1) {
    throw new KnownError(err, "error", 400);
  }
  return n;
}
