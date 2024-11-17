import { create } from "zustand";
import { AccessToken } from "../../server/lib/jwt";
import { ROLES } from "@constants";

type Auth = {
  id: number | undefined;
  role: ROLES | undefined;
  name: string | undefined;
};
type AuthStore = {
  authenticated: boolean;
  auth: Auth | null;
  setAuth: (auth: Auth | null) => void;
  firstLoadCheck: boolean;
  setFirstLoadCheck: (val: boolean) => void;
  clearAuth: () => void;
  setSession: (session?: Omit<AccessToken, "rv"> | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  authenticated: false,
  auth: null,
  firstLoadCheck: false,
  setFirstLoadCheck: (val) => {
    set({
      firstLoadCheck: val,
    });
  },
  setAuth: (auth) => {
    set({
      auth,
      authenticated: auth ? true : false,
      firstLoadCheck: true,
    });
  },
  clearAuth() {
    set({
      authenticated: false,
      auth: null,
      firstLoadCheck: false,
    });
  },
  setSession(session) {
    if (session) {
      set({
        authenticated: true,
        firstLoadCheck: true,
        auth: session,
      });
    }
  },
}));
