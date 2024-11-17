import { ReactNode } from "react";
import AskContainer from "../ask/AskContainer";
import { LoggedInHeader } from "./Header";

export const Layout = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      <LoggedInHeader />
      {children}
      <AskContainer />
    </>
  );
};
