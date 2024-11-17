import { TypeOf, ZodError, z } from "zod";
import { prettyError } from "../utils/error";

export async function validateEnv() {
  try {
    await EnvSchma.parseAsync(process.env);
  } catch (e) {
    console.error("INVALID ENV.");
    console.error(prettyError(e as ZodError));
    process.exit(1);
  }
}

const EnvSchma = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  WEBSITE: z.string(),
  ACCESS_KEY: z.string(),
  REFRESH_KEY: z.string(),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.string().regex(/^\d+$/),
  MAIL_KEY: z.string(),
  REDIS_URL: z.string(),
});
export type EnvSchema = TypeOf<typeof EnvSchma>;
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {}
  }
}
