import Link from "next/link";
import Script from "next/script";
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
export default function Footer() {
  return (
    <footer className="text-white bg-blux-700 w-full mt-auto py-4 px-16">
      <div className=" flex items-center justify-between flex-col md:flex-row gap-4">
        <div className="text-center md:text-left">
          <p>Petrol Service srl</p>
          <p>Via Roma 1, 89013 Gioia Tauro (RC)</p>
          <p>Backoffice: 3276125718</p>
          <p>Agente Francesco Piccolo: 3486819776</p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://wa.me/+393486819776?text=Vorrei acquistare la vostra card"
              className="fixed bottom-2 right-2 bg-green-500 rounded-full p-2 shadow-md"
            >
              <FaWhatsapp className="size-6" />
            </Link>
            <FaInstagram className="size-6" />
            <FaFacebookF className="size-6" />
          </div>
          {/* <div>
            <a
              href="https://www.iubenda.com/privacy-policy/81984893/cookie-policy"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
              title="Cookie Policy "
            >
              Cookie Policy
            </a>
            <Script
              id="iub3"
              dangerouslySetInnerHTML={{
                __html: `(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`,
              }}
            />{" "}
            -{" "}
            <a
              href="https://www.iubenda.com/privacy-policy/81984893"
              className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
              title="Privacy Policy "
            >
              Privacy Policy
            </a>
            <Script
              id="iub4"
              dangerouslySetInnerHTML={{
                __html: `(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`,
              }}
            />
          </div> */}
        </div>
      </div>
      <div className="text-center mt-4">&copy; petrolservice.it 2024</div>
    </footer>
  );
}