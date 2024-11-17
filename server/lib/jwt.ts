import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { FastifyReply } from "fastify";

const accessTokenTime =
  process.env.NODE_ENV === "development" ? 365 * (24 * 60) : 5; // minutes
const refreshTokenTime = 365 * (24 * 60); // minutes

import { generateRandomString } from "./random";
export async function sign<T = {}>(
  payload: T,
  key: string,
  durationMinutes?: number
) {
  return await new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload as string | object | Buffer,
      key,
      {
        expiresIn: durationMinutes ? durationMinutes * 60 : "15m",
      },
      (err, token) => {
        if (err) {
          reject(err);
        }
        if (token) resolve(token);
        reject("Unable to generate token string");
      }
    );
  });
}
export async function verify<T = unknown>(
  token: string,
  key: string
): Promise<(T & jwt.JwtPayload) | false | "EXPIRED"> {
  if (!token)
    throw new Error(
      `Invaild token provided for verification, expexted string recived ${typeof token}`
    );

  return await new Promise((resolve) => {
    jwt.verify(token, key, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          resolve("EXPIRED");
          return;
        }
        if (
          process.env.NODE_ENV === "development" &&
          err instanceof JsonWebTokenError &&
          err.message === "invalid signature"
        ) {
          /* log.warn(
            "INVALID ISSUER FOR JWT VERIFICATION, IF THIS IS NOT A DEVELOPMENT ENVIRONMENT SOMETHING VERY BAD HAPPENS."
          ); */
        }
        //log.error({ err, decoded }, "Error verifing jwt token " + token);
        resolve(false);
      }
      resolve(decoded as T & jwt.JwtPayload);
    });
  });
}

export async function clearAuthTokens(res: FastifyReply) {
  removeCookie(res, "_access");
  removeCookie(res, "_refresh");
  return;
}
export async function addAccessToken(res: FastifyReply, token: AccessToken) {
  // sign access token for 5 minutes
  const signedAccessToken = await sign(
    token,
    process.env.ACCESS_KEY!,
    accessTokenTime
  );
  addCookie(res, {
    name: "_access",
    value: signedAccessToken,
    maxAge: 1800,
  });
}
export async function addRefreshToken(res: FastifyReply, token: RefreshToken) {
  // sign refresh token for 2 days
  const signedRefreshToken = await sign(
    token,
    process.env.REFRESH_KEY!,
    refreshTokenTime
  );
  addCookie(res, {
    name: "_refresh",
    value: signedRefreshToken,
    maxAge: 604800,
  });
}
type CookieData = {
  name: string;
  value: string;
  /**
   * @default true
   */
  secure?: boolean;
  /**
   * @default Strict
   */
  sameSite?: "Strict" | "Lax" | "None";
  /**
   * @default /
   */
  path?: string;
  /**
   * Max age in seconds.
   */
  maxAge: number;
};
/**
 *
 * @param res Fastify response
 * @param cookie Cokkie object {@link CookieData}
 *
 * add a cookie to the response with cookie data info
 */
export function addCookie(res: FastifyReply, cookie: CookieData) {
  cookie = Object.assign(cookie, {
    path: "/",
    sameSite: "Strict",
    secure: true,
  });
  let resCookie = `${cookie.name}=${cookie.value}; Domain=${process.env.WEBSITE}; Path=${cookie.path};`;
  if (cookie.secure) {
    resCookie += ` Secure; HttpOnly;`;
  }
  if (cookie.sameSite) {
    resCookie += ` SameSite=${cookie.sameSite}; Max-Age=${cookie.maxAge}`;
  }
  res.header("set-cookie", resCookie);
}
export function removeCookie(res: FastifyReply, cookieName: string) {
  res.header(
    "set-cookie",
    `${cookieName}=; Domain=.${process.env.WEBSITE}; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`
  );
}
export function getTokenTimes(token: string, type: "access" | "refresh") {
  const key =
    type === "access" ? process.env.ACCESS_KEY! : process.env.REFRESH_KEY!;
  const expire = jwt.verify(token, key);
  if (typeof expire !== "string") {
    return new Date().getTime() - (expire.exp || 0);
  }
  return 0;
}

export type AccessToken = {
  id: number;
  name: string;
  role: "admin" | "agency";
  rv: string;
  resetPassword?: boolean;
};
export type RefreshToken = {
  id: number;
  v: string;
};
export type ResetPasswordToken = {
  id: number;
  tokenVersion?: string;
};
export function genRefreshTokenVersion(notEqualTo?: string) {
  let token = generateRandomString(5);
  if (notEqualTo) {
    while (notEqualTo === token) {
      token = generateRandomString(5);
    }
  }
  return token;
}
