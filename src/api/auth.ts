import { LoginResponse } from "../../server/src/auth/service";
import { http } from "./base";

class Auth {
  login(body: { email: string; password: string }) {
    return http.post<LoginResponse>(`/api/login`, body);
  }
  logout() {
    return http.post<"OK">("/api/auth/logout");
  }
  whoami() {
    return http.get<LoginResponse>("/api/auth/whoami");
  }
  resetPassword(data: { password: string; passwordConfirm: string }) {
    return http.post<"OK">("/api/auth/reset-password", data);
  }
  resetPasswordWithToken(data: {
    password: string;
    passwordConfirm: string;
    token: string;
  }) {
    return http.post<"OK" | "EXPIRED" | "INVALID">(
      "/api/auth/reset-password-external",
      data
    );
  }
  forgotPassword(data: { email: string }) {
    return http.post<"OK">("/api/auth/forgot-password", data);
  }
}
export const auth = new Auth();
