import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export default function InputError({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return <div className={cn("text-red-500", className)}>{children}</div>;
}
