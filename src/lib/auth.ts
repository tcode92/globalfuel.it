"use server";
import { cookies } from "next/headers";
import { redisConnect } from "../../server/lib/redis";
import { getAuthFromTokens } from "../../shared/auth";
global.store;
export const getSession = async () => {
  if (!global.store) {
    global.store = await redisConnect(process.env.REDIS_URL);
  }
  const biscuits = await cookies();
  const accessToken = biscuits.get("_access")?.value;
  const refreshToken = biscuits.get("_refresh")?.value;
  const auth = await getAuthFromTokens(accessToken, refreshToken, true);
  if (!auth) return null;
  return auth.user;
};
