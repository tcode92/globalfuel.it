import { hashPassword } from "../lib/password";
import { dbConn } from "./connection";
import { db } from "./db";

async function main() {
  await db.auth.create({
    email: "tareq@codet.it",
    password: await hashPassword("Password123"),
    name: "Admin",
    role: "admin",
  });
  await dbConn.end();
}
main();
