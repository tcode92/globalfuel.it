import { FastifyPluginAsync } from "fastify";

import {
  authForgotPasswordHandler,
  authLoginHandler,
  authResetExternalPasswordHandler,
} from "./auth/handlers";
import { clientCreateExternalHandler } from "./client/handlers";
import { errorReportHandler } from "./errorReport/report";
import { createWorkWithUsHandler } from "./work-with-us/handlers";

const route: FastifyPluginAsync = async (api, opts) => {
  api.post("/work-with-us", createWorkWithUsHandler);
  api.post("/login", authLoginHandler);
  api.post("/auth/forgot-password", authForgotPasswordHandler);
  api.post("/auth/reset-password-external", authResetExternalPasswordHandler);
  api.post("/error-report", errorReportHandler);
  api.post("/newclient", clientCreateExternalHandler);
};

export const publicRouter = route;
