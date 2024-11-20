import { DatabaseError } from "pg";
import { SQL, Sql, dbConn } from "../connection";
import { models } from "./types";
import { KnownError } from "../../utils/error";

import { ClientState, ClientType, FILETYPE } from "@constants";
import { ClientCreateUpdateInput } from "@validation/client";

async function create(authId: number, client: ClientCreateUpdateInput) {
  const data = Object.assign<
    Partial<models.client.ClientCreateInput>,
    ClientCreateUpdateInput
  >(
    {
      state: "In Lavorazione",
    },
    client
  );
  try {
    const {
      rows: [newClient],
    } = await dbConn.query<{ id: number }>(
      `INSERT INTO client
      (business, email, vat, phone, pec, address, fg, state, type, business_start, cf, fax, liters, euro, auth_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id;`,
      [
        data.business,
        data.email,
        data.vat,
        data.phone,
        data.pec,
        data.address,
        data.fg,
        data.state,
        data.type,
        data.business_start,
        data.cf,
        data.fax,
        data.liters,
        data.amount,
        authId,
      ]
    );
    return newClient.id;
  } catch (e) {
    if (e instanceof DatabaseError) {
      if (e.code === "23505" && e.constraint === "client_vat_key") {
        throw new KnownError(
          [
            `Il cliente con p.iva ${client.vat} esiste già.`,
            `Non è possibile creare un nuovo cliente.`,
          ],
          "error",
          409
        );
      }
    }
    throw e;
  }
}
export type ClientSortOptions = {
  [key in
    | "business"
    | "email"
    | "phone"
    | "state"
    | "vat"
    | "agency"
    | "type"]: "asc" | "desc" | undefined;
};
/**
 *
 * @param page number
 * @param limit number
 * @param search client business or email
 * @param state client state filter
 * @param type client type filter
 * @param typeNull include null type
 * @param authId if admin authId should be undefined
 * @param agencyId shows only the agency clients
 * @param sortBy sort order
 * @returns clients list paginated
 */
async function getClientsTable(
  page: number = 1,
  limit: number = 15,
  search?: string,
  state?: ClientState[],
  type?: ClientType[],
  typeNull?: boolean,
  authId?: number,
  agencyId?: number,
  sortBy?: ClientSortOptions
) {
  const offset = page === 1 ? 0 : limit * (page - 1);
  const searchString = search ? `%${search}%` : undefined;
  const where: SQL[] = [];
  if (authId || agencyId) {
    where.push(Sql.sql` c.auth_id = ${authId || agencyId} `);
  }
  if (searchString) {
    where.push(
      Sql.sql` (LOWER(c.business) LIKE LOWER(${searchString}) OR c.email LIKE LOWER(${searchString}) OR c.vat LIKE ${searchString}) `
    );
  }
  if (state && state.length > 0) {
    where.push(Sql.sql` (c.state IN (${state})) `);
  }
  if (type && type.length > 0) {
    where.push(
      Sql.sql` (c.type IN (${type}) ${
        typeNull ? Sql.sql` OR c.type IS NULL` : Sql.EMPTY
      }) `
    );
  }
  if (typeNull && (!type || type.length === 0)) {
    where.push(Sql.sql` c.type IS NULL `);
  }
  const whereClause = Sql.join(where);
  const mainQuery = new Sql();
  mainQuery.add`
  SELECT
    c.id,
    c.code,
    c.business,
    c.phone,
    c.email,
    a.name as agency_name,
    a.id as auth_id,
    c.state,
    c.type,
    c.vat
  FROM
    client c
  JOIN auth a ON c.auth_id = a.id
  ${where.length > 0 ? Sql.sql`WHERE ${whereClause}` : Sql.EMPTY} `;
  mainQuery.add` GROUP BY c.id, a.name, a.id `;
  if (sortBy) {
    const sortArr = [];
    if (sortBy.business) {
      sortArr.push(
        Sql.sql` c.business ${sortBy.business === "asc" ? Sql.ASC : Sql.DESC} `
      );
    }
    if (sortBy.vat) {
      sortArr.push(
        Sql.sql` c.vat ${sortBy.vat === "asc" ? Sql.ASC : Sql.DESC} `
      );
    }
    if (sortBy.phone) {
      sortArr.push(
        Sql.sql` c.phone ${sortBy.phone === "asc" ? Sql.ASC : Sql.DESC} `
      );
    }
    if (sortBy.agency) {
      sortArr.push(
        Sql.sql` a.name ${sortBy.agency === "asc" ? Sql.ASC : Sql.DESC} `
      );
    }
    if (sortBy.state) {
      sortArr.push(
        Sql.sql` c.state ${sortBy.state === "asc" ? Sql.ASC : Sql.DESC} `
      );
    }
    if (sortBy.email) {
      sortArr.push(
        Sql.sql` c.email ${sortBy.email === "asc" ? Sql.ASC : Sql.DESC} `
      );
    }
    if (sortBy.type) {
      sortArr.push(
        Sql.sql` c.type ${sortBy.type === "asc" ? Sql.ASC : Sql.DESC} `
      );
    }
    if (sortArr.length > 0) {
      mainQuery.add` ORDER BY ${Sql.join(sortArr, Sql.COMMA)} `;
    } else {
      mainQuery.add` ORDER BY c.id DESC `;
    }
  } else {
    mainQuery.add` ORDER BY c.id DESC `;
  }
  mainQuery.add` LIMIT ${limit} OFFSET ${offset}`;

  const countQuery = new Sql();
  countQuery.add`SELECT COUNT(*) as total FROM client c JOIN auth a ON c.auth_id = a.id ${
    where.length > 0 ? Sql.sql`WHERE ${whereClause}` : Sql.EMPTY
  }`;
  const { rows } = await mainQuery.execute<models.client.ClientTable>();
  const {
    rows: [{ total }],
  } = await countQuery.execute<{ total: string }>();
  return { list: rows, total: Math.ceil(+total / limit) || 1 };
}

