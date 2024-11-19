import { EmailPage } from "@/components/client-pages/EmailPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email",
};
export default function Page() {
  return <EmailPage />;
}
