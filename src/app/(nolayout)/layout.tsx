import Footer from "@/components/layout/Footer";
import { ReactNode } from "react";
import "../globals.css";
import "../style.css";
import DialogUiContainer from "@/components/layout/DialogUiContainer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const metadata = {
  title: "My Next.js App",
  description: "An example Next.js application with App Directory layout.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>
        {children}
        <Footer />
        <DialogUiContainer />
        <ToastContainer />
      </body>
    </html>
  );
}