async function getOne(
  id: number,
  includeAgency: boolean = false,
  authId?: number
) {
  const query = new Sql();
  query.add`
  SELECT
    c.address,
    c.auth_id,
    c.business,
    c.business_start,
    c.cf,
    c.code,
    c.created_at,
    c.email,
    c.fax,
    c.fg,
    c.id,
    c.pec,
    c.phone,
    c.sdi,
    c."state",
    c."type",
    c.updated_at,
    c.vat,
    ${includeAgency ? Sql.sql`a."name" as agency_name,` : Sql.EMPTY}
    (
      SELECT
          jsonb_object_agg(sub.type, sub.data)
      FROM
          (
              SELECT
                  f.type,
                  jsonb_agg(
                      jsonb_build_object(
                          'id',
                          f.id,
                          'name',
                          f.name,
                          'ext',
                          f.ext,
                          'src',
                          f.src
                      )
                  ) AS data
              FROM
                  file f
              WHERE
                  f.client_id = c.id
              GROUP BY
                  f.type
          ) sub
    ) AS docs,
    COALESCE(
      (SELECT
          ARRAY_AGG(
              json_build_object(
                  'id',
                  n.id,
                  'text',
                  n.text,
                  'created_at',
                  n.created_at
              ) ORDER BY n.id DESC
          )
      FROM
          note n
      WHERE
          n.client_id = c.id ), ARRAY[]::json[]) as note
  FROM
    client c
  JOIN auth a ON c.auth_id = a.id 
  WHERE c.id = ${id}
  ${authId ? Sql.sql`AND c.auth_id = ${authId}` : Sql.EMPTY}
  ;
  
  `;
  const data = await query.execute<models.client.FullClient>();
  const client = data.rows[0] !== undefined ? data.rows[0] : null;
  if (client === null) return null;
  // add client missing docs type so object match typescript type
  // docs row can return null if there are no docs uploaded for the client.
  // also the doctype can be missing so we ensure that all expected docs are present and having the expected types.
  if (client.docs === null) {
    client.docs = {
      "Documento di identità": [],
      "Lettera di manleva per Carte Jolly": [],
      "Moduli vari": [],
      "Verifica cerved": [],
      "Visura camerale": [],
      Libretto: [],
    };
  } else {
    for (const docType of FILETYPE) {
      if (!client.docs[docType]) {
        client.docs[docType] = [];
      }
    }
  }
  return client;
}

