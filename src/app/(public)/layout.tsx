import Footer from "@/components/layout/Footer";
import { NoLoginHeader } from "@/components/layout/Header";
import { ReactNode } from "react";
import "../globals.css";
import "../style.css";

import DialogUiContainer from "@/components/layout/DialogUiContainer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <NoLoginHeader />
        {children}
        <Footer />
        <DialogUiContainer />
        <ToastContainer />
      </body>
    </html>
  );
}
