import React, { ReactNode } from "react";

export function CardTitle({ children }: { children?: ReactNode }) {
  return (
    <div className="px-4 mt-4 font-bold text-sm text-gray-400 flex justify-between">
      {children}
    </div>
  );
}
