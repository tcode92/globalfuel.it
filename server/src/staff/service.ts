import { EmailSendData } from "emails/sendEmail";
import { db } from "../../database/db";
import { hashPassword } from "../../lib/password";
import { generateRandomString } from "../../lib/random";

export const staffCreateService = async (name: string, email: string) => {
  const pass = generateRandomString(10);
  const password = await hashPassword(pass);
  const user = await db.staff.create(name, email, password);

  mailer.send({
    template: "new-account",
    data: {
      name: name,
      password: pass,
      email: email,
    },
    to: email,
    from: "noreplay@globalfuel.it",
    subject: "Conferma registrazione",
  });
  return user;
};

export const staffDeleteService = async (id: number) => {
  return await db.staff.del(id);
};

export const staffGetService = async () => {
  return await db.staff.get();
};

export const staffUpdateService = async (
  id: number,
  name: string,
  email: string
) => {
  return await db.staff.update(id, name, email);
};
