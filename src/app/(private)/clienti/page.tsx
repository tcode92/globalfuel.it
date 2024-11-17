import { ClientsList } from "@/components/client-pages/ClientsList";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Clienti | Petrol Service S.R.L.",
};
export default function Page() {
  return <ClientsList />;
}
