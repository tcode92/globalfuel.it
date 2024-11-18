import { WorkWithUsForm } from "@/components/client-pages/workWithUsForm";
import { HighLightElement } from "@/components/customComponents/HighlightElement";
import InputError from "@/components/customComponents/InputError";
import InputWrapper from "@/components/customComponents/InputWrapper";
import DefaultMain from "@/components/layout/DefaultMain";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Metadata } from "next";
import { CiGlobe } from "react-icons/ci";
import { FaChartLine } from "react-icons/fa";
import { ImCog } from "react-icons/im";
export const metadata: Metadata = {
  title: "Lavora con noi | Petrol Service S.R.L.",
};
export default function WorkWithUs() {
  return (
    <DefaultMain className="items-center px-4">
      <h1 className="text-blux-600 font-bold text-2xl my-4">Lavora con noi</h1>
      <section className="flex items-center mt-4 flex-col">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blux to-orangex bg-clip-text text-transparent max-w-4xl text-center">
          Diventa nostro partner e offri un servizio esclusivo ai tuoi clienti
        </h2>
        <p className="max-w-4xl mt-4 text-lg">
          Sei un&apos;agenzia automobilistica interessata a fornire un valore
          aggiunto ai tuoi clienti? Diventa nostro partner e offri alle aziende
          di trasporto un modo semplice e conveniente per risparmiare sui
          rifornimenti grazie alle nostre carte carburante.
        </p>
        <h3 className="text-3xl mt-4 text-blux-600">
          Perché collaborare con noi?
        </h3>
        <ul className="mt-6 w-full max-w-4xl flex mx-auto gap-4 flex-wrap justify-center items-stretch">
          <HighLightElement
            Icon={CiGlobe}
            title="Espandere i tuoi servizi"
            text="Aiuta i tuoi clienti a ottimizzare i costi di gestione del carburante."
          />
          <HighLightElement
            Icon={FaChartLine}
            title="Aumentare la soddisfazione"
            text="Offri soluzioni vantaggiose e affidabili per le loro necessità quotidiane."
          />
          <HighLightElement
            Icon={ImCog}
            title="Accesso esclusivo"
            text="Strumenti dedicati per monitorare e gestire le carte carburante."
          />
        </ul>
      </section>
      <section className="flex items-center mt-12 mb-12 flex-col bg-white w-full max-w-4xl p-4 rounded-md shadow-md">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blux to-orangex bg-clip-text text-transparent max-w-4xl text-center">
          Unisciti al nostro network
        </h2>
        <p className="mb-6 mt-4">
          Compila il modulo qui sotto e il nostro team ti contatterà per
          discutere i dettagli della collaborazione.
        </p>
        <WorkWithUsForm />
      </section>
    </DefaultMain>
  );
}
