import { z } from "zod";

export const messageQuerySchema = z.object({
  clientId: z.number({ coerce: true }).int().positive(),
  skip: z.number({ coerce: true }).int().optional().default(0),
});
export type MessageQueryInput = z.infer<typeof messageQuerySchema>;

export const messageCreateSchema = z.object({
  message: z.string(),
  clientId: z.number().int().positive(),
});
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;

export const messageAckSchema = z.object({
  id: z.number().int().positive(),
});
