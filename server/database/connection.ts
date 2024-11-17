import { QueryResultRow, native, Client } from "pg";

import Pool from "pg-pool";
class DB extends Pool<Client> {
  async transaction<T>(callback: (tx: Client) => Promise<T>) {
    const c = await this.connect();
    try {
      c.query("BEGIN;");
      const result = await callback(c);
      c.query("COMMIT;");
      return result;
    } catch (e) {
      c.query("ROLLBACK;");
      throw e;
    } finally {
      c.release();
    }
  }
}
function newDb() {
  console.count("DATABASE CONNECTION COUNT");
  return new DB({
    Client: native?.Client,
  });
}
global._db = global._db || newDb();
export const dbConn = global._db;

declare global {
  var _db: DB;
}
export class Sql {
  private _query: string;
  private _values: any[];
  constructor() {
    this._query = "";
    this._values = [];
  }
  static get NULL() {
    return new SQLKEYWORD("NULL");
  }
  static get EMPTY() {
    return new SQLKEYWORD("EMPTY");
  }
  static get AND() {
    return new SQLKEYWORD("AND");
  }
  static get OR() {
    return new SQLKEYWORD("OR");
  }
  static get ASC() {
    return new SQLKEYWORD("ASC");
  }
  static get DESC() {
    return new SQLKEYWORD("DESC");
  }
  static get COMMA() {
    return new SQLKEYWORD(", ");
  }
  static sql(strings: TemplateStringsArray, ...args: any[]) {
    return new SQL(strings, ...args);
  }
  get query() {
    return this._query;
  }
  get values() {
    return this._values;
  }
  add(strings: TemplateStringsArray, ...args: any[]) {
    for (let i = 0; i < strings.length; i++) {
      this._query += strings[i];
      if (args[i] !== undefined) {
        const value = args[i];
        if (value instanceof SQLKEYWORD) {
          if (value.value === "EMPTY") {
            continue;
          }
          this._query += value.value;
          continue;
        }
        if (value instanceof SQL) {
          this.add(value.strings, ...value.args);
          continue;
        }
        const isArray = Array.isArray(value);
        if (isArray) {
          this.joinArray(value);
        } else {
          const valIndex = this._values.indexOf(value);
          if (valIndex > -1) {
            this._query += `$${valIndex + 1}`;
          } else {
            this._query += `$${this._values.length + 1}`;
            this._values.push(value);
          }
        }
      }
    }
  }
  addSql(sql: SQL) {
    const data = sql;
    this.add(data.strings, ...data.args);
  }
  private joinArray(arr: any[]) {
    let params = [];
    let initialParamsLen = this._values.length;
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      if (value instanceof SQL) {
        this.add(value.strings, ...value.args);
        continue;
      }
      if (value instanceof SQLKEYWORD) {
        if (value.value === "EMPTY") {
          continue;
        }
        this._query += value.value;
        continue;
      }
      if (Array.isArray(value)) {
        this.joinArray(value);
      } else {
        const valIndex = this._values.indexOf(value);
        if (valIndex > -1) {
          params.push(`$${valIndex + 1}`);
          ++initialParamsLen;
        } else {
          this._values.push(value);
          params.push(`$${initialParamsLen + 1}`);
          ++initialParamsLen;
        }
      }
    }
    this._query += params.join(", ");
  }
  static join(arr: SQL[], joinWith: SQLKEYWORD = new SQLKEYWORD("AND")) {
    let final: (SQL | SQLKEYWORD)[] = [];
    for (let i = 0; i < arr.length; i++) {
      final.push(arr[i]);
      if (arr[i + 1] !== undefined) {
        final.push(joinWith);
      }
    }
    return final;
  }
  execute<T extends QueryResultRow>() {
    return dbConn.query<T, T[]>(this._query, this._values);
  }
}
export class SQLKEYWORD {
  private key: "AND" | "OR" | "EMPTY" | "NULL" | "DESC" | "ASC" | ", ";
  constructor(key: SQLKEYWORD["key"]) {
    this.key = key;
  }
  get value() {
    return this.key;
  }
}
export class SQL {
  strings: TemplateStringsArray;
  args: any[];
  constructor(strings: TemplateStringsArray, ...args: any[]) {
    this.strings = strings;
    this.args = args;
  }
}
