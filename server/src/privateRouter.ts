import { FastifyPluginAsync } from "fastify";
import { authPlugin } from "../fplugins/authplugin";
import { authRouter } from "./auth/router";
import { clientRouter } from "./client/router";
import { agencyRouter } from "./agency/router";
import { fileRouter } from "./file/router";
import { dashboardRouter } from "./dashboard/router";
import { noteRouter } from "./note/router";
import { staffRouter } from "./staff/router";
import { messageRouter } from "./message/router";

const route: FastifyPluginAsync = async (api, opts) => {
  await api.register(authPlugin);
  await api.register(authRouter, { prefix: "/auth" });
  await api.register(clientRouter, { prefix: "/clients" });
  await api.register(agencyRouter, { prefix: "/agencies" });
  await api.register(dashboardRouter, { prefix: "/dashboard" });
  await api.register(noteRouter, { prefix: "/notes" });
  await api.register(fileRouter, { prefix: "/files" });
  await api.register(staffRouter, { prefix: "/staff" });
  await api.register(messageRouter, { prefix: "/msg" });
};

export const privateRouter = route;
