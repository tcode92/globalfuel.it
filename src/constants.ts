export const VAT_REGEX = /^\d{11}$/;
export const CF_REGEX = /^\w{6}\d{2}\w\d{2}\w\d{3}\w$/i;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^(\+39)?\s?3\d{2} ?\d{6,7}$/;
export const PHONE2_REGEX = /^(\+39)?[\s+]?0[\d\s]{9,12}$/;
export const SDI_REGEX = /^[a-zA-Z0-9]{7}$/;
export const POSTALCODE_REGEX = /^\d{5}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[,;.:\-_!"'£$%&()=?^§\][><@°#])[A-Za-z\d,;.:\-_!"'£$%&()=?^§\][><@°#]{10,}$/;
export function isValidDate(date?: string | null) {
  if (!date) return false;
  const parts = date.split("/");
  const d = new Date(`${parts[1]}-${parts[0]}-${parts[2]}`);
  if (d.toString() === "Invalid Date") return false;
  return true;
}
export function transformDate(date?: string | null) {
  if (!date) return undefined;
  const d = new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return d;
}
export function isEmpty(input: unknown) {
  if (input === undefined || input === null) return true;
  if (typeof input === "string" && input.trim() === "") return true;
  return false;
}
export function isValidPhone(input?: string) {
  const str = input?.trim().replaceAll(" ", "") || "";
  return PHONE_REGEX.test(str) || PHONE2_REGEX.test(str);
}
export function validatePassword(data: {
  password: string;
  passwordConfirm: string;
}) {
  if (isEmpty(data.password)) {
    return "Password mancante.";
  }
  if (!PASSWORD_REGEX.test(data.password)) {
    return "La password inserita non è valida.";
  }
  if (isEmpty(data.passwordConfirm)) {
    return "Conferma password mancante.";
  }
  if (data.password !== data.passwordConfirm) {
    return "La password e la conferma non coincidono.";
  }
}
/**
 *
 * @param date Date | datestring
 * @returns formatted date as DD/MM/YYYY, HH:mm:ss
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("it-IT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
