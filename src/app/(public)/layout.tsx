import Footer from "@/components/layout/Footer";
import { NoLoginHeader } from "@/components/layout/Header";
import { ReactNode } from "react";
import "../globals.css";
import "../style.css";

import DialogUiContainer from "@/components/layout/DialogUiContainer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <Script
          type="text/javascript"
          id="iubinit"
          dangerouslySetInnerHTML={{
            __html: `var _iub = _iub || [];
_iub.csConfiguration = {"siteId":3841271,"cookiePolicyId":12804020,"lang":"it","storage":{"useSiteId":true}};`,
          }}
        ></Script>
        <Script
          id="iubblk"
          type="text/javascript"
          src="https://cs.iubenda.com/autoblocking/3841271.js"
        ></Script>

        <Script
          id="iubcs"
          type="text/javascript"
          src="//cdn.iubenda.com/cs/iubenda_cs.js"
          async
        ></Script>
      </head>
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
