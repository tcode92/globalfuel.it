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
    <>
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
      <h1 className="text-center text-4xl mt-11 text-blux-600 font-semibold px-6 max-[443px]:text-4xl">
        CARTA CARBURANTE IP PLUS
      </h1>
      <section className="flex items-center mt-11 flex-col w-full mx-auto max-w-[934px]">
        <div className="text-3xl font-semibold text-blux-700">Perchè noi?</div>
        <div className="flex mx-auto mt-11 gap-4 flex-wrap justify-center px-4 items-stretch">
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
        </div>
      </section>

      <div
        className="w-[100%] mb-24 pt-24 mx-auto flex justify-center px-4"
        id="req-card"
      >
        <div className="w-[100%] max-w-[900px] bg-white p-5 shadow-lg rounded-2xl px-6 flex items-center flex-col">
          <CardForm />
        </div>
      </div>
    </>
  );
};
export default HomePage;

const HighLightElement = ({
  Icon,
  title,
  text,
}: {
  Icon: IconType;
  title: string;
  text: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-3  p-4 rounded-md shadow-lg bg-blux-700 flex-1">
      <Icon className="w-12 h-12  text-orangex-300 " />
      <p className="font-semibold text-white ">{title}</p>
      <p className="text-white text-center">{text}</p>
    </div>
  );
};
