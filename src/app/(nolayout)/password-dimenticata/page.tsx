import { ForgotPasswordPage } from "@/components/client-pages/ForgotPassword";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Password dimenticata | Petrol Service S.R.L.",
};
const Page = () => {
  return <ForgotPasswordPage />;
};
export default Page;
