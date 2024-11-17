import { ReactNode } from "react";

export const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="border border-blux-50 rounded-2xl w-full bg-white">
      {children}
    </div>
  );
};
