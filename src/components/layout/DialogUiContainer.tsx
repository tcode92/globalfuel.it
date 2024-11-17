"use client"
import { useDialogUiStore } from "@/store/DialogsUiStore";
import React from "react";

export default function DialogUiContainer() {
  const { dialogs } = useDialogUiStore();
  if (dialogs.length === 0) return null;
  return (
    <>
      {dialogs.map((d) => (
        <React.Fragment key={d.id}>{d.dialog}</React.Fragment>
      ))}
    </>
  );
}
