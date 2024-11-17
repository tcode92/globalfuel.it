"use client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import DefaultMain from "./DefaultMain";

export const NotFound = ({ text }: { text?: string }) => {
  const router = useRouter();
  return (
    <DefaultMain className="flex items-center flex-1 justify-center">
      <div className="flex gap-4 flex-col items-center">
        {text || "Non abbiamo trovato quello che cerchi."}
        <Button
          variant={"none"}
          className="hover:text-blux"
          onClick={() => {
            router.back();
          }}
        >
          Torna indietro
        </Button>
      </div>
    </DefaultMain>
  );
};
