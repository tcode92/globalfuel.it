import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";
import { Button } from "../ui/button";
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputPassword = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-14",
            className
          )}
          ref={ref}
          {...props}
        />
        <Button
          className="absolute top-0 right-0 rounded-tl-none rounded-bl-none bg-transparent active:bg-transparent hover:bg-transparent"
          variant={"ghost"}
          type="button"
          onClick={() => {
            setShow((prev) => !prev);
          }}
        >
          {show ? <BiShow /> : <BiHide />}
        </Button>
      </div>
    );
  }
);
InputPassword.displayName = "Input";
export { InputPassword };
