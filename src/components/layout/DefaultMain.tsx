import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export default function DefaultMain({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={twMerge(
        twMerge(
          cn(
            "flex flex-col justify-start h-full w-full max-w-7xl mx-auto p-2",
            className
          )
        )
      )}
    >
      {children}
    </main>
  );
}
