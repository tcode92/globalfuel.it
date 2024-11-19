import { z } from "zod";

export const MailSearchSchema = z.object({
  page: z.number({ coerce: true }).positive().min(1).optional().default(1),
  limit: z.number({ coerce: true }).positive().min(15).optional().default(15),
  search: z.string().optional(),
});
export type MailSearchInput = z.infer<typeof MailSearchSchema>;
