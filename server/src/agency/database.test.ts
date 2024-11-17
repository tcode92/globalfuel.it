import { test, it, after } from "node:test";
import { dbConn } from "../../database/connection";
import assert from "assert";
import {
  AgencyCreateInput,
  AgencyUpdateInput,
} from "../../../shared/validation/agency";
import { db } from "../../database/db";

test("Agency Database Functions", async () => {
  const agencyData: AgencyCreateInput & { password: string } = {
    email: "agencytest@email.com",
    name: "agency test name",
    password: "test-password",
  };
  const validateDatatypes = (obj: any, types: any) => {
    assert.deepStrictEqual(obj, types);
  };
  let agencyId: number;

  await it("Should create a new agency", async () => {
    const newAgency = await db.agency.create(agencyData);
    assert.ok(newAgency.id, "Agency ID should be defined");
    assert.strictEqual(typeof newAgency.id, "number");
    assert.strictEqual(newAgency.email, agencyData.email);
    assert.strictEqual(newAgency.name, agencyData.name);
    assert.strictEqual(newAgency.clients, 0);
    agencyId = newAgency.id;
  });
  await it("Should get agency list with pagination", async () => {
    const agencies = await db.agency.get(undefined, 1, 10);
    assert.ok(agencies.total, "Total count should be defined");
    assert.strictEqual(typeof agencies.total, "number");
    assert.ok(Array.isArray(agencies.list), "Agency list should be an array");
  });
  await it("Should return agency by id", async () => {
    const agency = await db.agency.getById(agencyId);
    const expectedAgency = {
      name: agencyData.name,
      email: agencyData.email,
      clients: 0,
      id: agencyId,
    };
    assert.deepStrictEqual(
      agency,
      expectedAgency,
      "Fetched agency should match expected values"
    );
  });
  await it("Should update agency", async () => {
    const updateData: AgencyUpdateInput = {
      email: "updated@email.com",
      name: "updated name",
    };
    const updated = await db.agency.update(agencyId, updateData);
    assert.strictEqual(
      updated.name,
      updateData.name,
      "Agency name should be updated"
    );
    assert.strictEqual(
      updated.email,
      updateData.email,
      "Agency email should be updated"
    );
  });
  await it("Should delete agency and clients", async () => {
    const files = await db.agency.del(agencyId, "delete");
    assert.ok(
      Array.isArray(files.filesToDelete),
      "Deleted files should be an array"
    );
    const agency = await db.agency.getById(agencyId);
    assert.strictEqual(agency, null, "Agency should no longer exist");
  });

  after(async () => {
    await dbConn.end();
  });
});
