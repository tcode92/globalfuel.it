import { CreateWorkWithUsInput } from "@validation/workWithUs";
import { http } from "./base";
class WorkWithUs {
  create(msg: CreateWorkWithUsInput) {
    return http.post<"OK">(`/api/work-with-us`, msg);
  }
}
export const wwu = new WorkWithUs();
