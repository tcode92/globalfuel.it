"use client";
import { auth } from "@/api/auth";
import { resetPasswordDialog } from "@/components/sharedDialogs/ResetPasswordDialog";
import { useAuthStore } from "@/store/AuthStore";
import { redirect } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { AccessToken } from "../../../server/lib/jwt";

export const WithSession = ({
  children,
  session,
}: {
  children: ReactNode;
  session?: Omit<AccessToken, "rv"> | null;
}) => {
  // TODO: we can get rid of the useEffect
  const {
    setAuth,
    firstLoadCheck,
    setFirstLoadCheck,
    authenticated,
    setSession,
  } = useAuthStore();

  useEffect(() => {
    if (session) {
      setSession(session);
      return;
    }
    if (firstLoadCheck) return;
    const { request, abort } = auth.whoami();
    request.then((response) => {
      const { success, data, error } = response;
      if (success) {
        setFirstLoadCheck(true);
        setAuth({
          id: data.id,
          name: data.name,
          role: data.role,
        });
        if (data.resetPassword && process.env.NODE_ENV !== "development") {
          resetPasswordDialog(undefined, true);
        }
      }
      if (error && !error.isAbortError) {
        setFirstLoadCheck(true);
      }
    });

    return () => {
      abort();
    };
  }, [firstLoadCheck, setAuth, setFirstLoadCheck, session, setSession]);
  if (authenticated) {
    return children;
  }
  if (firstLoadCheck && !authenticated) {
    redirect("/accedi");
  }
  return null;
};
