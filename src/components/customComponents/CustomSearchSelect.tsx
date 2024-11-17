import React, { ReactNode, useState } from "react";
import { Input, InputProps } from "../ui/input";

import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
type CustomSearchSelectProps<T> = {
  items: T[];
  onItem: (item: T | undefined) => void;
  onTextChange: (text: string) => void;
  className?: string;
  selected?: T;
  selectedKey?: keyof T;
  renderer: (item: T) => ReactNode;
  keyId: keyof T;
  dropdownClassName?: string;
} & InputProps;
export default function CustomSearchSelect<T>({
  items,
  onItem,
  onTextChange,
  className,
  keyId,
  renderer,
  selected,
  selectedKey,
  ...props
}: CustomSearchSelectProps<T>) {
  return (
    <div className="flex flex-col w-full">
      <Input
        {...props}
        onChange={(e) => {
          onTextChange(e.target.value);
        }}
      />
      <div className="h-[100px] mt-2 w-full rounded-md border p-4 overflow-x-hidden">
        {items.map((item) => (
          <div
            className={cn(
              "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            )}
            key={item[keyId] as React.Key}
            onClick={() => {
              if (
                selected &&
                selectedKey &&
                item[selectedKey] === selected[selectedKey]
              ) {
                onItem(undefined);
              } else {
                onItem(item);
              }
            }}
          >
            {selected &&
              selectedKey &&
              item[selectedKey] === selected[selectedKey] && (
                <Check className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center" />
              )}
            {renderer(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
