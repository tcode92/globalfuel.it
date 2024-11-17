import { DashboardResponse } from "../../server/src/dashboard/service";
import { http } from "./base";

class Dashboard {
  stats() {
    return http.get<DashboardResponse>(`/api/dashboard`);
  }
}
export const dashboard = new Dashboard();
