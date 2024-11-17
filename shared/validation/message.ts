import { z } from "zod";

export const messageFileterSchema = z.object({
  client: z.string().optional(),
  agency: z.string().optional(),
  limit: z.number({ coerce: true }).int().optional().default(15),
  page: z.number({coerce: true}).int().min(1).optional().default(1),
  toAck: z
    .string()
    .optional()
    .transform((arg) => {
      if (arg === "yes") return true;
      return undefined;
    }),
});
export type MessageSearchFilters = z.infer<typeof messageFileterSchema>;

export const messageCreateSchema = z.object({
  message: z.string(),
  clientId: z.number().int().positive(),
});
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;

export const messageAckSchema = z.object({
  id: z.number().int().positive(),
});
