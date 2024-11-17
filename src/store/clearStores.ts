import { useAgencyStore } from "./AgencyStore";
import { useAuthStore } from "./AuthStore";
import { useClientStore } from "./ClientStore";

export function clearStores() {
  useClientStore.getState().clearClients();
  useAuthStore.getState().clearAuth();
  useAgencyStore.getState().clearAgency();
}
