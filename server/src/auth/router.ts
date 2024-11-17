import { FastifyPluginAsync } from "fastify";
import {
  authLogoutHandler,
  authResetLoggedInPasswordHandler,
  authWhoAmIHandler
} from "./handlers";

// LoggedIn auth router
const route: FastifyPluginAsync = async (api, opts) => {
  api.post("/logout", authLogoutHandler);
  api.get("/whoami", authWhoAmIHandler);
  api.post("/reset-password", authResetLoggedInPasswordHandler);
};

export const authRouter = route;
