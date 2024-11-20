import assert from "node:assert";
import { db } from "../../database/db";

import { after, before, describe, it } from "node:test";
import { dbConn } from "../../database/connection";
import { models } from "database/models/types";
import { ClientCreateUpdateInput } from "@validation/client";
describe("Client Database Functions", () => {
  const clientData: ClientCreateUpdateInput = {
    address: "",
    business: "test business",
    email: "testemail@gmail.com",
    fg: "assoc.",
    pec: "test@pec.it",
    phone: "3925265022",
    vat: "11111111111",
  };
  const auth: models.auth.AuthCreateInput = {
    email: "authtestclient@email.com",
    name: "test auth",
    password: "test-password",
    role: "admin",
  };
  let authId: number;
  let createdClientId: number;
  before(async () => {
    const newAuth = await db.auth.create(auth);
    authId = newAuth.id;
  });
  it("Should create a new client", async () => {
    const id = await db.client.create(authId, clientData);
    assert.ok(id);
    createdClientId = id;
  });
  it("Should fetch client data", async () => {
    const client = await db.client.getOne(createdClientId);
    assert.ok(client);
    assert.deepStrictEqual(client?.id, createdClientId);
    assert.ok(client?.address);
    assert.deepStrictEqual(client?.business, clientData.business);
  });
  it("Should throw an error on duplicate VAT", async () => {
    await assert.rejects(async () => {
      await db.client.create(authId, clientData);
    });
  });

  it("Should throw an error on invalid VAT length", async () => {
    clientData.vat = "222222222222";
    await assert.rejects(async () => {
      await db.client.create(authId, clientData);
    });
  });

  it("Should update client information in the database", async () => {
    const clientUpdateInput = {
      email: "updated@example.com",
      business: "test business update",
    };
    await db.client.update(createdClientId, clientUpdateInput);
    const updatedClient = await db.client.getOne(createdClientId);
    assert.ok(updatedClient);
    assert.deepStrictEqual(updatedClient?.email, clientUpdateInput.email);
    assert.deepStrictEqual(updatedClient?.business, clientUpdateInput.business);
  });
  it("Should delete a client from the database", async () => {
    await db.client.del(createdClientId);
    const deletedClient = await db.client.getOne(createdClientId);
    assert.deepStrictEqual(deletedClient, null); // Client should no longer exist in the database
  });
  after(async () => {
    await dbConn.end();
  });
});
