"use client";
import { useAuthStore } from "@/store/AuthStore";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useMemo } from "react";
import { AccessToken } from "../../../server/lib/jwt";
import { resetPasswordDialog } from "@/components/sharedDialogs/ResetPasswordDialog";

export const WithSession = ({
  children,
  session,
}: {
  children: ReactNode;
  session: Omit<AccessToken, "rv"> | null;
}) => {
  const search = useSearchParams();
  const path = usePathname();
  const currentUrl = useMemo(() => new URLSearchParams(), []);
  currentUrl.set("redirectUrl", path + "?" + search);
  const { setAuth, authenticated } = useAuthStore();
  useEffect(() => {
    if (!session) {
      return redirect(`/accedi?${currentUrl}`);
    } else {
      setAuth(session);
      if (session.resetPassword) {
        resetPasswordDialog(undefined, true);
      }
    }
  }, [session, currentUrl, setAuth]);
  if (authenticated) {
    return children;
  } else {
    return null;
  }
};
