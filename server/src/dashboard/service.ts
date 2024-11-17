import { ClientState, ClientType } from "@constants";
import { db } from "../../database/db";

export const dashboardGetService = async (authId?: number) => {
  const state = await db.dashboard.getClientsState(authId);
  const type = await db.dashboard.getClientsType(authId);
  for (const item of ClientState) {
    if (state.find((i) => i.state === item) === undefined) {
      state.push({ state: item, count: "0" });
    }
  }
  for (const item of ClientType) {
    if (type.find((i) => i.type === item) === undefined) {
      type.push({ type: item, count: "0" });
    }
  }
  return {
    state,
    type,
  };
};

export type DashboardResponse = Awaited<ReturnType<typeof dashboardGetService>>;
