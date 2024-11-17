import { FastifyPluginAsync } from "fastify";

import { errorReportHandler } from "./errorReport/report";
import { clientCreateExternalHandler } from "./client/handlers";
import {
  authForgotPasswordHandler,
  authLoginHandler,
  authResetExternalPasswordHandler,
} from "./auth/handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  api.post("/login", authLoginHandler);
  api.post("/auth/forgot-password", authForgotPasswordHandler);
  api.post("/auth/reset-password-external", authResetExternalPasswordHandler);
  api.post("/error-report", errorReportHandler);
  api.post("/newclient", clientCreateExternalHandler);
};

export const publicRouter = route;
