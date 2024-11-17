"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Login from "@/components/auth/Login";
export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl");
  return (
    <Login
      onLoggedIn={() => {
        router.replace(redirectUrl ?? "/dashboard");
      }}
    />
  );
}
