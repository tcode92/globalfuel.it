import { MessagesPage } from "@/components/client-pages/MessagesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messaggi | Petrol Service S.R.L.",
};
const Page = () => {
  return <MessagesPage />;
};
export default Page;
