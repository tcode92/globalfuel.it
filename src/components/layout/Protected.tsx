"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import LinkButton from "../ui/LinkButton";
import DefaultMain from "./DefaultMain";
import { useAuthStore } from "@/store/AuthStore";
import { ROLES } from "@constants";

export function Protected({
  text,
  children,
  role,
}: {
  text?: string;
  children?: React.ReactNode;
  role?: ROLES;
}) {
  const router = useRouter();
  const { auth } = useAuthStore();
  if (!auth || (role !== undefined && auth.role !== role)) {
    return (
      <DefaultMain className="flex h-full items-center">
        <div className="mt-10 text-[15vw]">401</div>
        <div className="mt-10 text-base">{text}</div>
        <div className="mt-10 flex flex-wrap gap-2">
          <LinkButton href="/">Vai alla home</LinkButton>
          <Button
            onClick={() => {
              router.back();
            }}
          >
            Torna indietro
          </Button>
        </div>
      </DefaultMain>
    );
  }
  return children;
}
