import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export default function InputWrapper({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={(cn("flex flex-col w-full gap-2", className))}>
      {children}
    </div>
  );
}
