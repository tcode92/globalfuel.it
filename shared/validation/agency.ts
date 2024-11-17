import { z } from "zod";
import { zEmail } from "../../server/constants";

export const AgencyCreateSchema = z.object({
  name: z.string(),
  email: zEmail({
    invalid_error: "Email non valida.",
    required_error: "Email mancante.",
    invalid_type_error: "Email non valida.",
  }),
});
export type AgencyCreateInput = z.infer<typeof AgencyCreateSchema>;

export const AgencyUpdateSchema = z.object({
  name: z.string(),
  email: zEmail({
    invalid_error: "Email non valida.",
    required_error: "Email mancante.",
    invalid_type_error: "Email non valida.",
  }),
});

export type AgencyUpdateInput = z.infer<typeof AgencyUpdateSchema>;

export const AgencyGetQuerySchema = z.object({
  search: z.string().optional(),
  page: z.number({ coerce: true }).int().positive().optional().default(1),
  limit: z.number({ coerce: true }).int().positive().optional().default(15),
  not: z.number({ coerce: true }).min(1).max(1).optional(),
});
export type AgencyGetQueryInput = z.infer<typeof AgencyGetQuerySchema>;
