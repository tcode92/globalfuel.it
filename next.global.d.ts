import { Store } from "./server/lib/redis";
import { EnvSchema } from "./server/lib/validateEnv";
import { type Email } from "./server/emails/sendEmail";
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {}
  }
  var store: Store;
  var mailer: Email;
}
