import {
  AuthLoginInput,
  AuthResetPasswordExternalInput,
  AuthResetPasswordInput,
} from "../../../shared/validation/auth";
import { db } from "../../database/db";
import { genRefreshTokenVersion, sign, verify } from "../../lib/jwt";
import { hashPassword, verifyPassword } from "../../lib/password";
import { invalidateTokenVersion } from "../../lib/redis";
import { KnownError } from "../../utils/error";

export const authLoginService = async (data: AuthLoginInput) => {
  const user = await db.auth.getByEmail(data.email);
  if (!user) return new KnownError("Email o password errati", "error", 401);
  const isSamePassword = await verifyPassword(user.password, data.password);
  if (!isSamePassword)
    return new KnownError("Email o password errati", "error", 401);
  const rv = user.rv || genRefreshTokenVersion();
  if (!user.rv) {
    await db.auth.update(user.id, { rv });
  }
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    rv,
    resetPassword: user.actions.resetPassword,
  };
};

export const authResetPasswordService = async (
  authId: number,
  data: AuthResetPasswordInput
) => {
  const password = await hashPassword(data.password);
  const oldAuth = await db.auth.getById(authId);
  if (!oldAuth) return new KnownError("Utente non trovato.", "error", 401);
  const newTokenVersion = genRefreshTokenVersion(oldAuth.rv || undefined);
  await db.auth.update(authId, { password, actions: {}, rv: newTokenVersion });
  if (oldAuth.rv) await invalidateTokenVersion(oldAuth.id, oldAuth.rv);
  return {
    accessToken: {
      id: oldAuth.id,
      name: oldAuth.name,
      role: oldAuth.role,
      rv: newTokenVersion,
    },
    refreshToken: {
      id: oldAuth.id,
      v: newTokenVersion,
    },
  };
};

export const authResetPasswordExternalService = async (
  data: AuthResetPasswordExternalInput
) => {
  if (!data.token) {
    return new KnownError("Richiesta non valida.", "error", 401);
  }
  const dbToken = await db.auth.getToken(data.token);
  if (!dbToken || dbToken.token !== data.token) {
    return new KnownError("EXPIRED", "error", 401);
  }
  const payload = await verify<{ id: number }>(
    data.token,
    process.env.MAIL_KEY
  );
  if (payload === false) {
    return new KnownError("INVALID", "error", 401);
  }
  if (payload === "EXPIRED") {
    return new KnownError("EXPIRED", "error", 401);
  }
  const authId = payload.id;
  const auth = await db.auth.getById(authId);
  if (!auth) {
    return new KnownError("AuthNotFound", "error", 401); // TODO: return a redirect error.
  }
  const password = await hashPassword(data.password);
  const newTokenVersion = genRefreshTokenVersion(auth.rv ?? undefined);
  if (auth.rv) {
    await invalidateTokenVersion(auth.id, auth.rv);
  }
  await db.auth.update(authId, { password, actions: {}, rv: newTokenVersion });
  await db.auth.deleteToken(authId);

  return {
    accessToken: {
      id: auth.id,
      name: auth.name,
      role: auth.role,
      rv: newTokenVersion,
    },
    refreshToken: { id: auth.id, v: newTokenVersion },
  };
};

export const authForgotPasswordService = async (email: string) => {
  const auth = await db.auth.getByEmail(email);
  if (!auth) {
    // we have no intention in letting him know if email was there or not.
    // just lie and tell him we sent the email to reset.
    return "OK" as const;
  }
  const emailToken = await sign<EmailResetJWTPayload>(
    { id: auth.id },
    process.env.MAIL_KEY,
    10
  );
  await db.auth.createOrUpdateToken(auth.id, emailToken);
  mailer.send({
    template: "reset-password",
    data: {
      name: auth.name,
      passwordResetUrl: `/reimposta-password?token=${emailToken}`,
    },
    to: auth.email,
    subject: "Reimposta la tua password",
    text: `Hai richiesto di reimpostare la tua password.\nPer poter farlo vai al link seguente: https://${process.env.WEBSITE}/reimposta-password?&token=${emailToken}\nIl link è valido per 10 minuti.`,
  });
  return "OK" as const;
};

type EmailResetJWTPayload = {
  id: number;
};

export type LoginResponse = {
  id: number;
  role: "admin" | "agency";
  name: string;
  resetPassword?: true;
};
