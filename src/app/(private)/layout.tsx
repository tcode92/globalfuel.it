import DialogUiContainer from "@/components/layout/DialogUiContainer";
import { LoggedInHeader } from "@/components/layout/Header";
import { getSession } from "@/lib/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../globals.css";
import "../style.css";
import { WithSession } from "./session";
import { MessagesModal } from "@/components/messages/MessageModal";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="it">
      <body>
        <WithSession session={session}>
          <LoggedInHeader />
          {children}
        </WithSession>
        <DialogUiContainer />
        <ToastContainer />
      </body>
    </html>
  );
}
