import { after, before, describe, it } from "node:test";
import { db } from "../../database/db";

import assert = require("node:assert");
import { dbConn } from "../../database/connection";
import { models } from "database/models/types";
import { MessageCreateInput } from "@validation/message";
import { ClientCreateUpdateInput } from "@validation/client";

describe("Message Database Functions", async () => {
  const message: MessageCreateInput = {
    clientId: 0,
    message: "HELLO FROM THE OTHER SIDE",
  };
  const clientData: ClientCreateUpdateInput = {
    address: "",
    business: "test business",
    email: "testemail123@gmail.com",
    fg: "assoc.",
    pec: "test@pec.it",
    phone: "3925265023",
    vat: "11111111112",
  };
  const auth: models.auth.AuthCreateInput = {
    email: "authtestclient123@email.com",
    name: "test auth",
    password: "test-password",
    role: "admin",
  };
  let authId: number;
  before(async () => {
    const newAuth = await db.auth.create(auth);
    authId = newAuth.id;
    const id = await db.client.create(authId, clientData);
    assert.ok(id);
    message.clientId = id;
  });
  after(async () => {
    await dbConn.end();
  });
  it("Should create a new message", async (t) => {
    const newMessage = await db.message.create(
      message,
      authId,
      "admin",
      authId
    );
    assert.ok(newMessage);
    assert.deepStrictEqual(typeof newMessage, "object");
    assert.deepStrictEqual(newMessage.message, message.message);
    assert.deepStrictEqual(newMessage.client_id, message.clientId);
    assert.deepStrictEqual(newMessage.id, 1);
  });
});
