import { z } from "zod";
import { zEmail } from "./base";

export const CreateUpdateStaffSchema = z.object({
  name: z.string(),
  email: zEmail({
    invalid_error: "Email non valida.",
    invalid_type_error: "Email non valida.",
    required_error: "Email mancante.",
  }),
});
export type CreateUpdateStaffInput = z.infer<typeof CreateUpdateStaffSchema>;
