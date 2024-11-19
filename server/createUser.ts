import { z } from "zod";
import { hashPassword } from "./lib/password";
import { generateRandomString } from "./lib/random";
import { Email } from "./emails/sendEmail";
import { db } from "./database/db";
import { dbConn } from "./database/connection";

interface AuthArgs {
  email: string;
  name: string;
}

function printHelp(): void {
  console.log(`
Usage: ts-node script.ts --email <email> --name <name>

Arguments:
  --email       The email address of the user (required)
  --name        The name of the user (required)
  
Example:
  ts-node script.ts --email test@example.com --name JohnDoe
`);
}

function getArguments(): AuthArgs {
  const args = process.argv.slice(2);
  const argObject: Partial<AuthArgs> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("--", "") as keyof AuthArgs;
    const value = args[i + 1];
    argObject[key] = value;
  }

  const requiredArgs: Array<keyof AuthArgs> = ["email", "name"];
  for (const arg of requiredArgs) {
    if (!argObject[arg]) {
      printHelp();
      throw new Error(`Missing required argument: ${arg}`);
    }
  }

  return argObject as AuthArgs;
}

async function main(): Promise<void> {
  try {
    const { email, name } = z
      .object({
        name: z.string(),
        email: z.string().email(),
      })
      .parse(getArguments());
    const pass = generateRandomString(10);
    const password = await hashPassword(pass);
    const result = await db.auth.create({
      email,
      name,
      password: password,
      role: "admin",
    });
    console.log("User created:", result);
    const mailer = new Email({
      host: process.env.MAIL_HOST,
      password: process.env.MAIL_PASS,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER,
      from: "noreplay@globalfuel.it",
    });
    await mailer.sendSync({
      template: "new-account",
      from: "noreplay@globalfuel.it",
      data: {
        name: name,
        email,
        password: pass,
      },
      to: email,
      subject: "Conferma registrazione",
    });
    await mailer.shutdown();
  } catch (error) {
    console.error("Error:", (error as Error).message);
  } finally {
    await dbConn.end();
    process.exit(0);
  }
}

main();
