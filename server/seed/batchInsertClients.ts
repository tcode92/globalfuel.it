import { models } from "database/models/types";
import { dbConn } from "../database/connection";

export async function batchInsertClients(
  data: (models.client.ClientCreateInput & { authId: number })[],
  batchSize: number = 50
) {
  const batches = chunkArray(data, batchSize);
  let insertedIds: number[] = [];
  for (const chunk of batches) {
    let query = `INSERT INTO client 
    (business, email, vat, phone, pec, address, fg, state, type, business_start, cf, fax, auth_id)
    VALUES`;
    let paramCount = 0;
    let queryData = [];
    let queryValues: any[] = [];
    for (const client of chunk) {
      queryData.push(
        `($${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3}, $${
          paramCount + 4
        }, $${paramCount + 5}, $${paramCount + 6}, $${paramCount + 7}, $${
          paramCount + 8
        }, $${paramCount + 9}, $${paramCount + 10}, $${paramCount + 11}, $${
          paramCount + 12
        }, $${paramCount + 13})`
      );
      queryValues.push(
        client.business,
        client.email,
        client.vat,
        client.phone,
        client.pec,
        client.address,
        client.fg,
        client.state,
        client.type,
        client.business_start,
        client.cf,
        client.fax,
        client.authId
      );
      paramCount += 13;
    }
    query += ` ${queryData.join(", ")} RETURNING id;`;

    const { rows: batchIds } = await dbConn.query<{ id: number }>(
      query,
      queryValues
    );
    const ids = batchIds.map((item) => item.id);
    insertedIds.push(...ids);
  }
  return insertedIds;
}

function chunkArray<T>(array: T[], chunkSize: number) {
  const chunks = [];
  let index = 0;

  while (index < array.length) {
    chunks.push(array.slice(index, index + chunkSize));
    index += chunkSize;
  }

  return chunks;
}
