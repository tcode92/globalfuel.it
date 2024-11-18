import DefaultMain from "@/components/layout/DefaultMain";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "QR Codes",
};
export default function QrPage() {
  const QrImage = ({ title, src }: { title: string; src: string }) => {
    return (
      <li className="flex items-center flex-col justify-center">
        <div className="text-3xl font-bold">{title}</div>
        <img src={src} className="aspect-square max-h-[500px]" />
      </li>
    );
  };
  return (
    <DefaultMain>
      <ul className="flex flex-col gap-8">
        <QrImage title="Pagina iniziale" src="/qr/qr-code (2).png" />
        <QrImage title="Pagina iniziale form" src="/qr/qr-code (1).png" />
        <QrImage title="Lavora con noi" src="/qr/qr-code (3).png" />
      </ul>
    </DefaultMain>
  );
}
