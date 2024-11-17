import { ClientState, ClientType } from "@constants";
import { http } from "./base";
import { models } from "@types";

class Client {
  getClients(query?: string, agencyId?: number) {
    if (!query) query = `?page=1`;
    if (query[0] !== "?") query = "?" + query;
    const url = agencyId
      ? `/api/clients/${agencyId}${query}`
      : `/api/clients${query}`;
    return http.get<{
      list: models.client.ClientTable[];
      total: number;
    }>(url);
  }
  getFullClient(id: number) {
    return http.get<models.client.FullClient>(`/api/clients?id=${id}`);
  }
  deleteClient(id: number) {
    return http.delete<"OK">(`/api/clients/delete/${id}`);
  }
  create(data: models.client.FullClient) {
    return http.post<"OK">(`/api/clients`, data);
  }
  createExternal(data: models.client.FullClient) {
    return http.post<"OK">(`/api/newclient`, data);
  }
  update(id: number, data: models.client.FullClient) {
    return http.put(`/api/clients/${id}`, data);
  }
  updateCode(id: number, code: string | null) {
    return http.patch<models.client.ClientTable>(`/api/clients/code/${id}`, {
      code,
    });
  }
  updateState(clientId: number, state: ClientState) {
    return http.patch<models.client.ClientTable>(
      `/api/clients/state/${clientId}`,
      { state }
    );
  }
  updateType(clientId: number, type: ClientType | null) {
    return http.patch<models.client.ClientTable>(
      `/api/clients/type/${clientId}`,
      { type }
    );
  }
}
export const client = new Client();
