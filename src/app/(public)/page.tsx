import { HighLightElement } from "@/components/customComponents/HighlightElement";
import { CardForm } from "@/components/forms/ExternalCardForm";
import { HomePageImg } from "@/components/layout/Header";
import { Metadata } from "next";
import Link from "next/link";
import { BiCreditCardAlt } from "react-icons/bi";
import { LiaFileContractSolid } from "react-icons/lia";
import { IconType } from "react-icons/lib";
import { RiSecurePaymentLine } from "react-icons/ri";
export const metadata: Metadata = {
  title: "Petrol Service S.R.L.",
  description:
    "Ottieni sconti esclusivi sul rifornimento di carburante con la nostre carte fedeltà. Richiedila oggi per risparmiare sul tuo prossimo rifornimento!",
  openGraph: {
    title: "Petrol Service S.R.L.",
    description:
      "Ottieni sconti esclusivi sul rifornimento di carburante con la nostre carte fedeltà. Richiedila oggi per risparmiare sul tuo prossimo rifornimento!",
    images: `${process.env.NEXT_PUBLIC_BASE_URL}/og-img.png`,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    type: "website",
  },
};
const HomePage = () => {
  return (
    <main className="px-4 max-w-[934px] mx-auto">
      <div
        className={
          "mx-auto mt-14 h-[350px] px-4 flex items-center justify-center"
        }
      >
        <HomePageImg />
      </div>
      <div className="mt-8 flex items-center justify-center px-4">
        <Link
          href={"#req-card"}
          className="text-blux font-semibold text-4xl text-center max-[443px]:text-2xl cta gradient-box"
        >
          RICHIEDI CARTA
        </Link>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blux to-orangex bg-clip-text text-transparent text-center mt-11 text-blux-600 px-6 max-[443px]:text-4xl">
        CARTA CARBURANTE IP PLUS
      </h1>
      <section className="flex items-center mt-11 flex-col w-full mx-auto">
        <div className="text-3xl font-semibold text-blux-700">Perchè noi?</div>
        <ul className="flex mx-auto mt-11 gap-4 flex-wrap justify-center items-stretch">
          <HighLightElement
            Icon={LiaFileContractSolid}
            title="Flessibilità contrattuale"
            text="Possiamo gestire tutte le formule contrattuali presenti sul
              mercato"
          />
          <HighLightElement
            Icon={BiCreditCardAlt}
            title="Plafond personalizzati"
            text="Per monitorare al meglio le tue transazioni"
          />
          <HighLightElement
            Icon={RiSecurePaymentLine}
            title="Sicurezza negli acquisti"
            text="Tramite PIN code, PIN autista e PIN dinamici"
          />
        </ul>
      </section>
      <section
        className="flex items-center my-12 flex-col bg-white w-full p-4 rounded-md shadow-md mx-auto justify-center"
        id="req-card"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blux to-orangex bg-clip-text text-transparent max-w-4xl text-center mt-4">
          Inserisci i dati per richiedere la tua carta carburante.
        </h2>
        <p className="mb-6 mt-4">
          I campi contrassegnati con <span className="font-bold">*</span> sono
          obbligatori.
        </p>
        <CardForm />
      </section>
    </main>
  );
};
export default HomePage;
