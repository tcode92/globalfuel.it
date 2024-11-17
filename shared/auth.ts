import { db } from "../server/database/db";
import { AccessToken, RefreshToken, sign, verify } from "../server/lib/jwt";
import { isValidRefreshVersion } from "../server/lib/redis";

export async function getAuthFromTokens(
  accessTokenInp: string | undefined,
  refreshTokenInp: string | undefined,
  // When it's a next layout call, sadly we can't set an access token
  // The response.. so, we don't issue one, we just return and the
  // next server call will set the access token for us.
  // Pretty annoying nextjs, goodjob.
  isNextCall?: boolean
): Promise<{
  user: Omit<AccessToken, "rv">;
  accessToken?: string;
} | null> {
  if (!refreshTokenInp) return null;
  let canRefresh = true;
  if (accessTokenInp) {
    // valida access cookie.
    const cookiePayload = await verify<AccessToken>(
      accessTokenInp,
      process.env.ACCESS_KEY
    );
    if (cookiePayload === false) {
      canRefresh = false;
    }
    if (typeof cookiePayload === "string" && cookiePayload === "EXPIRED") {
      canRefresh = true;
    }
    if (typeof cookiePayload === "object") {
      // assert token version is not invalidated.
      const isValidTokenV = cookiePayload.rv
        ? await isValidRefreshVersion(cookiePayload.id, cookiePayload.rv)
        : false;
      if (!isValidTokenV) {
        // force login token is invalid.
        return null;
      }
      return {
        user: {
          id: cookiePayload.id,
          name: cookiePayload.name,
          role: cookiePayload.role,
          resetPassword: cookiePayload.resetPassword,
        },
        accessToken: undefined,
      };
    }
  }
  if (canRefresh) {
    const cookiePayload = await verify<RefreshToken>(
      refreshTokenInp,
      process.env.REFRESH_KEY
    );
    if (cookiePayload === false || cookiePayload === "EXPIRED") return null;
    // sign new access token
    const id = cookiePayload.id;
    const isValid = cookiePayload.v
      ? await isValidRefreshVersion(cookiePayload.id, cookiePayload.v)
      : false;
    if (!isValid) return null;
    const user = await db.auth.getById(id);
    if (!user || !user.rv || user.rv !== cookiePayload.v) return null;
    // don't issue access token if it's a nextjs call.
    const accessToken = isNextCall
      ? undefined
      : await sign<AccessToken>(
          {
            id: user.id,
            name: user.name,
            role: user.role,
            rv: user.rv,
            resetPassword: user.actions.resetPassword,
          },
          process.env.ACCESS_KEY
        );
    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        resetPassword: user.actions.resetPassword,
      },
      accessToken,
    };
  }
  return null;
}
