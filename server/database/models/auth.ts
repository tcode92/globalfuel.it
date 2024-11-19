import { logger } from "../../lib/log";
import { dbConn } from "../connection";
import { models } from "./types";

async function create(data: models.auth.AuthCreateInput) {
  const result = await dbConn.query<{ id: number }>(
    `INSERT INTO auth (name, email, password, role, actions) VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
    [data.name, data.email, data.password, data.role, { rp: true }]
  );
  return result.rows[0];
}

async function getByEmail(email: string) {
  const { rows } = await dbConn.query<models.auth.Auth>(
    `
        SELECT id, email, password, role, name, actions, rv FROM auth WHERE email = $1;
    `,
    [email]
  );
  return rows[0] ? rows[0] : null;
}
async function getById(id: number) {
  const { rows } = await dbConn.query<models.auth.Auth>(
    `
        SELECT id, email, password, role, name, actions, rv FROM auth WHERE id = $1;
    `,
    [id]
  );
  return rows[0] ? rows[0] : null;
}
async function update(authId: number, data: Partial<models.auth.Auth>) {
  let query = `UPDATE auth SET `;
  let params: string[] = [];
  let values: any[] = [];
  if (data.role !== undefined) {
    values.push(data.role);
    params.push(` role = $${values.length} `);
  }
  if (data.email !== undefined) {
    values.push(data.email);
    params.push(` email = $${values.length} `);
  }
  if (data.email !== undefined) {
    values.push(data.email);
    params.push(` email = $${values.length} `);
  }
  if (data.actions !== undefined) {
    values.push(data.actions);
    params.push(` actions = $${values.length} `);
  }
  if (data.password !== undefined) {
    values.push(data.password);
    params.push(` password = $${values.length} `);
  }
  if (data.rv !== undefined) {
    values.push(data.rv);
    params.push(` rv = $${values.length} `);
  }
  if (params.length > 0) {
    values.push(authId);
    query += params.join(", ");
    query += ` WHERE id = $${values.length}`;
    await dbConn.query(query, values);
  }
  return authId;
}
async function createOrUpdateToken(id: number, token: string) {
  try {
    const query = `INSERT INTO auth_token (auth_id, token) VALUES ($1, $2) 
    ON CONFLICT (auth_id) DO
    UPDATE SET token = $2;`;
    const result = await dbConn.query(query, [id, token]);
    if (result.rowCount === 1) return true;
    return false;
  } catch (e) {
    logger.error(e);
    return false;
  }
}
async function getToken(token: string) {
  const result = await dbConn.query<{ id: number; token: string }>(
    `
  SELECT auth_id as id, token FROM auth_token WHERE token = $1;
  `,
    [token]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0];
}
async function deleteToken(tokenOrId: string | number) {
  let query;
  if (typeof tokenOrId === "string") {
    query = "DELETE FROM auth_token WHERE token = $1;";
  } else {
    query = "DELETE FROM auth_token WHERE auth_id = $1;";
  }
  const result = await dbConn.query(query, [tokenOrId]);
  if (result.rows.length === 1) return true;
  return false;
}
async function getStaffIds() {
  const query = await dbConn.query<{ id: number }>(
    "SELECT id FROM auth WHERE role = 'admin';"
  );
  return query.rows.map((r) => r.id);
}
async function getStaffContact() {
  const query = await dbConn.query<models.auth.StaffContact>(
    "SELECT id, name, email FROM auth WHERE role = 'admin';"
  );
  return query.rows;
}

export const auth = {
  create,
  getByEmail,
  getById,
  update,
  createOrUpdateToken,
  getToken,
  deleteToken,
  getStaffIds,
  getStaffContact,
};
