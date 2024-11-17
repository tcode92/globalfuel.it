import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { TableCell, TableRow } from "../ui/table";

const NoResultVariants = {
  small: "text-center mb-2 text-xs",
  default: "text-center",
};
export function NoResult({
  text,
  children,
  className,
  variant = "default",
}: {
  text?: string;
  children?: ReactNode;
  className?: string;
  variant?: keyof typeof NoResultVariants;
}) {
  return (
    <div className={cn(NoResultVariants[variant], className)}>
      {text || children}
    </div>
  );
}
export function NoResultRow({
  text,
  children,
  className,
  span,
  variant = "default",
}: {
  text?: string;
  children?: ReactNode;
  className?: string;
  span?: number;
  variant?: keyof typeof NoResultVariants;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={span}
        className={cn(NoResultVariants[variant], className)}
      >
        {text || children}
      </TableCell>
    </TableRow>
  );
}
