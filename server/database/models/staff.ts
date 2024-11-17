import { logger } from "../../lib/log";
import { DatabaseError } from "pg";
import { KnownError } from "../../utils/error";
import { dbConn } from "../connection";
import { models } from "./types";

async function get() {
  const { rows: staff } = await dbConn.query<models.staff.Staff>(
    "SELECT id, name, email FROM auth WHERE role = 'admin' ORDER BY id ASC;"
  );
  return staff;
}
async function create(name: string, email: string, password: string) {
  try {
    const {
      rows: [staff],
    } = await dbConn.query<models.staff.Staff>(
      "INSERT INTO auth (name, email, password, actions, role) VALUES ($1, $2, $3, $4, 'admin') RETURNING name, email, id;",
      [name, email, password, { resetpassword: true }]
    );
    return staff;
  } catch (e) {
    if (e instanceof DatabaseError) {
      if (e.code === "23505" && e.constraint === "auth_email_key") {
        throw new KnownError(
          `Impossibile creare un nuovo utente con email ${email}`,
          "error",
          409
        );
      }
    }
    logger.error(e);
    throw e;
  }
}
async function update(id: number, name: string, email: string) {
  try {
    const {
      rows: [staff],
    } = await dbConn.query<models.staff.Staff>(
      `UPDATE auth 
      SET
      name = $2,
      email = $3
      WHERE id = $1 AND role = 'admin'
      RETURNING name, email, id;`,
      [id, name, email]
    );
    return staff;
  } catch (e) {
    if (e instanceof DatabaseError) {
      if (e.code === "23505" && e.constraint === "auth_email_key") {
        throw new KnownError(
          `Email già esistente, non è possibile completare la modifica.`,
          "error",
          409
        );
      }
    }
    throw e;
  }
}
async function del(id: number) {
  try {
    const result = await dbConn.query(
      "DELETE FROM auth WHERE id = $1 AND role = 'admin';",
      [id]
    );
    if (result.rowCount === 1) return true;
    return false;
  } catch (e) {
    logger.error(e);
    return false;
  }
}

export const staff = {
  create,
  update,
  del,
  get,
};
