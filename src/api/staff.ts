import { models } from "@types";
import { http } from "./base";

class Staff {
  get() {
    return http.get<models.staff.Staff[]>("/api/staff");
  }
  create(data: { name: string; email: string }) {
    return http.post<models.staff.Staff>(`/api/staff`, data);
  }
  update(id: number, data: { name: string; email: string }) {
    return http.put<models.staff.Staff>(`/api/staff/${id}`, data);
  }
  delete(id: number) {
    return http.delete<"OK">(`/api/staff/${id}`);
  }
}
export const staff = new Staff();
