import { z, ZodError } from "zod";

export type ZodErrorRecordString = Record<string, string | undefined>;
export type ZodErrorRecord = Record<string, string | ZodErrorRecordString>;
function getZodErrorFieldsFromZodError(e: ZodError) {
  let errorsObj: ZodErrorRecord = {};
  for (const issue of e.issues) {
    if (issue.path.length === 1) {
      errorsObj[issue.path[0]] = issue.message;
    } else {
      const mainKey = issue.path[0];
      let result: Record<string, any> = {};
      let curr = result;
      for (let i = 1; i < issue.path.length; i++) {
        const k = issue.path[i];
        if (i === issue.path.length - 1) {
          curr[k] = issue.message;
        } else {
          curr[k] = {};
          curr = curr[k];
        }
      }
      errorsObj[mainKey] = errorsObj[mainKey]
        ? Object.assign(errorsObj[mainKey], result)
        : result;
    }
  }
  return errorsObj;
}
export function prettyError(e: ZodError) {
  const err = e.flatten().fieldErrors;
  const fieldsError = getZodErrorFieldsFromZodError(e);
  return {
    errors: Object.values(err).flat(),
    fields: fieldsError,
  };
}
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
