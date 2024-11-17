import { FastifyReply, FastifyRequest } from "fastify";
import {
  AuthForgotPasswordSchema,
  AuthLoginSchema,
  AuthResetExternalPasswordSchema,
  AuthResetPasswordSchema,
} from "../../../shared/validation/auth";
import {
  addAccessToken,
  addRefreshToken,
  clearAuthTokens,
} from "../../lib/jwt";
import {
  authForgotPasswordService,
  authLoginService,
  authResetPasswordExternalService,
  authResetPasswordService,
} from "./service";

// Login
export const authLoginHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const body = await AuthLoginSchema.parseAsync(req.body);
  req.log.info(`User ${body.email} attempt login.`);
  const data = await authLoginService(body);
  if (data instanceof Error) {
    return res.err(data.message, data.statusCode);
  }
  await addAccessToken(res, data);
  await addRefreshToken(res, { id: data.id, v: data.rv });
  return res.send({
    id: data.id,
    name: data.name,
    role: data.role,
    resetPassword: data.resetPassword,
  });
};

// Logout
export const authLogoutHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  await clearAuthTokens(res); // not sure how to handle this... TODO: Check if this logic can be shared between next and fastify.
  return "OK";
};

// WhoAmI
export const authWhoAmIHandler = (
  req: FastifyRequest,
  replay: FastifyReply
) => {
  if (req.auth) {
    return replay.status(200).send(req.auth);
  } else {
    return replay.status(401).send("Unauthorized");
  }
};

// Reset password (logged in user)
export const authResetLoggedInPasswordHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const body = await AuthResetPasswordSchema.parseAsync(req.body);
  const result = await authResetPasswordService(req.auth.id, body);
  if (result instanceof Error) {
    return res.err(result.message, result.statusCode);
  }
  await addAccessToken(res, result.accessToken); // Todo: Abstract away how tokens are set, pass a function to the service to set tokens
  await addRefreshToken(res, result.refreshToken); // Todo: Abstract away how tokens are set, pass a function to the service to set tokens
  return "OK" as const;
};

// Reset password (not logged in user)
export const authResetExternalPasswordHandler = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const body = await AuthResetExternalPasswordSchema.parseAsync(req.body);
  const result = await authResetPasswordExternalService(body);
  if (result instanceof Error) {
    return res.err(result.message, result.statusCode);
  }
  // login the auth user
  await addAccessToken(res, result.accessToken);
  await addRefreshToken(res, result.refreshToken);

  return res.redirect("/dashboard");
};

// Forgot password email
export const authForgotPasswordHandler = async (req: FastifyRequest) => {
  const { email } = await AuthForgotPasswordSchema.parseAsync(req.body);
  return await authForgotPasswordService(email);
};
