import { PasswordResetPage } from "@/components/client-pages/ResetPasswordPage";
import { Metadata } from "next";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Reimposta password | Petrol Service S.R.L.",
};
export default function Page() {
  return (
    <Suspense>
      <PasswordResetPage />
    </Suspense>
  );
}