type ClientUpdateInput = Partial<
  Omit<models.client.ClientDB, "id" | "created_at">
>;
/**
 *
 * @param id client id
 * @param client client update props
 * @returns updated client
 */
async function update(id: number, client: ClientUpdateInput) {
  let query = "UPDATE client SET ";
  let args = [];
  let values: any[] = [];
  let placeholders = 0;
  const keys: (keyof ClientUpdateInput)[] = Object.keys(
    client
  ) as (keyof ClientUpdateInput)[];
  for (const key of keys) {
    if (client[key] !== undefined) {
      args.push(key);
      values.push(client[key]);
      ++placeholders;
    }
  }

  if (args.length === values.length && args.length > 0) {
    let qs = [];
    for (let i = 0; i < args.length; i++) {
      qs.push(`${args[i]} = $${i + 1}`);
    }
    query += qs.join(", ");
    query += " ";
  }
  query += `WHERE id = $${placeholders + 1};`;
  values.push(id);
  return await dbConn.query(query, values);
}
/**
 *
 * @param id client id
 *
 * Deletes the client with given id from the database
 * Deletes the files for the given client
 *
 * @return the files deleted upon success
 * @trows error if any
 */
async function del(id: number) {
  return await dbConn.transaction(async (tx) => {
    const delClient = `DELETE FROM Client WHERE id = $1;`;
    const filesQuery = `SELECT src FROM file WHERE client_id = $1;`;
    const { rows } = await tx.query<{ src: string }>(filesQuery, [id]);
    await tx.query(delClient, [id]);
    return rows;
  });
}
async function getCode(clientId: number) {
  const { rows } = await dbConn.query<{ code: string | null }>(
    `SELECT code FROM client WHERE id = $1;`,
    [clientId]
  );
  if (!rows[0]) return null;
  return rows[0].code;
}
async function getCurrentState(id: number) {
  const {
    rows: [client],
  } = await dbConn.query<{ state: ClientState }>(
    "SELECT state FROM client WHERE id = $1;",
    [id]
  );
  if (!client || !client.state)
    throw new KnownError("Cliente non trovato.", "error");
  return client.state;
}
async function getCurrentType(id: number) {
  const {
    rows: [client],
  } = await dbConn.query<{ type: ClientType }>(
    "SELECT type FROM client WHERE id = $1;",
    [id]
  );
  if (!client) throw new KnownError("Cliente non trovato.", "error");
  return client.type;
}

async function getClientAgencyInfo(clientId: number) {
  const stm = new Sql();
  stm.add`SELECT client.id, 
client.business as name, 
auth.name as agency,
auth.id as agency_id 
FROM client
JOIN auth ON auth.id = client.auth_id
WHERE client.id = ${clientId}`;

  const { rows } = await stm.execute<{
    id: number;
    name: string;
    agency: string;
    agency_id: number;
  }>();

  if (rows[0]) return rows[0];
  return null;
}

async function getAgency<K extends (keyof models.agency.Agency)[]>(
  clientId: number,
  select: K
) {
  if (select.length === 0) {
    throw new Error("At least one property must be selected.");
  }
  let query = "SELECT ";
  const s: string[] = [];
  for (const key of select) {
    s.push(`a.${key}`);
  }
  query += s.join(", ");
  query +=
    " FROM auth a JOIN client c ON a.id = c.auth_id WHERE a.role = 'agency' AND c.id = $1;";
  const {
    rows: [agency],
  } = await dbConn.query<Pick<models.agency.Agency, K[number]>>(query, [
    clientId,
  ]);
  return agency ?? null;
}

export const client = {
  create,
  getClientsTable,
  getOne,
  update,
  del,
  getCode,
  getCurrentState,
  getCurrentType,
  getAgency,
  getClientAgencyInfo,
};
