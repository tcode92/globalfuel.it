import { DatabaseError } from "pg";
import { KnownError } from "../../utils/error";
import { SQL, Sql, dbConn } from "../connection";
import { models } from "./types";

// Agency types

/**
 *
 * @param agency agency to create
 * @returns the agency created
 */
async function create(agency: models.agency.AgencyCreateInput) {
  try {
    const {
      rows: [newAgency],
    } = await dbConn.query<models.agency.Agency>(
      `INSERT INTO auth (name, email, role, password, actions) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, clients;`,
      [
        agency.name,
        agency.email,
        "agency",
        agency.password,
        { resetpassword: true },
      ]
    );
    return newAgency;
  } catch (e) {
    if (e instanceof DatabaseError) {
      if (e.code === "23505" && e.constraint === "auth_email_key") {
        throw new KnownError(
          [
            `L'indirizzo ${agency.email} esiste già.`,
            `Non è possibile creare un nuovo account.`,
          ],
          "error",
          409
        );
      }
    }
    throw e;
  }
}
/**
 *
 * @param search search query
 * @param page page number for pagination @default 1
 * @param limit limit result per page @default 15
 * @returns list of agencies and total pages available.
 */
async function get(
  search?: string,
  page: number = 1,
  limit: number = 15,
  not?: number
) {
  const offset = page === 1 ? 0 : limit * (page - 1);
  const values: any[] = [limit, offset];
  const searchString = search ? `%${search}%` : undefined;
  let paramsCount = 2;
  let query = `
  SELECT
      a.id,
      a.email,
      a.name,
      clients
  FROM
      auth a
  WHERE
    role IN ('agency', 'system')
  `;
  if (not) {
    query += ` AND a.id <> $${paramsCount + 1}`;
    values.push(not);
    ++paramsCount;
  }
  if (searchString) {
    const param = paramsCount + 1;
    query += `
    AND (LOWER(name) LIKE LOWER($${param}) OR LOWER(email) LIKE LOWER($${param}))
    `;
    values.push(searchString);
    ++paramsCount;
  }
  query += ` GROUP BY a.id `;
  // TODO: give ability to sort.
  if (true) {
    query += ` ORDER BY a.clients DESC, a.name ASC LIMIT $1 OFFSET $2 `;
  } else {
    query += ` LIMIT $1 OFFSET $2 `;
  }
  const { rows } = await dbConn.query<models.agency.Agency>(query, values);
  // count query
  let countQuery = `SELECT COUNT(*) as total FROM auth WHERE role IN ('agency', 'system')`;
  let countValues: any[] = [];
  let countParams = 0;
  if (not) {
    countQuery += ` AND id <> $${countParams + 1}`;
    countValues.push(not);
    ++countParams;
  }

  if (searchString) {
    countQuery += ` AND (LOWER(name) LIKE LOWER($${
      countParams + 1
    }) OR LOWER(email) LIKE LOWER($${countParams + 1}))`;
    countValues.push(searchString);
    ++countParams;
  }
  const {
    rows: [{ total }],
  } = await dbConn.query<{ total: string }>(countQuery, countValues);
  return { list: rows, total: Math.ceil(+total / limit) || 1 };
}
/**
 *
 * @param id auth id to delete
 * @param clients delete to delete clients or a number to assign client to another auth
 * @returns files to delete from disk if any.
 */
async function del(id: number, clients: "delete" | "system" | number) {
  return await dbConn.transaction(async (tx) => {
    let filesToDelete: string[] = [];
    let tokenV: string | null = null;
    if (clients === "delete") {
      // get files srcs to cleanup disk
      const { rows: clientFiles } = await tx.query<{
        files: string[] | null;
      }>(
        `
        SELECT
          ARRAY_AGG(f.src) AS files
        FROM
          client c
          JOIN file f ON f.client_id = c.id 
          WHERE c.auth_id = $1;`,
        [id]
      );
      // save files to delete after commit.
      if (clientFiles[0] !== undefined) {
        filesToDelete = clientFiles[0].files ?? [];
      }
      // delete clients
      await tx.query("DELETE FROM client c WHERE auth_id = $1", [id]);
    }
    if (clients === "system") {
      await tx.query(`UPDATE client SET auth_id = 1 WHERE auth_id = $1`, [id]);
    }
    if (typeof clients === "number") {
      await tx.query(`UPDATE client SET auth_id = $1 WHERE auth_id = $2`, [
        clients,
        id,
      ]);
    }
    // delete auth
    const auth = await tx.query<{ rv: string | null }>(
      `DELETE FROM auth WHERE id = $1 AND role = 'agency' RETURNING rv`,
      [id]
    );
    tokenV = auth.rows[0]?.rv || null;
    return { filesToDelete, tokenV };
  });
}
/**
 *
 * @param id agency id
 * @param agency partial agency props
 * @returns the updated agency new data
 */
async function update(id: number, agency: models.agency.AgencyUpdateInput) {
  const query = new Sql();
  query.add` UPDATE auth SET`;
  const updateQ: SQL[] = [];
  if (agency.email) {
    updateQ.push(Sql.sql` email = ${agency.email} `);
  }
  if (agency.name) {
    updateQ.push(Sql.sql` name = ${agency.name} `);
  }
  if (agency.password) {
    updateQ.push(Sql.sql` password = ${agency.password} `);
  }
  if (updateQ.length > 0) {
    query.add`${Sql.join(
      updateQ,
      Sql.COMMA
    )} WHERE id = ${id} RETURNING id, name, email, clients;`;
  }

  const {
    rows: [updated],
  } = await query.execute<models.agency.Agency>();
  return updated;
}
/**
 *
 * @param id agency id
 * @returns Agency
 */
async function getById(id: number): Promise<models.agency.Agency | null> {
  const {
    rows: [agency],
  } = await dbConn.query<models.agency.Agency>(
    "SELECT id, name, email, clients FROM auth WHERE role = 'agency' AND id = $1",
    [id]
  );
  return agency ?? null;
}

async function getOne(id: number): Promise<models.agency.AgencyDetails | null> {
  const data = await dbConn.query<models.agency.AgencyDetails>(
    `
  
  SELECT
    a.id,
    a.name,
    a.email,
    a.clients,
    (
        SELECT
        COALESCE(JSON_OBJECT_AGG(c_states.state, c_states.count), '[]'::json)
        FROM
            (
                SELECT
                    c_sub.state,
                    COUNT(c_sub.id) AS count
                FROM
                    client c_sub
                WHERE
                    c_sub.auth_id = a.id
                GROUP BY
                    c_sub.state
            ) c_states
    ) as states,
    (
        SELECT
        COALESCE(JSON_OBJECT_AGG(
          c_types.type,
          c_types.count
      ), '[]'::json)
        FROM
            (
                SELECT
                    CASE
                        WHEN c_sub.type IS NULL THEN 'Nessun tipo'
                        ELSE c_sub.type
                    END,
                    COUNT(c_sub.id) AS count
                FROM
                    client c_sub
                WHERE
                    c_sub.auth_id = a.id
                GROUP BY
                    c_sub.type
            ) c_types
    ) as "types"
FROM
    auth a
    LEFT JOIN client c ON c.auth_id = a.id
WHERE
    a.role IN ('agency', 'system')
    AND a.id = $1
GROUP BY
    a.id;
  
  `,
    [id]
  );
  const row = data.rows[0];
  if (!row) return null;
  return row;
}

export const agency = { create, get, del, update, getById, getOne };
