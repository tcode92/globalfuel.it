import { dbConn, Sql } from "../connection";
import { models } from "./types";

export async function create(file: models.file.CreateFileInput) {
  const {
    rows: [result],
  } = await dbConn.query<{ id: number }>(
    `INSERT INTO file (name, src, ext, mime, type, client_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
    [file.name, file.src, file.ext, file.mime, file.type, file.clientId]
  );
  return result.id;
}
export async function createMany(files: models.file.CreateFileInput[]) {
  let paramsCount = 0;
  let insertQuery: string[] = [];
  let values: any[] = [];
  for (const file of files) {
    insertQuery.push(
      `($${paramsCount + 1}, $${paramsCount + 2}, $${paramsCount + 3}, $${
        paramsCount + 4
      }, $${paramsCount + 5}, $${paramsCount + 6})`
    );
    values.push(
      file.name,
      file.src,
      file.ext,
      file.mime,
      file.type,
      file.clientId
    );
    paramsCount += 6;
  }
  let query = `INSERT INTO file (name, src, ext, mime, type, client_id) VALUES ${insertQuery.join(
    ", "
  )} RETURNING id, name, ext, type, src;`;
  const result = await dbConn.query<models.file.Doc>(query, values);
  return result.rows;
}
export async function rename(id: number, name: string) {
  const {
    rows: [file],
  } = await dbConn.query<models.file.Doc>(
    `UPDATE file SET name = $1 WHERE id = $2 RETURNING id, name, src, ext, type`,
    [name, id]
  );
  return file;
}
export async function getSrcMimeType(src: string) {
  const {
    rows: [{ mime }],
  } = await dbConn.query<{ mime: string }>(
    `SELECT mime FROM file WHERE src = $1`,
    [src]
  );
  return mime;
}
export async function getIdMimeType(id: number) {
  const {
    rows: [{ mime }],
  } = await dbConn.query<{ mime: string }>(
    `SELECT mime FROM file WHERE id = $1`,
    [id]
  );
  return mime;
}
/**
 *
 * @param idOrSrc file id or file src
 * @returns the src of the deleted file or null if not found
 */
export async function del(idOrSrc: string | number) {
  const argType = typeof idOrSrc === "string" ? "src" : "id";
  const { rows } = await dbConn.query<{ src: string | undefined }>(
    `DELETE FROM file WHERE ${argType} = $1 RETURNING src`,
    [idOrSrc]
  );
  return rows[0]?.src ?? null;
}

export async function get(ids?: number[], srcs?: string[], authId?: number) {
  if (!ids && !srcs) return [];
  const query = new Sql();
  query.add`
  SELECT f.name, f.ext, f.src, f.mime FROM file f ${
    authId ? Sql.sql`JOIN client c ON f.client_id = c.id` : Sql.EMPTY
  } WHERE
  `;

  const whereClause = [];
  if (ids && ids.length > 0) {
    whereClause.push(Sql.sql` f.id IN (${ids}) `);
  }
  if (srcs && srcs.length > 0) {
    whereClause.push(Sql.sql` f.src IN (${srcs}) `);
  }
  if (whereClause.length > 0) {
    query.add`(${Sql.join(whereClause, Sql.OR)})`;
  }
  if (authId) {
    query.add` AND c.auth_id = ${authId}`;
  }
  const result = await query.execute<{
    name: string;
    ext: string;
    src: string;
    mime: string;
  }>();
  return result.rows;
}

export const file = {
  create,
  createMany,
  rename,
  getSrcMimeType,
  getIdMimeType,
  del,
  get,
};
