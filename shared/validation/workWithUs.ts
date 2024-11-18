import { PHONE2_REGEX, PHONE_REGEX, VAT_REGEX } from "@constants";
import { z } from "zod";

export const CreateWorkWithUsSchema = z.object({
  name: z.string().trim().min(1, "Nome non valido"),
  surname: z.string().trim().min(1, "Cognome non valido"),
  business: z.string().trim().min(1, "Ragione sociale non valida"),
  vat: z.string().trim().regex(VAT_REGEX, "P. Iva non valida"),
  email: z.string().trim().email({ message: "Email non valida" }),
  phone: z
    .string({ message: "Telefono richiesto" })
    .trim()
    .superRefine((arg, ctx) => {
      const valid = PHONE_REGEX.test(arg) || PHONE2_REGEX.test(arg);
      if (!valid) {
        ctx.addIssue({
          code: "invalid_string",
          validation: "regex",
          message: "Telefono non valido",
          path: ["phone"],
        });
        return z.NEVER;
      }
      return arg;
    }),
  consent: z.boolean(),
});
export type CreateWorkWithUsInput = z.infer<typeof CreateWorkWithUsSchema>;
