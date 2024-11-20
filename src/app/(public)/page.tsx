import { HighLightElement } from "@/components/customComponents/HighlightElement";
import { IRStatic } from "@/components/customComponents/RequiredMark";
import { CardForm } from "@/components/forms/ExternalCardForm";
import { HomePageImg } from "@/components/layout/Header";
import { Metadata } from "next";
import Link from "next/link";
import { BiCreditCardAlt } from "react-icons/bi";
import { FaWhatsapp } from "react-icons/fa";
import { LiaFileContractSolid } from "react-icons/lia";
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
      <section className="flex items-center flex-col mt-8">
        {/* <div className="flex w-full mb-4 gap-4 flex-wrap justify-center items-center">
          <div className="bg-blux-100/35 min-w-[260px] shadow-sm p-2 rounded-full text-center text-blux-800 font-semibold">
            Testo
          </div>
          <div className="bg-blux-100/35 min-w-[260px] shadow-sm p-2 rounded-full text-center text-blux-800 font-semibold">
            Testo
          </div>
          <div className="bg-blux-100/35 min-w-[260px] shadow-sm p-2 rounded-full text-center text-blux-800 font-semibold">
            Testo
          </div>
        </div> */}
        <p className="mb-4 text-4xl font-bold text-center px-6 max-[443px]:text-4xl bg-clip-text text-transparent tbg">
          Non conosci ancora <br />
          il mondo delle fuelcard?
        </p>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://wa.me/+393486819776?text=Salve%2C+vorrei+avere+maggiori+informazioni+sui+vostri+servizi"
          className="bg-green-600 text-white rounded-full p-2 pl-4 shadow-md flex w-max gap-4 px-4 text-2xl items-center"
        >
          Parla con noi <FaWhatsapp className="h-full text-white" />
        </Link>
      </section>
      <div
        className={
          "mx-auto mt-8 max-h-[40vh] w-full max-w-[80vw] px-4 flex items-center justify-center"
        }
      >
        <HomePageImg />
      </div>
      <div className="-mt-10 flex items-center justify-center px-4">
        <Link
          href={"#req-card"}
          className="text-blux font-semibold text-4xl text-center max-[443px]:text-2xl max-[340px]:text-xl cta gradient-box"
        >
          RICHIEDI CARTA
        </Link>
      </div>
      <h1 className="text-4xl max-[400px]:text-xl font-bold text-center mt-11 text-blux-600 px-6 max-[443px]:text-4xl">
        CARTA <br /> IP PLUS
      </h1>
      <section className="flex items-center mt-11 flex-col w-full mx-auto ">
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
        className="flex items-center my-12 flex-col bg-white w-full p-4 rounded-md shadow-md mx-auto justify-center scroll-m-20"
        id="req-card"
      >
        <CardForm />
      </section>
    </main>
  );
};
export default HomePage;
