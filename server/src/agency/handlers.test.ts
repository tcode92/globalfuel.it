import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../database/db";
import { Email } from "../../emails/sendEmail";
import { test, before, after, it } from "node:test";
import assert from "node:assert";
import { agencyCreateHandler } from "./handlers";
import { dbConn } from "../../database/connection";
test("Agency endpoint handlers", async (t) => {
  let infoCalled = false;
  const loggerMock = {
    info: () => {
      infoCalled = true;
    },
    child: () => loggerMock,
    debug: () => {},
    error: () => {},
    fatal: () => {},
    level: "info",
    trace: () => {},
    warn: () => {},
    silent: () => {},
  };
  const mailerMock = {
    queueSize: 0,
    send: (args: any) => {},
  };
  before(async () => {
    global.mailer = mailerMock as Email;
  });
  await t.test(
    "Should create a new agency and return the response",
    async () => {
      const agencyData = {
        name: "agency name",
        email: "postnew@agency.it",
      };
      const req: Partial<FastifyRequest> = {
        body: agencyData,
        log: loggerMock,
      };
      let p;
      let c;
      const replay = {
        send: (payload: unknown) => {
          p = payload;
          return replay;
        },
        status: (code: unknown) => {
          c = code;
          return replay;
        },
      } as Partial<FastifyReply> as FastifyReply;
      await agencyCreateHandler(req as FastifyRequest, replay as FastifyReply);
      const dbData = await db.agency.get("postnew@agency.it");
      const dbAgency = dbData.list[0];
      assert.strictEqual(
        infoCalled,
        true,
        "Logger's info method should have been called"
      );
      assert.strictEqual(c, 201, "Reply's send method should have been called");
      assert.deepStrictEqual(
        p,
        dbAgency,
        "Reply's send should have been called with the agency data"
      );
    }
  );
  after(async () => {
    await dbConn.end();
  });
});
