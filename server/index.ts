
import { Email } from "./emails/sendEmail";
import { codetNotification } from "./lib/codet_notif";
import { logger } from "./lib/log";
import { validateEnv } from "./lib/validateEnv";
import { startServer } from "./server";
import { Store, redisConnect } from "./lib/redis";
import { dbConn } from "./database/connection";

async function main() {
  await validateEnv();
  // connect to the db
  dbConn.on("connect", () => {
    logger.info("DATABASE CONNECTED");
  });
  dbConn.on("error", async (err, client) => {
    logger.error(err, "ERROR: DATABASE ERROR.");
    await codetNotification.send({
      type: "error",
      text: "DBCONNERR",
    });
    process.exit(1);
  });
  global.mailer = new Email({
    host: process.env.MAIL_HOST,
    password: process.env.MAIL_PASS,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    from: "noreplay@codet.it",
  });
  global.store = await redisConnect(process.env.REDIS_URL)
  const server = await startServer();
  await codetNotification.send({
    type: "success",
    text: "Server started.",
  });
  process.on("SIGINT", async () => {
    logger.info("Closing HTTP SERVER");
    await server.close();
    logger.info("Closing DATABASE");
    await dbConn.end();
    logger.info("FLUSHING MAIL QUEUE");
    await mailer.shutdown();
    logger.info("GRACEFUL EXIT.");
    await codetNotification.send({
      type: "success",
      text: "Graceful shutdown.",
    });
    process.exit(0);
  });
}

main();

declare global {
  var mailer: Email;
  var store: Store
}
