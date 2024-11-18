import { CreateWorkWithUsInput } from "@validation/workWithUs";
import { dbConn, Sql } from "../connection";

const checkEmailExists = async (email: string) => {
  return await dbConn.transaction(async (tx) => {
    const wwu = await tx.query(
      "SELECT email FROM work_with_us WHERE email = $1;",
      [email]
    );
    if (wwu.rowCount && wwu.rowCount >= 1) return true;
    const auth = await tx.query(`SELECT email FROM "auth" WHERE email = $1;`, [
      email,
    ]);
    if (auth.rowCount && auth.rowCount >= 1) return true;
    return false;
  });
};

const create = async (data: CreateWorkWithUsInput) => {
  const stm = new Sql();
  stm.add`INSERT INTO work_with_us 
  (name, surname, business, vat, email, phone) 
  VALUES 
  (${data.name}, ${data.surname}, ${data.business}, ${data.vat}, ${data.email}, ${data.phone});`;
  const result = await stm.execute();
  return result.rowCount === 1;
};
export const wwu = { create, checkEmailExists };
