import { createClient, ErrorReply } from "redis";

import { codetNotification } from "./codet_notif";
import { logger } from "./log";
export type Store = Awaited<ReturnType<typeof redisConnect>>;
export async function redisConnect(url: string) {
  const client = createClient({
    url,
  });
  await client.connect();
  console.count("REDIS CONNECTION COUNT");
  client.on("error", async (err) => {
    if (err instanceof ErrorReply || err instanceof Error) {
      await codetNotification.send({
        text: `Server down, Redis error: ${err.message}`,
        type: "error",
      });
    } else {
      await codetNotification.send({
        text: "Redis unknown error, server is down.",
        type: "error",
      });
    }
    logger.error(err);
    process.exit(1);
  });

  if (client.isReady) {
    logger.info(`Redis connected.`);
  }
  return client;
}
export async function invalidateTokenVersion(
  authId: number,
  tokenVersion: string
) {
  return store.set(`globalfuel:${authId}:${tokenVersion}`, 0, {
    EX: 60 * 16,
  });
}
export async function isValidRefreshVersion(
  authId: number,
  tokenVersion: string
) {
  const result = await store.get(`globalfuel:${authId}:${tokenVersion}`);
  return result === null;
}
