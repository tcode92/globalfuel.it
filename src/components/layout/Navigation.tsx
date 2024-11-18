import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/AuthStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function Navigation() {
  return (
    <div className="flex justify-self-center self-center items-center justify-center gap-6 rounded-full [@media(max-width:535px)]:hidden">
      <NavLinks className="uppercase text-md" isMobile={false} />
    </div>
  );
}
export function NavLinks({
  className,
  isMobile = true,
}: {
  className?: string;
  isMobile?: boolean;
}) {
  const pathname = usePathname();

  const { auth } = useAuthStore();
  const cname = twMerge(
    cn(
      "text-center text-blux",
      !isMobile && "font-semibold border-b-2 border-b-transparent text-blux",
      className
    )
  );
  if (!pathname) return;
  const activeClass = isMobile
    ? "bg-orangex rounded text-black py-1 ml-0 pl-3"
    : "border-b-2 border-b-orangex-500 text-blux";
  const active = (path: string) =>
    cn(
      cname,
      pathname === path ||
        (path === "/agenzie" && pathname.startsWith("/agenzie/")) ||
        (path === "/clienti" && pathname.startsWith("/clienti/"))
        ? activeClass
        : undefined
    );
  return (
    <>
      <Link href="/dashboard" className={active("/dashboard")}>
        Home
      </Link>
      {auth?.role === "admin" && (
        <Link href="/agenzie" className={active("/agenzie")}>
          Agenzie
        </Link>
      )}
      <Link href="/clienti" className={active("/clienti")}>
        Clienti
      </Link>
      {auth?.role === "admin" && (
        <Link href="/staff" className={active("/staff")}>
          Staff
        </Link>
      )}
      {/* {auth?.role === "admin" && (
        <Link
          href="/richieste-lavora-con-not"
          className={active("/richieste-lavora-con-not")}
        >
          LCN
        </Link>
      )}
      {auth?.role === "admin" && (
        <Link href="/email" className={active("/email")}>
          Stato email
        </Link>
      )} */}
    </>
  );
}
