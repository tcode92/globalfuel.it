import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "../ui/button";

export function RoundButton({
  children,
  className,
  ...props
}: { className?: string } & ButtonProps) {
  return (
    <Button
      variant={"outline"}
      size={"icon"}
      className={cn("rounded-full w-7 h-7 flex-shrink-0", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
