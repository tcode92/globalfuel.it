import { create } from "zustand";
import { AccessToken } from "../../server/lib/jwt";
import { ROLES } from "@constants";
import { connect } from "@/api/sse";

type Auth = {
  id: number;
  role: ROLES;
  name: string;
};
type AuthStore = {
  authenticated: boolean;
  auth: Auth | null;
  setAuth: (auth: Auth | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authenticated: false,
  auth: null,
  setAuth: (auth) => {
    set({
      auth,
      authenticated: auth ? true : false,
    });
    connect();
  },
  clearAuth() {
    set({
      authenticated: false,
      auth: null,
    });
  },
}));
