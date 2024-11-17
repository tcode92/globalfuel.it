import AgenzieTable from "@/components/agenzie/Table";
import DefaultMain from "@/components/layout/DefaultMain";
import { Protected } from "@/components/layout/Protected";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Agenzie | Petrol Service S.R.L.",
};
const Page = () => {
  return (
    <Protected role="admin">
      <DefaultMain>
        <AgenzieTable />
      </DefaultMain>
    </Protected>
  );
};
Page.displayName = "AgenziaPage";
export default Page;
