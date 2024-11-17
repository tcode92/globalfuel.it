import { db } from "../../database/db";
import { after, describe, it } from "node:test";
import assert = require("node:assert");
import { dbConn } from "../../database/connection";
import { models } from "database/models/types";
describe("Client Database Functions", () => {
  const authData: models.auth.AuthCreateInput = {
    email: "authtest@email.com",
    name: "test auth",
    password: "test-password",
    role: "admin",
  };
  const validateDatatypes = (obj: any, types: Record<string, any>) => {
    assert.deepStrictEqual(obj, types);
  };
  let createdAuthId: number;
  it("Should create a new auth", async () => {
    const newAuth = await db.auth.create(authData);
    assert.ok(newAuth.id);
    assert.deepStrictEqual(typeof newAuth.id, "number");
    createdAuthId = newAuth.id;
  });
  it("Should get auth by id", async () => {
    const auth = await db.auth.getById(createdAuthId);
    assert.ok(auth);
    /* validateDatatypes(auth, {
      id: expect.any(Number),
      email: expect.any(String),
      password: expect.any(String),
      role: expect.any(String),
      name: expect.any(String),
      actions: expect.any(Object),
    }); */
  });
  it("Should get auth by email", async () => {
    const auth = await db.auth.getByEmail(authData.email);
    assert.ok(auth);
    /* validateDatatypes(auth, {
      id: expect.any(Number),
      email: expect.any(String),
      password: expect.any(String),
      role: expect.any(String),
      name: expect.any(String),
      actions: expect.any(Object),
    }); */
  });

  after(async () => {
    await dbConn.end();
  });
});
