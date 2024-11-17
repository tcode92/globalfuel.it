import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { useAsk } from "./store";

export default function Ask({
  text,
  title,
  id,
  accept,
  deny,
}: {
  text: string;
  title?: string;
  id: string | number;
  accept: (() => void) | (() => Promise<void>);
  deny: () => "dismiss" | null;
}) {
  const { dismiss } = useAsk();
  const [open, setOpen] = useState(true);
  function internalClose() {
    const element = document.getElementById(`${id}-ic`);
    if (element) element.click();
  }
  return (
    <Drawer
      open={open}
      dismissible={false}
      onOpenChange={(val) => {
        setOpen(val);
      }}
      onClose={() => {
        setTimeout(() => {
          dismiss(id);
        }, 1000);
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          {title && <DrawerTitle>{title}</DrawerTitle>}
          <DrawerDescription>{text}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <div className="items-center justify-center flex gap-4">
            <Button
              onClick={async () => {
                const result = deny();
                if (result === "dismiss") internalClose();
              }}
            >
              Annulla
            </Button>
            <Button
              onClick={() => {
                accept();
                internalClose();
              }}
            >
              Si elimina
            </Button>
          </div>
        </DrawerFooter>
        <DrawerClose id={`${id}-ic`} />
      </DrawerContent>
    </Drawer>
  );
}
