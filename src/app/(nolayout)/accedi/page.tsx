import { LoginPage } from "@/components/client-pages/LoginPage";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Accedi | Petrol Service S.R.L.",
};
export default function Page() {
  return <LoginPage />;
}
