import { dbConn } from "../connection";
import { models } from "./types";

async function getClientsState(authId?: number) {
  let values: number[] = [];
  let query = `SELECT state, COUNT(*) FROM client `;
  if (authId) {
    query += `WHERE auth_id = $1 `;
    values.push(authId);
  }
  query += `GROUP BY state;`;
  const { rows } = await dbConn.query<models.dashboard.ClientStats>(
    query,
    values
  );
  return rows;
}
async function getClientsType(authId?: number) {
  let values: number[] = [];
  let query = `
    SELECT
        CASE
            WHEN type IS NULL then 'Nessun tipo'
            ELSE type
        END type,
        COUNT(*) 
    FROM client `;
  if (authId) {
    query += `WHERE auth_id = $1 `;
    values.push(authId);
  }
  query += `GROUP BY type;`;
  const { rows } = await dbConn.query<models.dashboard.ClientTypes>(
    query,
    values
  );
  return rows;
}

export const dashboard = { getClientsState, getClientsType };
