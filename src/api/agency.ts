import { http } from "./base";
import { models } from "@types";
class Agency {
  getAgencies(query?: string) {
    if (!query) query = `?page=1`;
    if (query[0] !== "?") query = "?" + query;
    return http.get<{
      list: models.agency.Agency[];
      total: number;
    }>(`/api/agencies${query}`);
  }
  createAgency(agency: { name: string; email: string }) {
    return http.post<models.agency.Agency>(`/api/agencies`, agency);
  }
  updateAgency(id: number, agency: { name: string; email: string }) {
    return http.put<models.agency.Agency>(`/api/agencies/${id}`, agency);
  }
  deleteAgency(id: number, action: number | "delete" | "system") {
    return http.delete<"OK">(`/api/agencies/${id}?clients=${action}`);
  }
  getOne(id: number) {
    return http.get<models.agency.AgencyDetails>(`/api/agencies/${id}`);
  }
  /* getFullClient(id: number) {
    return http.get<FullClient>(`/api/clients?id=${id}`);
  }
  del(id: number) {
    return http.delete<"OK">(`/api/clients/delete/${id}`);
  } */
}
export const agency = new Agency();
