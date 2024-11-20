import { db } from "../../database/db";

import { describe, before, after, it } from "node:test";
import assert from "node:assert";
import { dbConn } from "../../database/connection";
import { models } from "database/models/types";
import { ClientCreateUpdateInput } from "@validation/client";
describe("Note Database Functions", () => {
  const authData: models.auth.AuthCreateInput = {
    email: "authnotetest@email.com",
    name: "test auth",
    password: "test-password",
    role: "admin",
  };
  const clientData: ClientCreateUpdateInput = {
    address: "",
    business: "",
    email: "",
    fg: "assoc.",
    pec: "",
    phone: "",
    vat: "123",
  };
  let clientId: number;
  let noteId: number;
  before(async () => {
    const newAuth = await db.auth.create(authData);
    const newClient = await db.client.create(newAuth.id, clientData);
    clientId = newClient;
  });

  it("Should create a note", async () => {
    const text = "THIS IS A TEST NOTE";
    const newNote = await db.note.create(clientId, "THIS IS A TEST NOTE");
    noteId = newNote.id;
    assert.deepStrictEqual(newNote.text, text);
    assert.ok(newNote.id > 0);
  });
  it("Should update note", async () => {
    const text = "UPDATED";
    const updatedNote = await db.note.update(noteId, text);
    assert.deepStrictEqual(updatedNote.text, text);
  });
  it("Should delete note", async () => {
    const result = await db.note.del(noteId);
    assert.ok(result);
  });

  after(async () => {
    await dbConn.end();
  });
});
