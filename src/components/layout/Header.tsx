"use client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/AuthStore";
import { clearStores } from "@/store/clearStores";
import logo from "@public/logo.png";
import logo2 from "@public/logo2.png";
import Image from "next/image";
import Link from "next/link";
import { redirect, RedirectType, useRouter } from "next/navigation";
import { useRef } from "react";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { RiShutDownLine } from "react-icons/ri";
import { auth as authApi } from "../../api/auth";
import { MessagesHeader } from "../messages/MessagesHeader";
import { resetPasswordDialog } from "../sharedDialogs/ResetPasswordDialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import LinkButton from "../ui/LinkButton";
import { NavLinks, Navigation } from "./Navigation";

const headerStyle =
  "w-full backdrop-blur-sm bg-opacity-90 dark:bg-opacity-10 bg-orangex-400/80 z-10 px-2 sticky top-0";

export function LoggedInHeader() {
  const { auth } = useAuthStore();
  return (
    <header className={cn(headerStyle, "shadow-md")}>
      <div className="max-w-7xl flex items-center justify-between m-auto px-2">
        <Link href="/dashboard">
          <Avatar className="p-2 size-14">
            <Image src={logo} alt="Logo" />
          </Avatar>
        </Link>
        <div className="flex gap-4 items-center">
          <Navigation />
          <MessagesHeader />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback className="p-2 font-bold cursor-pointer select-none bg-orangex-500 text-blux-500 uppercase w-10 h-10 text-2xl">
                  {auth?.name?.[0] || "G"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent collisionPadding={10}>
              <div className="flex-col text-left gap-2 hidden [@media(max-width:535px)]:flex">
                <NavLinks className="text-left py-1 ml-3" />
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem
                onClick={() => {
                  resetPasswordDialog();
                }}
                className="text-green-600 focus:text-green-600"
              >
                <span className="mr-2">
                  <MdOutlineModeEditOutline />
                </span>
                Modifica password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={async () => {
                  await authApi.logout().request;
                  clearStores();
                  redirect("/", RedirectType.replace);
                  return;
                }}
              >
                <span className="mr-2">
                  <RiShutDownLine />
                </span>
                Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function NoLoginHeader() {
  const { authenticated } = useAuthStore();
  const router = useRouter();

  return (
    <header className={cn(headerStyle, "shadow-md")}>
      <div className="max-w-5xl flex items-center justify-between m-auto">
        <Link
          href="/"
          className="flex items-center text-blux-600 font-semibold"
        >
          <Avatar className="p-2 size-14">
            <Image src={logo} alt="Logo" />
          </Avatar>
          <span className="max-[563px]:hidden">PETROL SERVICE S.R.L.</span>
        </Link>
        <div className="flex gap-4 items-center">
          <LinkButton
            href={"/lavora-con-noi"}
            variant={"none"}
            className="text-blux font-semibold p-0 px-1 m-0 text-base"
          >
            Lavora con noi
          </LinkButton>
          <LinkButton
            href={"/accedi"}
            variant={"none"}
            className="text-blux font-semibold p-0 px-1 m-0 text-base"
            onClick={(e) => {
              e.preventDefault();
              if (authenticated) {
                router.push("/dashboard");
              } else {
                router.push("/accedi");
              }
            }}
          >
            Accedi
          </LinkButton>
        </div>
      </div>
    </header>
  );
}

export const HomePageImg = () => {
  const logoRef = useRef<HTMLImageElement>(null);
  return (
    <Image
      src={logo2}
      ref={logoRef}
      alt="Carta carburante"
      sizes="336px"
      priority
      quality={100}
      className="cardlogo"
      onLoad={() => {
        if (logoRef && logoRef.current) {
          logoRef.current.classList.add("animateLogo");
        }
      }}
    />
  );
};
