"use client"
import { useRouter } from "next/navigation";
import Login from "@/components/auth/Login";
export function LoginPage() {
    const router = useRouter();
    return (
      <Login
        onLoggedIn={() => {
          router.replace("/dashboard");
        }}
      />
    );
  }
  