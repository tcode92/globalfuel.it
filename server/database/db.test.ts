import { after, beforeEach, describe, test } from "node:test";
import { Sql, dbConn } from "./connection"; // Assuming Sql class is exported from a file named 'Sql.ts'
import assert = require("node:assert");
describe("Sql class", () => {
  let sql: Sql;

  beforeEach(() => {
    sql = new Sql();
  });

  test("should correctly add template strings and values", () => {
    sql.add`SELECT * FROM users WHERE username = ${"admin"}`;
    assert.strictEqual(sql.query, "SELECT * FROM users WHERE username = $1");
    assert.deepStrictEqual(sql.values, ["admin"]);

    sql.add` AND password = ${"password123"}`;
    assert.strictEqual(
      sql.query,
      "SELECT * FROM users WHERE username = $1 AND password = $2"
    );
    assert.deepStrictEqual(sql.values, ["admin", "password123"]);
  });

  test("should handle arrays correctly", () => {
    const sql = new Sql();
    const arrayValues = ["value1", "value2", "value3"];
    sql.add`SELECT * FROM table WHERE column IN (${arrayValues})`;

    assert.strictEqual(
      sql.query,
      "SELECT * FROM table WHERE column IN ($1, $2, $3)"
    );
    assert.deepStrictEqual(sql.values, arrayValues);
  });

  test("should handle nested arrays correctly", () => {
    const sql = new Sql();
    const nestedArrayValues = [["value1", "value2", "value3"]];
    sql.add`SELECT * FROM table WHERE column IN (${nestedArrayValues})`;

    assert.strictEqual(
      sql.query,
      "SELECT * FROM table WHERE column IN ($1, $2, $3)"
    );
    assert.deepStrictEqual(sql.values, ["value1", "value2", "value3"]);
  });

  test("should execute the query with correct values", async () => {
    const dbMock = {
      query: async (query: string, values: any[]) => {
        assert.strictEqual(
          query,
          "SELECT * FROM auth WHERE role = $1 AND password = $2"
        );
        assert.deepStrictEqual(values, ["admin", "password123"]);
        return []; // Simulating an empty resolved value
      },
    };

    const sql = new Sql();
    sql.add`SELECT * FROM auth WHERE role = ${"admin"}`;
    sql.add` AND password = ${"password123"}`;
    await dbMock.query(sql.query, sql.values);
  });
  test("should execute the query with correct values even if values are SQL-valid syntax", async () => {
    const dbMock = {
      query: async (query: string, values: any[]) => {
        assert.strictEqual(query, "SELECT $1");
        assert.deepStrictEqual(values, [`1 + 1\n; DROP TABLE auth;`]);
        return []; // Simulating an empty resolved value
      },
    };

    const sql = new Sql();
    sql.add`SELECT ${"1 + 1\n; DROP TABLE auth;"}`;
    await dbMock.query(sql.query, sql.values);
  });
  after(async () => {
    dbConn.end();
  });
});
