import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { buttonVariants } from "./button";
export default function LinkButton({
  className,
  variant,
  size,
  children,
  href,
  ...props
}: LinkProps & { className?: string; children?: ReactNode } & VariantProps<
    typeof buttonVariants
  >) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Link>
  );
}
