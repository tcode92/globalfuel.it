import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectCustom<T>({
  values,
  defaultValue,
  placeHolder,
  id,
  name,
  empty,
  onChange,
}: {
  values: (T extends string ? T : never)[];
  defaultValue?: T extends string ? T : never;
  placeHolder?: string;
  id?: string;
  name?: string;
  empty?: string;
  onChange?: (val: T | undefined) => void;
}) {
  const [value, setValue] = React.useState<string | undefined>(
    defaultValue || undefined
  );
  return (
    <>
      <Select
        value={value}
        name={name}
        onValueChange={(val) => {
          if (onChange) onChange((val === "INTERNAL-NONE" ? undefined : val) as T | undefined);
          if (val === "INTERNAL-NONE") {
            setValue("");
          } else {
            setValue(val);
          }
        }}
      >
        <SelectTrigger className="w-full text-left" id={id} aria-label="Open dropdown menu" aria-labelledby={id}>
          <SelectValue placeholder={placeHolder} className="bg-red-500" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {empty && <SelectItem value={"INTERNAL-NONE"}>{empty}</SelectItem>}
            {values.map((val) => (
              <SelectItem key={val} value={val}>
                {val}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}
