import { Dashboard } from "@/components/client-pages/Dashboard";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dashboard | Petrol Service S.R.L.",
};
export default async function Page() {
  return <Dashboard />;
}
